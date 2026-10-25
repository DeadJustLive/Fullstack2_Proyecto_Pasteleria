package com.cremeco.payment.flow.controller;

import com.cremeco.payment.flow.dto.*;
import com.cremeco.payment.flow.service.FlowPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping({"/api/payments/flow", "/api/v1/payments/flow"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FlowPaymentController {

    private final FlowPaymentService flowPaymentService;

    /**
     * Endpoint para generar un cobro en Flow con Idempotencia garantizada.
     * Equivalente a la Edge Function create-payment de Supabase.
     */
    @PostMapping("/create")
    public ResponseEntity<PaymentCreateResponse> createPayment(@Valid @RequestBody PaymentCreateRequest request) {
        log.info("Petición recibida en /create con idempotencyKey: {}", request.getIdempotencyKey());
        PaymentCreateResponse response = flowPaymentService.createPayment(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint para emitir un reembolso de orden en Flow.
     * Equivalente a refund-payment de Supabase.
     */
    @PostMapping("/refund")
    public ResponseEntity<RefundPaymentResponse> refundPayment(@Valid @RequestBody RefundPaymentRequest request) {
        log.info("Petición recibida en /refund para orden: {}", request.getOriginalOrderId());
        RefundPaymentResponse response = flowPaymentService.refundPayment(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Consulta el estado de un pago por token o por orderId.
     */
    @GetMapping("/status")
    public ResponseEntity<PaymentStatusDto> getStatus(
            @RequestParam(value = "token", required = false) String token,
            @RequestParam(value = "orderId", required = false) String orderId
    ) {
        return ResponseEntity.ok(flowPaymentService.getStatus(token, orderId));
    }

    /**
     * Consulta directa por path variable del token.
     */
    @GetMapping("/status/{token}")
    public ResponseEntity<PaymentStatusDto> getStatusByToken(@PathVariable("token") String token) {
        return ResponseEntity.ok(flowPaymentService.getStatus(token, null));
    }
}
