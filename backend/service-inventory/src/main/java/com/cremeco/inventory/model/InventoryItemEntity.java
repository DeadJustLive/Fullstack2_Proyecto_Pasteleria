package com.cremeco.inventory.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "producto_id", nullable = false, unique = true)
    private Long productoId;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false, length = 50)
    private String categoria;

    @Column(name = "stock_actual", nullable = false)
    private Integer stockActual;

    @Column(name = "stock_minimo", nullable = false)
    private Integer stockMinimo;

    @Column(name = "unidad_medida", length = 30)
    private String unidadMedida; // unidades, porciones, kg

    @Column(name = "estado_semaforo", length = 20)
    private String estadoSemaforo; // VERDE (OK), AMARILLO (BAJO), ROJO (CRITICO)

    @Column(name = "ultima_actualizacion")
    private LocalDateTime ultimaActualizacion;

    @PrePersist
    @PreUpdate
    public void calcularSemaforo() {
        if (stockMinimo == null) stockMinimo = 5;
        if (stockActual == null) stockActual = 0;

        if (stockActual <= 2) {
            estadoSemaforo = "ROJO";
        } else if (stockActual <= stockMinimo) {
            estadoSemaforo = "AMARILLO";
        } else {
            estadoSemaforo = "VERDE";
        }
        ultimaActualizacion = LocalDateTime.now();
    }
}
