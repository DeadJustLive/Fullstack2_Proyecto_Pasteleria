package com.cremeco.payment.flow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
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
public class PaymentCreateRequest {

    /**
     * Clave única generada por el cliente para prevenir cobros duplicados (Idempotencia).
     */
    @NotBlank(message = "idempotencyKey es obligatoria")
    private String idempotencyKey;

    private String orderId;

    @NotNull(message = "amount es obligatorio")
    @Min(value = 350, message = "El monto mínimo permitido por Flow es CLP $350")
    @Max(value = 50000000, message = "El monto máximo permitido por Flow es CLP $50.000.000")
    private Long amount;

    @NotBlank(message = "email es obligatorio")
    @Email(message = "El formato del email no es válido")
    private String email;

    @NotBlank(message = "subject es obligatorio")
    private String subject;

    private String urlReturn;

    private String urlConfirmation;
}
