package com.cremeco.payment.flow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundPaymentRequest {

    @NotBlank(message = "refundOrderId es obligatorio")
    private String refundOrderId;

    private String originalOrderId;

    private String originalGatewayTransactionId;

    @NotNull(message = "amount es obligatorio")
    @Min(value = 1, message = "El monto debe ser mayor a 0")
    private Long amount;

    @NotBlank(message = "receiverEmail es obligatorio")
    @Email(message = "El formato de receiverEmail no es válido")
    private String receiverEmail;

    private String urlCallBack;
}
