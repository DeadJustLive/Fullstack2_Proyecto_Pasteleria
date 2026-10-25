package com.cremeco.payment.flow.controller;

import com.cremeco.payment.flow.dto.PaymentStatusDto;
import com.cremeco.payment.flow.service.FlowPaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping({"/api/payments/flow", "/api/v1/payments/flow"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FlowWebhookController {

    private final FlowPaymentService flowPaymentService;

    /**
     * Webhook de confirmación llamado por los servidores de Flow vía POST (form-urlencoded o JSON).
     * Equivalente a la Edge Function payment-webhook de Supabase.
     */
    @PostMapping(value = {"/confirm", "/payment-webhook"}, consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<String> handleFormWebhook(@RequestParam(value = "token", required = false) String token) {
        log.info("Recibido Webhook de Flow (Form URL Encoded) con token: {}", token);
        flowPaymentService.processWebhook(token);
        return ResponseEntity.ok("OK");
    }

    @PostMapping(value = {"/confirm", "/payment-webhook"}, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> handleJsonWebhook(@RequestBody Map<String, Object> body) {
        String token = body != null && body.get("token") != null ? String.valueOf(body.get("token")) : null;
        log.info("Recibido Webhook de Flow (JSON) con token: {}", token);
        flowPaymentService.processWebhook(token);
        return ResponseEntity.ok("OK");
    }
}
