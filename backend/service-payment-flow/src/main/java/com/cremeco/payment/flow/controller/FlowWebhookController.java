// @pca:start
// @id(backend.payment.flowWebhookController)
// @kind(controller)
// @limit(lines: 110)
// @contract(handleFormWebhook, handleJsonWebhook, handleBrowserReturn)
// @relates(backend.payment.flowService)
// @desc(Controlador de webhooks asincronos y puente HTTP 303 para retorno POST desde Flow.cl)
// @pca:end
package com.cremeco.payment.flow.controller;

import com.cremeco.payment.flow. service.FlowPaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping({"/api/payments/flow", "/api/v1/payments/flow"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FlowWebhookController {

    private final FlowPaymentService flowPaymentService;

    /**
     * Webhook de confirmación servidor-a-servidor llamado por Flow vía POST (form-urlencoded).
     */
    @PostMapping(value = {"/confirm", "/payment-webhook"}, consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<String> handleFormWebhook(@RequestParam(value = "token", required = false) String token) {
        log.info("Recibido Webhook de Flow (Form URL Encoded) con token: {}", token);
        flowPaymentService.processWebhook(token);
        return ResponseEntity.ok("OK");
    }

    /**
     * Webhook de confirmación servidor-a-servidor en formato JSON.
     */
    @PostMapping(value = {"/confirm", "/payment-webhook"}, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> handleJsonWebhook(@RequestBody Map<String, Object> body) {
        String token = body != null && body.get("token") != null ? String.valueOf(body.get("token")) : null;
        log.info("Recibido Webhook de Flow (JSON) con token: {}", token);
        flowPaymentService.processWebhook(token);
        return ResponseEntity.ok("OK");
    }

    /**
     * Puente de retorno para el navegador del comprador (Flow envía un HTTP POST con token a urlReturn).
     * Verifica el estado real del pago en Flow y redirige mediante HTTP 303 See Other (GET)
     * hacia /pago/exito (si status == 2) o /pago/error (si fue rechazado o anulado).
     */
    @RequestMapping(value = "/return", method = {RequestMethod.POST, RequestMethod.GET})
    public ResponseEntity<Void> handleBrowserReturn(
            @RequestParam(value = "token", required = false) String token,
            @RequestParam(value = "orderId", required = false) String orderId
    ) {
        log.info("Retorno de navegador desde Flow.cl recibido en /return (token={}, orderId={})", token, orderId);
        String redirectUrl = flowPaymentService.resolveFrontendReturnRedirectUrl(token, orderId);
        return ResponseEntity.status(HttpStatus.SEE_OTHER)
                .location(URI.create(redirectUrl))
                .build();
    }
}
