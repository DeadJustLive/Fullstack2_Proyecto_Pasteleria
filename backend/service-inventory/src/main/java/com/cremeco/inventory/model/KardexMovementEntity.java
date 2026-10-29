package com.cremeco.inventory.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "kardex_movements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KardexMovementEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "producto_id")
    private Long productoId;

    @Column(name = "producto_nombre", nullable = false, length = 150)
    private String productoNombre;

    @Column(nullable = false, length = 40)
    private String tipo; // VENTA_POS, VENTA_ONLINE, INGRESO_COCINA, MERMA, AJUSTE

    @Column(nullable = false)
    private Integer cantidad; // positivo o negativo

    @Column(nullable = false)
    private Integer saldo; // stock resultante

    @Column(length = 255)
    private String motivo; // ej: Quebrado en horneado, Venta Mostrador, Recepción Lote

    @Column(length = 120)
    private String usuario; // ej: pasteleria@cremeco.cl

    @Column(length = 50)
    private String boleta; // ej: B-A1B2C3D4

    @Column(nullable = false)
    private LocalDateTime fecha;
}
