package com.cremeco.identity.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 100)
    private String apellidos;

    @Column(length = 20)
    private String rut;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(length = 30)
    private String telefono;

    @Column(length = 200)
    private String calle;

    @Column(length = 50)
    private String departamento;

    @Column(length = 100)
    private String region;

    @Column(length = 100)
    private String comuna;

    @Column(nullable = false, length = 50)
    private String rol; // ADMIN_GENERAL, JEFE_COCINA, CAJERO_MOSTRADOR, CLIENTE

    @Column(nullable = false, length = 20)
    private String estado; // ACTIVO, BLOQUEADO

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "ultimo_acceso")
    private LocalDateTime ultimoAcceso;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (estado == null) {
            estado = "ACTIVO";
        }
        if (rol == null) {
            rol = "CLIENTE";
        }
    }
}
