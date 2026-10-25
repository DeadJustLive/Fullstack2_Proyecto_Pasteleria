package com.cremeco.inventory.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final List<Map<String, Object>> mockKardex = new ArrayList<>(List.of(
            new HashMap<>(Map.of("id", 1, "producto", "Torta Ópera Francesa", "tipo", "VENTA_POS", "cantidad", -1, "fecha", "2026-10-24 10:15", "saldo", 8)),
            new HashMap<>(Map.of("id", 2, "producto", "Cheesecake de Frutos Rojos", "tipo", "INGRESO_COCINA", "cantidad", 10, "fecha", "2026-10-24 08:30", "saldo", 12)),
            new HashMap<>(Map.of("id", 3, "producto", "Croissant de Mantequilla", "tipo", "MERMA", "cantidad", -2, "motivo", "Quebrado en horneado", "fecha", "2026-10-24 09:00", "saldo", 25))
    ));

    @GetMapping("/kardex")
    public ResponseEntity<?> getKardex() {
        return ResponseEntity.ok(mockKardex);
    }

    @PostMapping("/pos/sale")
    public ResponseEntity<?> registerPosSale(@RequestBody Map<String, Object> saleData) {
        String boleta = "B-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Map<String, Object> respuesta = new HashMap<>(saleData);
        respuesta.put("boleta", boleta);
        respuesta.put("timestamp", LocalDateTime.now().toString());
        respuesta.put("estado", "PAGADO_EXITOSO");

        mockKardex.add(new HashMap<>(Map.of(
                "id", mockKardex.size() + 1,
                "producto", "Venta POS " + boleta,
                "tipo", "VENTA_POS",
                "cantidad", -1,
                "fecha", LocalDateTime.now().toString(),
                "saldo", 99
        )));

        return ResponseEntity.ok(respuesta);
    }

    @PostMapping("/merma")
    public ResponseEntity<?> registerMerma(@RequestBody Map<String, Object> mermaData) {
        Map<String, Object> registro = new HashMap<>(mermaData);
        registro.put("id", mockKardex.size() + 1);
        registro.put("tipo", "MERMA");
        registro.put("fecha", LocalDateTime.now().toString());
        mockKardex.add(registro);
        return ResponseEntity.ok(registro);
    }
}
