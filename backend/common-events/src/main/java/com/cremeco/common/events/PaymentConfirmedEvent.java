// @pca:start
// @id(backend.common_events.main.java.com.cremeco.common.events.paymentconfirmedevent)
// @kind(component)
// @limit(lines: 200)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (PaymentConfirmedEvent.java))
// @pca:end
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
