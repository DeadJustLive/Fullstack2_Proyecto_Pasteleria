package com.cremeco.common.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentConfirmedEvent implements Serializable {
    private Long orderId;
    private String orderNumber;
    private String flowOrderNumber; // ID interno de Flow.cl
    private String paymentMethod;    // WEBPAY, SERVIPAG, MACH, etc.
    private Long amountClp;
    private String payerEmail;
    private String authorizationCode;
    private LocalDateTime paymentDate;
    private String status;           // PAID
}
