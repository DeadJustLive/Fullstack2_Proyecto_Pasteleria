package com.cremeco.notification.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "contact_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactMessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(nullable = false, length = 120)
    private String email;

    @Column(length = 30)
    private String telefono;

    @Column(nullable = false, length = 80)
    private String motivo; // Consulta general, Pedido especial, Evento corporativo, Reclamo o sugerencia

    @Column(columnDefinition = "TEXT", nullable = false)
    private String mensaje;

    @Column(nullable = false)
    private Boolean leido;

    @Column(nullable = false)
    private LocalDateTime fecha;
}
