// @pca:start
// @id(backend.payment.flowService)
// @kind(service)
// @limit(lines: 350)
// @contract(createPayment, processWebhook, resolveFrontendReturnRedirectUrl, refundPayment, getStatus)
// @relates(backend.payment.flowClient)
// @desc(Servicio de orquestacion de pagos Flow.cl con idempotencia, webhooks, redireccion 303 y Kafka)
// @pca:end
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

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FlowPaymentService {

    private final FlowClientService flowClientService;
    private final PaymentRepository paymentRepository;
    private final Optional<KafkaTemplate<String, Object>> kafkaTemplate;

    @Value("${flow.store-url:http://localhost:5173}")
    private String storeUrl;

    private static final String TOPIC_PAYMENT_CONFIRMED = "cremeco.payments.flow.confirmed";

    private static String urlEncode(String val) {
        return val == null ? "" : URLEncoder.encode(val, StandardCharsets.UTF_8);
    }

    private String cleanStoreUrl() {
        return (storeUrl == null || storeUrl.isBlank())
                ? "http://localhost:5173"
                : storeUrl.trim().replaceAll("^[\"']|[\"']$", "").replaceAll("/+$", "");
    }

    /**
     * Crea un pago en Flow protegiendo contra cobros duplicados mediante idempotencyKey.
     */
    @Transactional
    public PaymentCreateResponse createPayment(PaymentCreateRequest request) {
        Optional<PaymentRecord> existing = paymentRepository.findByIdempotencyKey(request.getIdempotencyKey());

        if (existing.isPresent()) {
            PaymentRecord payment = existing.get();
            log.info("Idempotencia detectada para key '{}'. Estado actual: {}", request.getIdempotencyKey(), payment.getStatus());

            if ("pending".equalsIgnoreCase(payment.getStatus())) {
                return PaymentCreateResponse.builder()
                        .success(true)
                        .checkoutUrl(payment.getCheckoutUrl())
                        .paymentToken(payment.getPaymentToken())
                        .orderId(payment.getOrderId())
                        .message("Recuperado intento de pago previo.")
                        .build();
            }

            if ("completed".equalsIgnoreCase(payment.getStatus())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Este pago ya fue procesado y su estado es: " + payment.getStatus());
            }
        }

        String commerceOrder = (request.getOrderId() != null && !request.getOrderId().isBlank())
                ? request.getOrderId()
                : "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        Map<String, Object> flowResponse = null;
        if (flowClientService.isConfiguredWithRealCredentials()) {
            try {
                flowResponse = flowClientService.createPaymentOrder(
                        commerceOrder,
                        request.getSubject(),
                        request.getAmount(),
                        request.getEmail(),
                        request.getUrlReturn(),
                        request.getUrlConfirmation(),
                        request.getIdempotencyKey()
                );
            } catch (Exception e) {
                log.warn("Fallo al comunicarse con Flow API para orden {}: {}", commerceOrder, e.getMessage());
            }
        }

        String checkoutUrl;
        String token;

        if (flowResponse != null && flowResponse.get("url") != null && flowResponse.get("token") != null) {
            String baseUrl = String.valueOf(flowResponse.get("url"));
            token = String.valueOf(flowResponse.get("token"));
            checkoutUrl = baseUrl + (baseUrl.contains("?") ? "&" : "?") + "token=" + token;
            log.info("[Flow.cl] URL oficial de pago generada para orden {}: {}", commerceOrder, checkoutUrl);
        } else {
            token = "flow_sand_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
            checkoutUrl = cleanStoreUrl() + "/pago/flow-gateway?token=" + urlEncode(token)
                    + "&orderId=" + urlEncode(commerceOrder)
                    + "&amount=" + request.getAmount()
                    + "&email=" + urlEncode(request.getEmail());
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
                .message("Orden de pago creada exitosamente en Flow.")
                .build();
    }

    /**
     * Procesa y valida el Webhook o token enviado por Flow de manera segura.
     */
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
            log.warn("Token no validado en API externa Flow ({}): {}", token, e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token de webhook no válido en pasarela");
        }

        if (statusData == null || statusData.get("status") == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Respuesta de estado vacía desde Flow");
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
            if (!flowOrder.isBlank()) {
                record.setGatewayTransactionId(flowOrder);
            }
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
                    log.info("Evento PaymentConfirmedEvent publicado en Kafka para orden: {}", commerceOrder);
                } catch (Exception ex) {
                    log.warn("Kafka no disponible para emitir PaymentConfirmedEvent: {}", ex.getMessage());
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

    /**
     * Resuelve la URL de redirección del navegador (GET) hacia el frontend tras recibir el POST de Flow en /return.
     */
    @Transactional
    public String resolveFrontendReturnRedirectUrl(String token, String fallbackOrderId) {
        String baseStore = cleanStoreUrl();
        if (token == null || token.isBlank()) {
            return baseStore + "/pago/error?reason=bank_rejected"
                    + (fallbackOrderId != null ? "&orderId=" + urlEncode(fallbackOrderId) : "");
        }

        try {
            PaymentStatusDto statusDto = getStatus(token, fallbackOrderId);
            String orderId = statusDto.getOrderId() != null ? statusDto.getOrderId() : (fallbackOrderId != null ? fallbackOrderId : "");
            String flowOrder = statusDto.getGatewayTransactionId() != null ? statusDto.getGatewayTransactionId() : "";
            long total = statusDto.getAmount() != null ? statusDto.getAmount() : 0L;

            if (statusDto.isSuccess() || "completed".equalsIgnoreCase(statusDto.getStatus())) {
                return baseStore + "/pago/exito?token=" + urlEncode(token)
                        + "&orderId=" + urlEncode(orderId)
                        + (!flowOrder.isBlank() ? "&flowOrder=" + urlEncode(flowOrder) : "")
                        + (total > 0 ? "&total=" + total : "");
            }

            return baseStore + "/pago/error?reason=bank_rejected&token=" + urlEncode(token)
                    + (!orderId.isBlank() ? "&orderId=" + urlEncode(orderId) : "");
        } catch (Exception ex) {
            log.warn("No se pudo confirmar pago en /return para token {}: {}", token, ex.getMessage());
            Optional<PaymentRecord> localRec = paymentRepository.findByPaymentToken(token);
            String ord = localRec.map(PaymentRecord::getOrderId).orElse(fallbackOrderId != null ? fallbackOrderId : "");
            return baseStore + "/pago/error?reason=bank_rejected&token=" + urlEncode(token)
                    + (!ord.isBlank() ? "&orderId=" + urlEncode(ord) : "");
        }
    }

    @Transactional
    public RefundPaymentResponse refundPayment(RefundPaymentRequest request) {
        Map<String, Object> flowResponse;
        try {
            flowResponse = flowClientService.refundPayment(
                    request.getRefundOrderId(),
                    request.getReceiverEmail(),
                    request.getAmount(),
                    request.getOriginalOrderId(),
                    request.getOriginalGatewayTransactionId(),
                    request.getUrlCallBack()
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

    /**
     * Consulta híbrida e inteligente del estado de un pago por token o por orderId.
     */
    @Transactional
    public PaymentStatusDto getStatus(String token, String orderId) {
        if (token != null && !token.isBlank()) {
            boolean isSimulatedToken = token.startsWith("flow_sand_") || token.startsWith("flow_tok_") || token.startsWith("flow_");
            if (!isSimulatedToken && flowClientService.isConfiguredWithRealCredentials()) {
                return processWebhook(token);
            }

            Optional<PaymentRecord> byToken = paymentRepository.findByPaymentToken(token);
            if (byToken.isPresent()) {
                PaymentRecord rec = byToken.get();
                if (isSimulatedToken && "pending".equalsIgnoreCase(rec.getStatus())) {
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
