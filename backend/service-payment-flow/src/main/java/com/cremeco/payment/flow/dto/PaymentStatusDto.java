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
