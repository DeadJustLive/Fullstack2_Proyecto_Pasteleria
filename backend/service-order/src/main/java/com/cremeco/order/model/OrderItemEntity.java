package com.cremeco.order.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference
    private OrderEntity order;

    @Column(name = "product_id")
    private Long productId;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false)
    private Long precio;

    @Column(nullable = false)
    private Long subtotal;

    @Column(length = 255)
    private String imagen;

    @Column(length = 100)
    private String variacion;
}
