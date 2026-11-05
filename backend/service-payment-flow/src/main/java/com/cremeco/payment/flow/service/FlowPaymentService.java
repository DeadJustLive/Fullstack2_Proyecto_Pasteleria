package com.cremeco.payment.flow.service;

import com.cremeco.common.events.PaymentConfirmedEvent;
import com.cremeco.payment.flow.dto.*;
import com.cremeco.payment.flow.model.PaymentRecord;
import com.cremeco.payment.flow.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FlowPaymentService {

    private final FlowClientService flowClientService;
    private final FlowUrlHelper flowUrlHelper;
    private final PaymentRepository paymentRepository;
    private final Optional<KafkaTemplate<String, Object>> kafkaTemplate;

    @Value("${flow.store-url:http://localhost:5173}")
    private String storeUrl;

    @Value("${flow.strict-real-mode:false}")
    private boolean strictRealMode;

    private static final String TOPIC_PAYMENT_CONFIRMED = "cremeco.payments.flow.confirmed";

    public FlowDiagnosticsResponse getDiagnostics() {
        return FlowDiagnosticsResponse.builder()
                .configuredWithRealCredentials(flowClientService.isConfiguredWithRealCredentials())
                .flowApiUrl(flowClientService.getFlowApiUrl())
                .apiKeyMasked(flowClientService.getMaskedApiKey())
                .urlConfirmation(flowClientService.getUrlConfirmation())
                .urlReturn(flowClientService.getUrlReturn())
                .storeUrl(flowUrlHelper.cleanStoreUrl(storeUrl))
                .strictRealMode(strictRealMode)
                .warnings(flowUrlHelper.evaluateConfirmationWarnings(flowClientService.getUrlConfirmation()))
                .build();
    }

    @Transactional
    public PaymentCreateResponse createPayment(PaymentCreateRequest request) {
        Optional<PaymentRecord> existing = paymentRepository.findByIdempotencyKey(request.getIdempotencyKey());

        if (existing.isPresent()) {
            PaymentRecord payment = existing.get();
            log.info("Idempotencia detectada para key '{}'. Estado: {}", request.getIdempotencyKey(), payment.getStatus());

            if ("pending".equalsIgnoreCase(payment.getStatus())) {
                boolean wasReal = payment.getCheckoutUrl() != null && !payment.getCheckoutUrl().contains("/pago/flow-gateway");
                return PaymentCreateResponse.builder()
                        .success(true)
                        .checkoutUrl(payment.getCheckoutUrl())
                        .paymentToken(payment.getPaymentToken())
                        .orderId(payment.getOrderId())
                        .message("Recuperado intento de pago previo.")
                        .mode(wasReal ? "REAL_FLOW" : "LOCAL_SIMULATOR")
                        .diagnosticReason("Recuperado intento de pago previo por idempotencia")
                        .build();
            }

            if ("completed".equalsIgnoreCase(payment.getStatus())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Este pago ya fue procesado: " + payment.getStatus());
            }
        }

        String commerceOrder = (request.getOrderId() != null && !request.getOrderId().isBlank())
                ? request.getOrderId()
                : "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        Map<String, Object> flowResponse = null;
        String mode = "LOCAL_SIMULATOR";
        String diagnosticReason = "Credenciales de Flow no configuradas o placeholder en .env";
        String flowErrorMessage = null;

        if (flowClientService.isConfiguredWithRealCredentials()) {
            try {
                flowResponse = flowClientService.createPaymentOrder(
                        commerceOrder, request.getSubject(), request.getAmount(),
                        request.getEmail(), request.getUrlReturn(), request.getUrlConfirmation(),
                        request.getIdempotencyKey()
                );
            } catch (Exception e) {
                flowErrorMessage = e.getMessage();
                log.warn("Fallo al comunicarse con Flow API para orden {}: {}", commerceOrder, flowErrorMessage);
                if (strictRealMode) {
                    throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Fallo al conectar con Flow.cl: " + flowErrorMessage);
                }
            }
        }

        String checkoutUrl;
        String token;

        if (flowResponse != null && flowResponse.get("url") != null && flowResponse.get("token") != null) {
            String baseUrl = String.valueOf(flowResponse.get("url"));
            token = String.valueOf(flowResponse.get("token"));
            checkoutUrl = baseUrl + (baseUrl.contains("?") ? "&" : "?") + "token=" + token;
            mode = "REAL_FLOW";
            diagnosticReason = "Orden creada exitosamente en Flow.cl";
            log.info("[Flow.cl] URL oficial generada para {}: {}", commerceOrder, checkoutUrl);
        } else {
            if (flowClientService.isConfiguredWithRealCredentials()) {
                diagnosticReason = "Fallo en llamada a Flow API (" + flowErrorMessage + "), activando simulador local de contingencia.";
            }
            token = "flow_sand_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
            checkoutUrl = flowUrlHelper.buildSimulatorUrl(storeUrl, token, commerceOrder, request.getAmount(), request.getEmail());
        }

        PaymentRecord record = PaymentRecord.builder()
                .idempotencyKey(request.getIdempotencyKey())
                .orderId(commerceOrder)
                .status("pending")
                .provider("flow")
                .amount(request.getAmount())
                .currency("CLP")
                .userEmail(request.getEmail())
                .subject(request.getSubject())
                .paymentToken(token)
                .checkoutUrl(checkoutUrl)
                .build();

        paymentRepository.save(record);

        return PaymentCreateResponse.builder()
                .success(true)
                .checkoutUrl(checkoutUrl)
                .paymentToken(token)
                .orderId(commerceOrder)
                .message("REAL_FLOW".equals(mode) ? "Orden creada exitosamente en Flow." : "Orden creada en simulador.")
                .mode(mode)
                .diagnosticReason(diagnosticReason)
                .build();
    }

    @Transactional
    public PaymentStatusDto processWebhook(String token) {
        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Webhook no contiene el token requerido");
        }

        log.info("Consultando estado en Flow para token: {}", token);
        Map<String, Object> statusData;
        try {
            statusData = flowClientService.getPaymentStatus(token);
        } catch (Exception e) {
            log.warn("Token no validado en Flow API ({}): {}", token, e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token de webhook no válido en pasarela");
        }

        if (statusData == null || statusData.get("status") == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Respuesta vacía desde Flow");
        }

        int rawStatus = Integer.parseInt(String.valueOf(statusData.get("status")));
        String flowOrder = statusData.get("flowOrder") != null ? String.valueOf(statusData.get("flowOrder")) : "";
        String commerceOrder = statusData.get("commerceOrder") != null ? String.valueOf(statusData.get("commerceOrder")) : "";
        Number amount = statusData.get("amount") instanceof Number n ? n : null;
        String payer = statusData.get("payer") != null ? String.valueOf(statusData.get("payer")) : null;

        String normalizedStatus = switch (rawStatus) {
            case 2 -> "completed";
            case 3 -> "failed";
            case 4 -> "refunded";
            default -> "pending";
        };

        log.info("Estado Flow para orden {}: '{}' (raw={}, flowOrder={})", commerceOrder, normalizedStatus, rawStatus, flowOrder);

        Optional<PaymentRecord> recordOpt = paymentRepository.findByOrderId(commerceOrder);
        if (recordOpt.isEmpty()) {
            recordOpt = paymentRepository.findByPaymentToken(token);
        }

        if (recordOpt.isPresent()) {
            PaymentRecord record = recordOpt.get();
            record.setStatus(normalizedStatus);
            if (!flowOrder.isBlank()) record.setGatewayTransactionId(flowOrder);
            paymentRepository.save(record);
        }

        if ("completed".equalsIgnoreCase(normalizedStatus)) {
            PaymentConfirmedEvent event = PaymentConfirmedEvent.builder()
                    .orderNumber(commerceOrder)
                    .flowOrderNumber(flowOrder)
                    .paymentMethod("FLOW_WEBPAY")
                    .amountClp(amount != null ? amount.longValue() : 0L)
                    .payerEmail(payer)
                    .authorizationCode(token)
                    .paymentDate(LocalDateTime.now())
                    .status("PAID")
                    .build();

            kafkaTemplate.ifPresent(kt -> {
                try {
                    kt.send(TOPIC_PAYMENT_CONFIRMED, commerceOrder, event);
                    log.info("Evento PaymentConfirmedEvent publicado en Kafka para: {}", commerceOrder);
                } catch (Exception ex) {
                    log.warn("Kafka no disponible para emitir evento de pago: {}", ex.getMessage());
                }
            });
        }

        return PaymentStatusDto.builder()
                .success("completed".equalsIgnoreCase(normalizedStatus))
                .status(normalizedStatus)
                .orderId(commerceOrder)
                .gatewayTransactionId(flowOrder)
                .amount(amount != null ? amount.longValue() : null)
                .payer(payer)
                .message("Estado verificado con Flow.cl")
                .build();
    }

    @Transactional
    public String resolveFrontendReturnRedirectUrl(String token, String fallbackOrderId) {
        String baseStore = flowUrlHelper.cleanStoreUrl(storeUrl);
        if (token == null || token.isBlank()) {
            return baseStore + "/pago/error?reason=bank_rejected"
                    + (fallbackOrderId != null ? "&orderId=" + flowUrlHelper.urlEncode(fallbackOrderId) : "");
        }

        try {
            PaymentStatusDto statusDto = getStatus(token, fallbackOrderId);
            String orderId = statusDto.getOrderId() != null ? statusDto.getOrderId() : (fallbackOrderId != null ? fallbackOrderId : "");
            String flowOrder = statusDto.getGatewayTransactionId() != null ? statusDto.getGatewayTransactionId() : "";
            long total = statusDto.getAmount() != null ? statusDto.getAmount() : 0L;

            if (statusDto.isSuccess() || "completed".equalsIgnoreCase(statusDto.getStatus())) {
                return baseStore + "/pago/exito?token=" + flowUrlHelper.urlEncode(token)
                        + "&orderId=" + flowUrlHelper.urlEncode(orderId)
                        + (!flowOrder.isBlank() ? "&flowOrder=" + flowUrlHelper.urlEncode(flowOrder) : "")
                        + (total > 0 ? "&total=" + total : "");
            }

            return baseStore + "/pago/error?reason=bank_rejected&token=" + flowUrlHelper.urlEncode(token)
                    + (!orderId.isBlank() ? "&orderId=" + flowUrlHelper.urlEncode(orderId) : "");
        } catch (Exception ex) {
            log.warn("No se pudo confirmar pago en /return para token {}: {}", token, ex.getMessage());
            Optional<PaymentRecord> localRec = paymentRepository.findByPaymentToken(token);
            String ord = localRec.map(PaymentRecord::getOrderId).orElse(fallbackOrderId != null ? fallbackOrderId : "");
            return baseStore + "/pago/error?reason=bank_rejected&token=" + flowUrlHelper.urlEncode(token)
                    + (!ord.isBlank() ? "&orderId=" + flowUrlHelper.urlEncode(ord) : "");
        }
    }

    @Transactional
    public RefundPaymentResponse refundPayment(RefundPaymentRequest request) {
        Map<String, Object> flowResponse;
        try {
            flowResponse = flowClientService.refundPayment(
                    request.getRefundOrderId(), request.getReceiverEmail(), request.getAmount(),
                    request.getOriginalOrderId(), request.getOriginalGatewayTransactionId(), request.getUrlCallBack()
            );
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Fallo al reembolsar en Flow: " + e.getMessage());
        }

        String refundToken = flowResponse != null ? String.valueOf(flowResponse.get("token")) : null;
        String flowRefundOrder = flowResponse != null ? String.valueOf(flowResponse.get("flowRefundOrder")) : null;
        String status = flowResponse != null ? String.valueOf(flowResponse.get("status")) : "refunded";

        if (request.getOriginalOrderId() != null) {
            paymentRepository.findByOrderId(request.getOriginalOrderId()).ifPresent(p -> {
                p.setStatus("refunded");
                paymentRepository.save(p);
            });
        }

        return RefundPaymentResponse.builder()
                .success(true)
                .refundToken(refundToken)
                .gatewayRefundOrderId(flowRefundOrder)
                .status(status)
                .message("Reembolso procesado correctamente")
                .build();
    }

    @Transactional
    public PaymentStatusDto getStatus(String token, String orderId) {
        if (token != null && !token.isBlank()) {
            boolean isSimulated = token.startsWith("flow_sand_") || token.startsWith("flow_tok_") || token.startsWith("flow_");
            if (!isSimulated && flowClientService.isConfiguredWithRealCredentials()) {
                return processWebhook(token);
            }

            Optional<PaymentRecord> byToken = paymentRepository.findByPaymentToken(token);
            if (byToken.isPresent()) {
                PaymentRecord rec = byToken.get();
                if (isSimulated && "pending".equalsIgnoreCase(rec.getStatus())) {
                    rec.setStatus("completed");
                    rec.setGatewayTransactionId("FLOW-SIM-" + rec.getOrderId());
                    paymentRepository.save(rec);
                }
                return PaymentStatusDto.builder()
                        .success("completed".equalsIgnoreCase(rec.getStatus()))
                        .status(rec.getStatus())
                        .orderId(rec.getOrderId())
                        .gatewayTransactionId(rec.getGatewayTransactionId())
                        .amount(rec.getAmount())
                        .payer(rec.getUserEmail())
                        .message("Estado consultado desde registro de pagos")
                        .build();
            }

            if (flowClientService.isConfiguredWithRealCredentials()) {
                return processWebhook(token);
            }
        }

        if (orderId != null && !orderId.isBlank()) {
            PaymentRecord record = paymentRepository.findByOrderId(orderId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Orden no encontrada: " + orderId));

            return PaymentStatusDto.builder()
                    .success("completed".equalsIgnoreCase(record.getStatus()))
                    .status(record.getStatus())
                    .orderId(record.getOrderId())
                    .gatewayTransactionId(record.getGatewayTransactionId())
                    .amount(record.getAmount())
                    .payer(record.getUserEmail())
                    .message("Estado consultado desde base de datos")
                    .build();
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debe proveer token o orderId");
    }
}
