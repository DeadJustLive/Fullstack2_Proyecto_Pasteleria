package com.cremeco.identity.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/identity")
public class IdentityController {

    private final List<Map<String, Object>> mockUsuarios = new ArrayList<>(List.of(
            new HashMap<>(Map.of("id", 1, "nombre", "Camila Silva", "email", "admin@cremeco.cl", "rol", "ADMIN", "estado", "ACTIVO")),
            new HashMap<>(Map.of("id", 2, "nombre", "Rodrigo Tapia", "email", "pastelero@cremeco.cl", "rol", "PASTELERO", "estado", "ACTIVO")),
            new HashMap<>(Map.of("id", 3, "nombre", "Francisca Morales", "email", "ventas@cremeco.cl", "rol", "VENDEDOR", "estado", "ACTIVO")),
            new HashMap<>(Map.of("id", 4, "nombre", "Constanza Gomez", "email", "cliente@cremeco.cl", "rol", "CLIENTE", "estado", "ACTIVO"))
    ));

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credenciales) {
        String email = credenciales.get("email");
        Optional<Map<String, Object>> userOpt = mockUsuarios.stream()
                .filter(u -> email != null && email.equalsIgnoreCase((String) u.get("email")))
                .findFirst();

        if (userOpt.isPresent()) {
            Map<String, Object> u = userOpt.get();
            return ResponseEntity.ok(Map.of(
                    "token", "mock-jwt-" + UUID.randomUUID(),
                    "usuario", u
            ));
        }
        // Fallback demo user
        return ResponseEntity.ok(Map.of(
                "token", "mock-jwt-" + UUID.randomUUID(),
                "usuario", Map.of("id", 99, "nombre", "Usuario Demo", "email", email != null ? email : "user@cremeco.cl", "rol", "CLIENTE")
        ));
    }

    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> data) {
        Map<String, Object> nuevo = new HashMap<>(data);
        nuevo.put("id", mockUsuarios.size() + 1);
        nuevo.put("rol", "CLIENTE");
        nuevo.put("estado", "ACTIVO");
        mockUsuarios.add(nuevo);
        return ResponseEntity.ok(Map.of(
                "mensaje", "Usuario registrado exitosamente",
                "usuario", nuevo
        ));
    }

    @GetMapping("/users")
    public ResponseEntity<?> listUsers() {
        return ResponseEntity.ok(mockUsuarios);
    }

    @GetMapping("/roles")
    public ResponseEntity<?> listRoles() {
        return ResponseEntity.ok(List.of(
                Map.of("id", "ADMIN", "nombre", "Administrador Total", "permisos", List.of("ALL")),
                Map.of("id", "PASTELERO", "nombre", "Jefe de Cocina", "permisos", List.of("ORDERS_STATUS", "INVENTORY_MERMA")),
                Map.of("id", "VENDEDOR", "nombre", "Cajero POS", "permisos", List.of("POS_SALE", "ORDERS_VIEW")),
                Map.of("id", "CLIENTE", "nombre", "Cliente Tienda", "permisos", List.of("ORDER_CREATE", "PROFILE_EDIT"))
        ));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> changeRole(@PathVariable int id, @RequestBody Map<String, String> body) {
        String nuevoRol = body.get("rol");
        for (Map<String, Object> u : mockUsuarios) {
            if ((int) u.get("id") == id) {
                u.put("rol", nuevoRol);
                return ResponseEntity.ok(u);
            }
        }
        return ResponseEntity.notFound().build();
    }
}
