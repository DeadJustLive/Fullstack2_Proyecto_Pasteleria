package com.cremeco.catalog.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/catalog")
public class CatalogController {

    private final List<Map<String, Object>> mockProductos = new ArrayList<>(List.of(
            new HashMap<>(Map.of("id", 1, "nombre", "Torta Ópera Francesa", "precio", 24990, "categoria", "tortas", "stock", 8, "ventas", 142, "disponible", true, "imagen", "/imagen/Torta-Opera-Francesa.webp")),
            new HashMap<>(Map.of("id", 2, "nombre", "Cheesecake de Frutos Rojos", "precio", 21990, "categoria", "tortas", "stock", 12, "ventas", 98, "disponible", true, "imagen", "/imagen/Cheesecake-de-Frutos-Rojos.webp")),
            new HashMap<>(Map.of("id", 3, "nombre", "Torta Selva Negra Tradicional", "precio", 23990, "categoria", "tortas", "stock", 5, "ventas", 64, "disponible", true, "imagen", "/imagen/Torta-Selva-Negra-Tradicional.webp")),
            new HashMap<>(Map.of("id", 4, "nombre", "Tarta de Limón y Merengue", "precio", 18990, "categoria", "tartas", "stock", 15, "ventas", 82, "disponible", true, "imagen", "/imagen/Tarta-de-Limon-y-Merengue.webp")),
            new HashMap<>(Map.of("id", 5, "nombre", "Croissant de Mantequilla", "precio", 3500, "categoria", "bolleria", "stock", 25, "ventas", 310, "disponible", true, "imagen", "/imagen/Croissant.webp")),
            new HashMap<>(Map.of("id", 6, "nombre", "Torta Prototipo Nuevo", "precio", 19990, "categoria", "tortas", "stock", 10, "ventas", 0, "disponible", true, "imagen", "/imagen/Torta-Opera-Francesa.webp"))
    ));

    @GetMapping("/products")
    public ResponseEntity<?> listProducts() {
        return ResponseEntity.ok(mockProductos);
    }

    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@RequestBody Map<String, Object> data) {
        Map<String, Object> nuevo = new HashMap<>(data);
        nuevo.put("id", mockProductos.size() + 1);
        nuevo.put("ventas", 0);
        nuevo.put("disponible", true);
        mockProductos.add(nuevo);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable int id, @RequestBody Map<String, Object> data) {
        for (Map<String, Object> p : mockProductos) {
            if ((int) p.get("id") == id) {
                p.putAll(data);
                return ResponseEntity.ok(p);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable int id) {
        Optional<Map<String, Object>> opt = mockProductos.stream()
                .filter(p -> (int) p.get("id") == id)
                .findFirst();

        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> p = opt.get();
        int ventas = (int) p.getOrDefault("ventas", 0);

        // Regla dura de negocio: No se pueden eliminar productos con ventas históricas
        if (ventas > 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "error", "INTEGRIDAD_REFERENCIAL",
                    "mensaje", "No es posible eliminar productos con ventas históricas registradas (" + ventas + " ventas). Puedes pausar su disponibilidad en su lugar."
            ));
        }

        mockProductos.remove(p);
        return ResponseEntity.ok(Map.of("mensaje", "Producto eliminado correctamente", "id", id));
    }

    @GetMapping("/promotions")
    public ResponseEntity<?> listPromotions() {
        return ResponseEntity.ok(List.of(
                Map.of("codigo", "DULCE10", "descuentoPorcentaje", 10, "descripcion", "10% de descuento en el total de tu compra"),
                Map.of("codigo", "CREME20", "descuentoPorcentaje", 20, "descripcion", "20% en pedidos sobre $30.000"),
                Map.of("codigo", "BIENVENIDA", "descuentoPorcentaje", 15, "descripcion", "15% para clientes nuevos")
        ));
    }
}
