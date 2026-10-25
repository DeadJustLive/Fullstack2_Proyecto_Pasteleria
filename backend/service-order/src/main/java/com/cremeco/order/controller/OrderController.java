package com.cremeco.order.controller;

import com.cremeco.common.events.OrderPlacedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired(required = false)
    private KafkaTemplate<String, Object> kafkaTemplate;

    private final List<Map<String, Object>> mockPedidos = new ArrayList<>(List.of(
            new HashMap<>(Map.of(
                    "id", 1,
                    "trackingCode", "CC-1001",
                    "cliente", "Camila Silva",
                    "email", "camila@example.cl",
                    "estado", "EN_PREPARACION",
                    "total", 46980,
                    "fecha", "2026-10-24 10:30",
                    "items", List.of(
                            Map.of("nombre", "Torta Ópera Francesa", "cantidad", 1, "precio", 24990),
                            Map.of("nombre", "Cheesecake de Frutos Rojos", "cantidad", 1, "precio", 21990)
                    )
            )),
            new HashMap<>(Map.of(
                    "id", 2,
                    "trackingCode", "CC-1002",
                    "cliente", "Rodrigo Tapia",
                    "email", "rodrigo@example.cl",
                    "estado", "LISTO_RETIRO",
                    "total", 23990,
                    "fecha", "2026-10-24 11:15",
                    "items", List.of(
                            Map.of("nombre", "Torta Selva Negra Tradicional", "cantidad", 1, "precio", 23990)
                    )
            ))
    ));

    @GetMapping
    public ResponseEntity<?> listOrders() {
        return ResponseEntity.ok(mockPedidos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@PathVariable int id) {
        return mockPedidos.stream()
                .filter(p -> (int) p.get("id") == id)
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/tracking/{code}")
    public ResponseEntity<?> getTracking(@PathVariable String code) {
        String cleanCode = code.replace("#", "").trim().toUpperCase();
        return mockPedidos.stream()
                .filter(p -> ((String) p.get("trackingCode")).equalsIgnoreCase(cleanCode))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {
        int nextId = mockPedidos.size() + 1;
        String trackingCode = "CC-" + (1000 + nextId);

        Map<String, Object> nuevo = new HashMap<>(data);
        nuevo.put("id", nextId);
        nuevo.put("trackingCode", trackingCode);
        nuevo.put("estado", "RECIBIDO");
        nuevo.put("fecha", LocalDateTime.now().toString());
        mockPedidos.add(nuevo);

        // Si Kafka está configurado, publicamos el evento
        if (kafkaTemplate != null) {
            try {
                OrderPlacedEvent event = OrderPlacedEvent.builder()
                        .orderId((long) nextId)
                        .orderNumber("#" + trackingCode)
                        .customerEmail((String) data.get("email"))
                        .customerName((String) data.get("cliente"))
                        .totalAmountClp(data.get("total") != null ? Long.valueOf(data.get("total").toString()) : 0L)
                        .placedAt(LocalDateTime.now())
                        .build();
                kafkaTemplate.send("cremeco.orders.placed", trackingCode, event);
            } catch (Exception ignored) {
                // Modo resiliente si Kafka aún no está arrancado
            }
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable int id, @RequestBody Map<String, String> body) {
        String nuevoEstado = body.get("estado");
        for (Map<String, Object> p : mockPedidos) {
            if ((int) p.get("id") == id) {
                p.put("estado", nuevoEstado);
                return ResponseEntity.ok(p);
            }
        }
        return ResponseEntity.notFound().build();
    }
}
