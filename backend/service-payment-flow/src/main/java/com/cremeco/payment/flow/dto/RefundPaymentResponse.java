// @pca:start
// @id(backend.service_payment_flow.main.java.com.cremeco.payment.flow.dto.refundpaymentresponse)
// @kind(component)
// @limit(lines: 200)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (RefundPaymentResponse.java))
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
public class RefundPaymentResponse {
    private boolean success;
    private String refundToken;
    private String gatewayRefundOrderId;
    private String status;
    private String message;
    private String error;
}
