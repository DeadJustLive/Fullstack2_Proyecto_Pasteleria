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
