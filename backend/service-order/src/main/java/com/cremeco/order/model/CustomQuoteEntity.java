package com.cremeco.order.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "custom_quotes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomQuoteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cliente_nombre", nullable = false, length = 150)
    private String clienteNombre;

    @Column(nullable = false, length = 120)
    private String email;

    @Column(nullable = false, length = 30)
    private String telefono;

    @Column(name = "tipo_evento", length = 80)
    private String tipoEvento; // Cumpleaños, Boda, Baby Shower, Aniversario, Corporativo

    @Column(nullable = false)
    private Integer porciones;

    @Column(name = "sabor_bizcocho", length = 100)
    private String saborBizcocho;

    @Column(length = 100)
    private String relleno;

    @Column(length = 100)
    private String cubierta;

    @Column(length = 150)
    private String tematica;

    @Column(columnDefinition = "TEXT")
    private String detalles;

    @Column(name = "fecha_evento", length = 30)
    private String fechaEvento;

    @Column(nullable = false, length = 40)
    private String estado; // RECIBIDA, EN_REVISION, PRESUPUESTADA, APROBADA, RECHAZADA

    @Column(name = "monto_estimado")
    private Long montoEstimado;

    @Column(nullable = false)
    private LocalDateTime fecha;
}
