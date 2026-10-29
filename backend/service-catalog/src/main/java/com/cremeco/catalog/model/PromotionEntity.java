package com.cremeco.catalog.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "promotions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PromotionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String codigo;

    @Column(nullable = false, length = 30)
    private String tipo; // PORCENTAJE o MONTO_FIJO

    @Column(name = "descuento_porcentaje", nullable = false)
    private Integer descuentoPorcentaje;

    @Column(nullable = false)
    private Long valor;

    @Column(name = "minimo_compra", nullable = false)
    private Long minimoCompra;

    @Column(name = "usos_actuales", nullable = false)
    private Integer usosActuales;

    @Column(name = "limite_usos", nullable = false)
    private Integer limiteUsos;

    @Column(length = 30)
    private String expira;

    @Column(nullable = false)
    private Boolean activo;

    @Column(length = 255)
    private String descripcion;
}
