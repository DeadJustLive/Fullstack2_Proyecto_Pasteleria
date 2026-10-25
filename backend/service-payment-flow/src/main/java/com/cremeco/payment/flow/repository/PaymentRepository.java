package com.cremeco.payment.flow.repository;

import com.cremeco.payment.flow.model.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentRecord, UUID> {

    Optional<PaymentRecord> findByIdempotencyKey(String idempotencyKey);

    Optional<PaymentRecord> findByOrderId(String orderId);

    Optional<PaymentRecord> findByPaymentToken(String paymentToken);

    Optional<PaymentRecord> findByGatewayTransactionId(String gatewayTransactionId);
}
