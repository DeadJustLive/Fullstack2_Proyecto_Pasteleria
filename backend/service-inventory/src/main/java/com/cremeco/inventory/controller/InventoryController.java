package com.cremeco.inventory.controller;

import com.cremeco.inventory.model.InventoryItemEntity;
import com.cremeco.inventory.model.KardexMovementEntity;
import com.cremeco.inventory.repository.InventoryItemRepository;
import com.cremeco.inventory.repository.KardexMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryItemRepository inventoryItemRepository;
    private final KardexMovementRepository kardexMovementRepository;
    private final JdbcTemplate jdbcTemplate;

    @Value("${service.catalog.url:http://localhost:8082}")
    private String catalogServiceUrl;

    private Optional<InventoryItemEntity> findItemFlexible(Long id) {
        if (id == null) return Optional.empty();
        return inventoryItemRepository.findByProductoId(id)
                .or(() -> inventoryItemRepository.findById(id));
    }

    private void syncProductStock(Long productId, int delta, int soldDelta) {
        if (productId == null) return;
        try {
            jdbcTemplate.update(
                "UPDATE products SET stock = GREATEST(0, stock + ?), ventas_historicas = COALESCE(ventas_historicas, 0) + ? WHERE id = ?",
                delta, soldDelta, productId
            );
            HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build()
                .send(HttpRequest.newBuilder().uri(URI.create(catalogServiceUrl + "/api/catalog/cache/evict"))
                    .POST(HttpRequest.BodyPublishers.noBody()).build(), HttpResponse.BodyHandlers.discarding());
        } catch (Exception ignored) {}
    }

    @GetMapping("/items")
    public ResponseEntity<List<InventoryItemEntity>> listItems() {
        return ResponseEntity.ok(inventoryItemRepository.findAll());
    }

    @GetMapping("/items/critical")
    public ResponseEntity<List<InventoryItemEntity>> listCriticalItems() {
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
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> registerPosSale(@RequestBody Map<String, Object> saleData) {
        String boleta = saleData.get("folio") != null ? saleData.get("folio").toString()
                : "CC-POS-" + (1000 + new Random().nextInt(9000));
        String usuario = (String) saleData.getOrDefault("usuario", "mostrador@cremeco.cl");
        String medioPago = (String) saleData.getOrDefault("medioPago", "EFECTIVO");
        long totalOrden = saleData.get("total") != null ? ((Number) saleData.get("total")).longValue() : 0L;

        List<Map<String, Object>> itemsList = new ArrayList<>();
        if (saleData.get("items") instanceof List<?> rawList) {
            for (Object o : rawList) {
                if (o instanceof Map<?, ?> m) itemsList.add((Map<String, Object>) m);
            }
        } else {
            itemsList.add(saleData);
        }

        int ultimoSaldo = 0;
        for (Map<String, Object> it : itemsList) {
            Object rawId = it.get("id") != null ? it.get("id") : it.get("productoId");
            Long prodId = rawId != null ? Long.valueOf(rawId.toString()) : null;
            String nombre = (String) it.getOrDefault("nombre", it.getOrDefault("producto", "Producto POS"));
            int cant = it.get("cantidad") != null ? Integer.parseInt(it.get("cantidad").toString()) : 1;

            int saldo = 0;
            Optional<InventoryItemEntity> itemOpt = findItemFlexible(prodId);
            if (itemOpt.isPresent()) {
                InventoryItemEntity entity = itemOpt.get();
                entity.setStockActual(Math.max(0, entity.getStockActual() - cant));
                entity.calcularSemaforo();
                inventoryItemRepository.save(entity);
                saldo = entity.getStockActual();
                nombre = entity.getNombre();
            }
            syncProductStock(prodId, -cant, cant);
            if (saldo == 0 && prodId != null) {
                try {
                    Integer s = jdbcTemplate.queryForObject("SELECT stock FROM products WHERE id = ?", Integer.class, prodId);
                    if (s != null) saldo = s;
                } catch (Exception ignored) {}
            }
            ultimoSaldo = saldo;

            kardexMovementRepository.save(KardexMovementEntity.builder()
                    .productoId(prodId).productoNombre(nombre).tipo("VENTA_POS")
                    .cantidad(-cant).saldo(saldo).motivo("Venta POS Boleta " + boleta)
                    .usuario(usuario).boleta(boleta).fecha(LocalDateTime.now()).build());
        }

        if (totalOrden > 0) {
            try {
                long iva = Math.round(totalOrden * 0.19 / 1.19);
                long neto = totalOrden - iva;
                KeyHolder kh = new GeneratedKeyHolder();
                jdbcTemplate.update(con -> {
                    PreparedStatement ps = con.prepareStatement(
                        "INSERT INTO orders (tracking_code, cliente_nombre, email, tipo_entrega, subtotal, descuento, costo_envio, iva, total, estado, metodo_pago, fecha) VALUES (?, 'Cliente Mostrador POS', ?, 'RETIRO', ?, 0, 0, ?, ?, 'ENTREGADO', ?, NOW())",
                        Statement.RETURN_GENERATED_KEYS);
                    ps.setString(1, boleta);
                    ps.setString(2, usuario);
                    ps.setLong(3, neto);
                    ps.setLong(4, iva);
                    ps.setLong(5, totalOrden);
                    ps.setString(6, medioPago);
                    return ps;
                }, kh);
                Number orderId = kh.getKey();
                if (orderId != null) {
                    for (Map<String, Object> it : itemsList) {
                        Object rId = it.get("id") != null ? it.get("id") : it.get("productoId");
                        Long pId = rId != null ? Long.valueOf(rId.toString()) : null;
                        String nom = (String) it.getOrDefault("nombre", "Producto POS");
                        int c = it.get("cantidad") != null ? Integer.parseInt(it.get("cantidad").toString()) : 1;
                        long pr = it.get("precio") != null ? ((Number) it.get("precio")).longValue() : totalOrden;
                        jdbcTemplate.update(
                            "INSERT INTO order_items (order_id, product_id, nombre, cantidad, precio, subtotal) VALUES (?, ?, ?, ?, ?, ?)",
                            orderId.longValue(), pId, nom, c, pr, pr * c);
                    }
                }
            } catch (Exception ignored) {}
        }

        Map<String, Object> respuesta = new HashMap<>(saleData);
        respuesta.put("boleta", boleta);
        respuesta.put("fecha", LocalDateTime.now().toString());
        respuesta.put("estado", "PAGADO_EXITOSO");
        respuesta.put("saldoRestante", ultimoSaldo);
        return ResponseEntity.ok(respuesta);
    }

    @PostMapping("/merma")
    public ResponseEntity<?> registerMerma(@RequestBody Map<String, Object> mermaData) {
        Long id = mermaData.get("productoId") != null ? Long.valueOf(mermaData.get("productoId").toString()) : null;
        String productoNombre = (String) mermaData.getOrDefault("producto", "Merma no especificada");
        int cantidad = mermaData.get("cantidad") != null ? Integer.parseInt(mermaData.get("cantidad").toString()) : 1;
        String motivo = (String) mermaData.getOrDefault("motivo", "Merma de producción");
        String usuario = (String) mermaData.getOrDefault("usuario", "cocina@cremeco.cl");

        int saldoRestante = 0;
        Optional<InventoryItemEntity> itemOpt = findItemFlexible(id);
        if (itemOpt.isPresent()) {
            InventoryItemEntity item = itemOpt.get();
            item.setStockActual(Math.max(0, item.getStockActual() - cantidad));
            item.calcularSemaforo();
            inventoryItemRepository.save(item);
            saldoRestante = item.getStockActual();
            productoNombre = item.getNombre();
            syncProductStock(item.getProductoId() != null ? item.getProductoId() : id, -cantidad, 0);
        }

        KardexMovementEntity saved = kardexMovementRepository.save(KardexMovementEntity.builder()
                .productoId(id).productoNombre(productoNombre).tipo("MERMA")
                .cantidad(-cantidad).saldo(saldoRestante).motivo(motivo)
                .usuario(usuario).fecha(LocalDateTime.now()).build());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/restock")
    public ResponseEntity<?> registerRestock(@RequestBody Map<String, Object> restockData) {
        Long id = restockData.get("productoId") != null ? Long.valueOf(restockData.get("productoId").toString()) : null;
        int cantidad = restockData.get("cantidad") != null ? Integer.parseInt(restockData.get("cantidad").toString()) : 0;
        String motivo = (String) restockData.getOrDefault("motivo", "Recepción de lote de cocina");
        String usuario = (String) restockData.getOrDefault("usuario", "cocina@cremeco.cl");

        if (id == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "PRODUCTO_REQUERIDO", "mensaje", "productoId es obligatorio"));
        }
        Optional<InventoryItemEntity> itemOpt = findItemFlexible(id);
        if (itemOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "NOT_FOUND", "mensaje", "Ítem de inventario no encontrado"));
        }

        InventoryItemEntity item = itemOpt.get();
        item.setStockActual(item.getStockActual() + cantidad);
        item.calcularSemaforo();
        inventoryItemRepository.save(item);
        syncProductStock(item.getProductoId() != null ? item.getProductoId() : id, cantidad, 0);

        kardexMovementRepository.save(KardexMovementEntity.builder()
                .productoId(id).productoNombre(item.getNombre()).tipo("INGRESO_COCINA")
                .cantidad(cantidad).saldo(item.getStockActual()).motivo(motivo)
                .usuario(usuario).fecha(LocalDateTime.now()).build());
        return ResponseEntity.ok(item);
    }
}
