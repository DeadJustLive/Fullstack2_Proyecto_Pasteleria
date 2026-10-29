package com.cremeco.catalog.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(nullable = false)
    private Long precio; // CLP entero

    @Column(name = "precio_anterior")
    private Long precioAnterior; // Para ofertas tachadas

    @Column(name = "en_oferta")
    private Boolean enOferta;

    @Column(nullable = false, length = 50)
    private String categoria; // tortas, tartaletas, cheesecake, pasteles, sin-gluten

    @Column(name = "categorias_csv", length = 200)
    private String categoriasCsv;

    @Column(name = "variaciones_csv", length = 200)
    private String variacionesCsv;

    @Column(length = 100)
    private String porciones;

    @Column(nullable = false, length = 255)
    private String imagen;

    @Column(length = 50)
    private String badge; // premium, temporada, vendido, personalizable

    @Column(nullable = false)
    private Boolean destacado;

    @Column(nullable = false)
    private Boolean disponible;

    @Column(nullable = false)
    private Integer stock;

    @Column(name = "stock_minimo", nullable = false)
    private Integer stockMinimo;

    @Column(name = "ventas_historicas", nullable = false)
    private Integer ventasHistoricas;
}
