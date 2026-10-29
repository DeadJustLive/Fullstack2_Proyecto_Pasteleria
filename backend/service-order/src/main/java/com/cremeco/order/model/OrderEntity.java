package com.cremeco.order.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tracking_code", nullable = false, unique = true, length = 50)
    private String trackingCode; // ej. CC-1001, CC-2025-001234

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "cliente_nombre", nullable = false, length = 150)
    private String cliente;

    @Column(nullable = false, length = 120)
    private String email;

    @Column(length = 30)
    private String telefono;

    @Column(length = 20)
    private String rut;

    @Column(name = "tipo_entrega", nullable = false, length = 30)
    private String tipoEntrega; // DELIVERY o RETIRO

    // Dirección (si tipoEntrega == DELIVERY)
    @Column(length = 200)
    private String direccion;

    @Column(length = 60)
    private String departamento;

    @Column(length = 100)
    private String region;

    @Column(length = 100)
    private String comuna;

    @Column(columnDefinition = "TEXT")
    private String indicaciones;

    // Datos de retiro (si tipoEntrega == RETIRO)
    @Column(name = "persona_retiro_nombre", length = 150)
    private String personaRetiroNombre;

    @Column(name = "persona_retiro_rut", length = 20)
    private String personaRetiroRut;

    @Column(name = "persona_retiro_telefono", length = 30)
    private String personaRetiroTelefono;

    // Montos en CLP (requisito DSY1104: Boleta con desglose IVA 19%)
    @Column(nullable = false)
    private Long subtotal;

    @Column(nullable = false)
    private Long descuento;

    @Column(name = "costo_envio", nullable = false)
    private Long costoEnvio;

    @Column(nullable = false)
    private Long iva; // 19% del subtotal neto

    @Column(nullable = false)
    private Long total;

    // Estado del pedido
    @Column(nullable = false, length = 40)
    private String estado; // RECIBIDO, PAGADO, EN_PREPARACION, LISTO_RETIRO, EN_RUTA, ENTREGADO, CANCELADO

    @Column(name = "metodo_pago", length = 50)
    private String metodoPago; // FLOW_WEBPAY, FLOW_SERVIPAG, FLOW_MULTICAJA, TRANSFERENCIA, POS

    @Column(name = "flow_order", length = 80)
    private String flowOrder;

    @Column(name = "payment_token", length = 120)
    private String paymentToken;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Column(name = "fecha_entrega_estimada")
    private String fechaEntregaEstimada;

    @Column(columnDefinition = "TEXT")
    private String notas;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    @Builder.Default
    private List<OrderItemEntity> items = new ArrayList<>();

    public void addItem(OrderItemEntity item) {
        items.add(item);
        item.setOrder(this);
    }
}
