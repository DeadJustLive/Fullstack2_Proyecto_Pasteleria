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
