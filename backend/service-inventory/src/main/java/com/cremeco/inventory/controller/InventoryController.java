package com.cremeco.inventory.controller;

import com.cremeco.inventory.model.InventoryItemEntity;
import com.cremeco.inventory.model.KardexMovementEntity;
import com.cremeco.inventory.repository.InventoryItemRepository;
import com.cremeco.inventory.repository.KardexMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryItemRepository inventoryItemRepository;
    private final KardexMovementRepository kardexMovementRepository;

    @GetMapping("/items")
    public ResponseEntity<List<InventoryItemEntity>> listItems() {
        return ResponseEntity.ok(inventoryItemRepository.findAll());
    }

    @GetMapping("/items/critical")
    public ResponseEntity<List<InventoryItemEntity>> listCriticalItems() {
        // Semáforo ROJO o stock menor o igual al mínimo
        List<InventoryItemEntity> criticos = inventoryItemRepository.findAll().stream()
                .filter(item -> "ROJO".equalsIgnoreCase(item.getEstadoSemaforo())
                        || "AMARILLO".equalsIgnoreCase(item.getEstadoSemaforo())
                        || item.getStockActual() <= item.getStockMinimo())
                .toList();
        return ResponseEntity.ok(criticos);
    }

    @GetMapping("/kardex")
    public ResponseEntity<List<KardexMovementEntity>> getKardex() {
        return ResponseEntity.ok(kardexMovementRepository.findAllByOrderByFechaDesc());
    }

    @GetMapping("/kardex/product/{productId}")
    public ResponseEntity<List<KardexMovementEntity>> getKardexByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(kardexMovementRepository.findByProductoIdOrderByFechaDesc(productId));
    }

    @PostMapping("/pos/sale")
    public ResponseEntity<?> registerPosSale(@RequestBody Map<String, Object> saleData) {
        String boleta = "B-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Long productoId = saleData.get("productoId") != null ? Long.valueOf(saleData.get("productoId").toString()) : null;
        String productoNombre = (String) saleData.getOrDefault("producto", "Venta mostrador POS");
        int cantidad = saleData.get("cantidad") != null ? Integer.parseInt(saleData.get("cantidad").toString()) : 1;
        String usuario = (String) saleData.getOrDefault("usuario", "pasteleria@cremeco.cl");

        int saldoRestante = 0;
        if (productoId != null) {
            Optional<InventoryItemEntity> itemOpt = inventoryItemRepository.findByProductoId(productoId);
            if (itemOpt.isPresent()) {
                InventoryItemEntity item = itemOpt.get();
                item.setStockActual(Math.max(0, item.getStockActual() - cantidad));
                item.calcularSemaforo();
                inventoryItemRepository.save(item);
                saldoRestante = item.getStockActual();
                productoNombre = item.getNombre();
            }
        }

        KardexMovementEntity movimiento = KardexMovementEntity.builder()
                .productoId(productoId)
                .productoNombre(productoNombre)
                .tipo("VENTA_POS")
                .cantidad(-cantidad)
                .saldo(saldoRestante)
                .motivo("Venta POS Boleta " + boleta)
                .usuario(usuario)
                .boleta(boleta)
                .fecha(LocalDateTime.now())
                .build();

        kardexMovementRepository.save(movimiento);

        Map<String, Object> respuesta = new HashMap<>(saleData);
        respuesta.put("boleta", boleta);
        respuesta.put("fecha", LocalDateTime.now().toString());
        respuesta.put("estado", "PAGADO_EXITOSO");
        respuesta.put("saldoRestante", saldoRestante);

        return ResponseEntity.ok(respuesta);
    }

    @PostMapping("/merma")
    public ResponseEntity<?> registerMerma(@RequestBody Map<String, Object> mermaData) {
        Long productoId = mermaData.get("productoId") != null ? Long.valueOf(mermaData.get("productoId").toString()) : null;
        String productoNombre = (String) mermaData.getOrDefault("producto", "Merma no especificada");
        int cantidad = mermaData.get("cantidad") != null ? Integer.parseInt(mermaData.get("cantidad").toString()) : 1;
        String motivo = (String) mermaData.getOrDefault("motivo", "Merma de producción");
        String usuario = (String) mermaData.getOrDefault("usuario", "cocina@cremeco.cl");

        int saldoRestante = 0;
        if (productoId != null) {
            Optional<InventoryItemEntity> itemOpt = inventoryItemRepository.findByProductoId(productoId);
            if (itemOpt.isPresent()) {
                InventoryItemEntity item = itemOpt.get();
                item.setStockActual(Math.max(0, item.getStockActual() - cantidad));
                item.calcularSemaforo();
                inventoryItemRepository.save(item);
                saldoRestante = item.getStockActual();
                productoNombre = item.getNombre();
            }
        }

        KardexMovementEntity movimiento = KardexMovementEntity.builder()
                .productoId(productoId)
                .productoNombre(productoNombre)
                .tipo("MERMA")
                .cantidad(-cantidad)
                .saldo(saldoRestante)
                .motivo(motivo)
                .usuario(usuario)
                .fecha(LocalDateTime.now())
                .build();

        KardexMovementEntity saved = kardexMovementRepository.save(movimiento);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/restock")
    public ResponseEntity<?> registerRestock(@RequestBody Map<String, Object> restockData) {
        Long productoId = restockData.get("productoId") != null ? Long.valueOf(restockData.get("productoId").toString()) : null;
        int cantidad = restockData.get("cantidad") != null ? Integer.parseInt(restockData.get("cantidad").toString()) : 0;
        String motivo = (String) restockData.getOrDefault("motivo", "Recepción de lote de cocina");
        String usuario = (String) restockData.getOrDefault("usuario", "cocina@cremeco.cl");

        if (productoId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "PRODUCTO_REQUERIDO", "mensaje", "productoId es obligatorio"));
        }

        Optional<InventoryItemEntity> itemOpt = inventoryItemRepository.findByProductoId(productoId);
        if (itemOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "NOT_FOUND", "mensaje", "Ítem de inventario no encontrado"));
        }

        InventoryItemEntity item = itemOpt.get();
        item.setStockActual(item.getStockActual() + cantidad);
        item.calcularSemaforo();
        inventoryItemRepository.save(item);

        KardexMovementEntity movimiento = KardexMovementEntity.builder()
                .productoId(productoId)
                .productoNombre(item.getNombre())
                .tipo("INGRESO_COCINA")
                .cantidad(cantidad)
                .saldo(item.getStockActual())
                .motivo(motivo)
                .usuario(usuario)
                .fecha(LocalDateTime.now())
                .build();

        kardexMovementRepository.save(movimiento);

        return ResponseEntity.ok(item);
    }
}
