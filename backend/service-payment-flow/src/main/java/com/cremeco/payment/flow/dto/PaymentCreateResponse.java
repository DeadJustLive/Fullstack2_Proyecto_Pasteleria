// @pca:start
// @id(backend.service_payment_flow.main.java.com.cremeco.payment.flow.dto.paymentcreateresponse)
// @kind(component)
// @limit(lines: 200)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (PaymentCreateResponse.java))
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
public class PaymentCreateResponse {
    private boolean success;
    private String checkoutUrl;
    private String paymentToken;
    private String orderId;
    private String message;
    private String error;
}
