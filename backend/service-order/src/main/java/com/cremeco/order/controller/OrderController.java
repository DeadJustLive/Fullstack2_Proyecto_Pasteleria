package com.cremeco.order.controller;

import com.cremeco.common.events.OrderPlacedEvent;
import com.cremeco.order.model.CustomQuoteEntity;
import com.cremeco.order.model.OrderEntity;
import com.cremeco.order.model.OrderItemEntity;
import com.cremeco.order.repository.CustomQuoteRepository;
import com.cremeco.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class OrderController {

    private final OrderRepository orderRepository;
    private final CustomQuoteRepository customQuoteRepository;

    @Autowired(required = false)
    private KafkaTemplate<String, Object> kafkaTemplate;

    // ==========================================
    // ÓRDENES Y BOLETAS (DSY1104)
    // ==========================================

    @GetMapping
    public ResponseEntity<List<OrderEntity>> listOrders() {
        return ResponseEntity.ok(orderRepository.findAllByOrderByFechaDesc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@PathVariable Long id) {
        return orderRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "NOT_FOUND", "mensaje", "Pedido no encontrado con ID: " + id)));
    }

    @GetMapping("/tracking/{code}")
    public ResponseEntity<?> getTracking(@PathVariable String code) {
        String cleanCode = code.replace("#", "").trim();
        return orderRepository.findByTrackingCodeIgnoreCase(cleanCode)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "NOT_FOUND", "mensaje", "Pedido no encontrado con código: " + code)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderEntity>> getOrdersByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(orderRepository.findByUserIdOrderByFechaDesc(userId));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<List<OrderEntity>> getOrdersByEmail(@PathVariable String email) {
        return ResponseEntity.ok(orderRepository.findByEmailIgnoreCaseOrderByFechaDesc(email));
    }

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderEntity order) {
        if (order.getTrackingCode() == null || order.getTrackingCode().isBlank()) {
            long count = orderRepository.count() + 1;
            order.setTrackingCode("CC-" + (1000 + count));
        }

        if (order.getFecha() == null) {
            order.setFecha(LocalDateTime.now());
        }

        if (order.getEstado() == null || order.getEstado().isBlank()) {
            order.setEstado("PAGADO");
        }

        // Si se proveen ítems, vincularlos con la orden
        if (order.getItems() != null) {
            for (OrderItemEntity item : order.getItems()) {
                item.setOrder(order);
                if (item.getSubtotal() == null && item.getPrecio() != null && item.getCantidad() != null) {
                    item.setSubtotal(item.getPrecio() * item.getCantidad());
                }
            }
        }

        // Cálculo de IVA si falta
        if (order.getIva() == null && order.getTotal() != null) {
            order.setIva(Math.round(order.getTotal() * 0.19 / 1.19));
        }

        OrderEntity saved = orderRepository.save(order);

        // Notificar por Kafka si está disponible
        if (kafkaTemplate != null) {
            try {
                OrderPlacedEvent event = OrderPlacedEvent.builder()
                        .orderId(saved.getId())
                        .orderNumber("#" + saved.getTrackingCode())
                        .customerEmail(saved.getEmail())
                        .customerName(saved.getCliente())
                        .totalAmountClp(saved.getTotal())
                        .placedAt(saved.getFecha())
                        .build();
                kafkaTemplate.send("cremeco.orders.placed", saved.getTrackingCode(), event);
            } catch (Exception ex) {
                log.warn("Kafka no disponible para emitir OrderPlacedEvent: {}", ex.getMessage());
            }
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String nuevoEstado = body.get("estado");
        if (nuevoEstado == null || nuevoEstado.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "ESTADO_REQUERIDO", "mensaje", "El campo 'estado' es obligatorio"));
        }

        return orderRepository.findById(id).<ResponseEntity<?>>map(order -> {
            order.setEstado(nuevoEstado);
            OrderEntity updated = orderRepository.save(order);
            return ResponseEntity.ok(updated);
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "NOT_FOUND", "mensaje", "Pedido no encontrado")));
    }

    @PutMapping("/{id}/pickup-person")
    public ResponseEntity<?> updatePickupPerson(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return orderRepository.findById(id).<ResponseEntity<?>>map(order -> {
            if (body.containsKey("nombre")) order.setPersonaRetiroNombre(body.get("nombre"));
            if (body.containsKey("rut")) order.setPersonaRetiroRut(body.get("rut"));
            if (body.containsKey("telefono")) order.setPersonaRetiroTelefono(body.get("telefono"));
            OrderEntity updated = orderRepository.save(order);
            return ResponseEntity.ok(updated);
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "NOT_FOUND", "mensaje", "Pedido no encontrado")));
    }

    // ==========================================
    // COTIZACIONES PERSONALIZADAS (DSY1104)
    // ==========================================

    @GetMapping("/quotes")
    public ResponseEntity<List<CustomQuoteEntity>> listQuotes() {
        return ResponseEntity.ok(customQuoteRepository.findAllByOrderByFechaDesc());
    }

    @GetMapping("/quotes/user")
    public ResponseEntity<List<CustomQuoteEntity>> listUserQuotes(@RequestParam String email) {
        return ResponseEntity.ok(customQuoteRepository.findByEmailIgnoreCaseOrderByFechaDesc(email));
    }

    @PostMapping("/quotes")
    public ResponseEntity<?> createQuote(@RequestBody CustomQuoteEntity quote) {
        if (quote.getFecha() == null) quote.setFecha(LocalDateTime.now());
        if (quote.getEstado() == null) quote.setEstado("RECIBIDA");

        CustomQuoteEntity saved = customQuoteRepository.save(quote);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/quotes/{id}/status")
    public ResponseEntity<?> updateQuoteStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return customQuoteRepository.findById(id).<ResponseEntity<?>>map(quote -> {
            if (body.containsKey("estado")) quote.setEstado(body.get("estado").toString());
            if (body.containsKey("montoEstimado")) {
                quote.setMontoEstimado(Long.valueOf(body.get("montoEstimado").toString()));
            }
            CustomQuoteEntity updated = customQuoteRepository.save(quote);
            return ResponseEntity.ok(updated);
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "NOT_FOUND", "mensaje", "Cotización no encontrada")));
    }
}
