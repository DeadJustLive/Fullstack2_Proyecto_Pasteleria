// @pca:start
// @id(backend.service_payment_flow.main.java.com.cremeco.payment.flow.repository.paymentrepository)
// @kind(component)
// @limit(lines: 200)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (PaymentRepository.java))
// @pca:end
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
