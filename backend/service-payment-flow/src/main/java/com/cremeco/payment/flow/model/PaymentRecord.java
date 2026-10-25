package com.cremeco.payment.flow.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidad de persistencia para pagos Flow con soporte de Idempotencia.
 * Mapea el esquema universal definido en 00000000000000_payment_schema.sql.
 */
@Entity
@Table(name = "payments", indexes = {
        @Index(name = "idx_payments_idempotency_key", columnList = "idempotency_key", unique = true),
        @Index(name = "idx_payments_order_id", columnList = "order_id"),
        @Index(name = "idx_payments_gateway_trx", columnList = "gateway_transaction_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "idempotency_key", nullable = false, unique = true, length = 255)
    private String idempotencyKey;

    @Column(name = "order_id", nullable = false, length = 255)
    private String orderId;

    @Column(name = "status", nullable = false, length = 50)
    private String status; // 'pending', 'completed', 'failed', 'refunded'

    @Column(name = "provider", nullable = false, length = 50)
    private String provider; // 'flow'

    @Column(name = "amount", nullable = false)
    private Long amount;

    @Column(name = "currency", length = 10)
    private String currency; // 'CLP'

    @Column(name = "user_email", nullable = false, length = 255)
    private String userEmail;

    @Column(name = "subject", nullable = false, length = 255)
    private String subject;

    @Column(name = "gateway_transaction_id", length = 255)
    private String gatewayTransactionId; // flowOrder

    @Column(name = "payment_token", length = 255)
    private String paymentToken;

    @Column(name = "checkout_url", length = 2000)
    private String checkoutUrl;

    @Column(name = "metadata_json", length = 4000)
    private String metadataJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (currency == null) {
            currency = "CLP";
        }
        if (provider == null) {
            provider = "flow";
        }
        if (status == null) {
            status = "pending";
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
