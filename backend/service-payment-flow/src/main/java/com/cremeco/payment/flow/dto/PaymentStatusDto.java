// @pca:start
// @id(backend.service_payment_flow.main.java.com.cremeco.payment.flow.dto.paymentstatusdto)
// @kind(component)
// @limit(lines: 200)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (PaymentStatusDto.java))
// @pca:end
package com.cremeco.payment.flow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatusDto {
    private boolean success;
    private String status; // 'pending', 'completed', 'failed', 'refunded'
    private String orderId;
    private String gatewayTransactionId;
    private Long amount;
    private String payer;
    private String message;
}
