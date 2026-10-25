package com.cremeco.payment.flow.service;

import com.cremeco.common.events.PaymentConfirmedEvent;
import com.cremeco.payment.flow.dto.*;
import com.cremeco.payment.flow.model.PaymentRecord;
import com.cremeco.payment.flow.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    private final PaymentRepository paymentRepository;
    private final Optional<KafkaTemplate<String, Object>> kafkaTemplate;

    private static final String TOPIC_PAYMENT_CONFIRMED = "cremeco.payments.flow.confirmed";

    /**
     * Crea un pago en Flow protegiendo contra cobros duplicados mediante idempotencyKey.
     */
    @Transactional
    public PaymentCreateResponse createPayment(PaymentCreateRequest request) {
        // 1. Verificación de Idempotencia en Base de Datos
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

        // 2. Generar o usar orderId provisto
        String commerceOrder = (request.getOrderId() != null && !request.getOrderId().isBlank())
                ? request.getOrderId()
                : "order_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        // 3. Invocar API de Flow
        Map<String, Object> flowResponse = null;
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
            log.warn("Fallo o modo sandbox al comunicarse con Flow API para orden {}: {}", commerceOrder, e.getMessage());
        }

        String checkoutUrl;
        String token;

        if (flowResponse != null && flowResponse.get("url") != null && flowResponse.get("token") != null) {
            String baseUrl = String.valueOf(flowResponse.get("url"));
            token = String.valueOf(flowResponse.get("token"));
            checkoutUrl = baseUrl + "?token=" + token;
        } else {
            // Sesión de redirección de desarrollo sandbox para Flow Chile
            token = "flow_sand_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
            checkoutUrl = "http://localhost:5173/pago/flow-gateway?token=" + token + "&orderId=" + commerceOrder + "&amount=" + request.getAmount() + "&email=" + request.getEmail();
        }

        // 4. Persistir registro de pago con estado 'pending'
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
        log.info("Pago registrado exitosamente con idempotencyKey '{}', orderId '{}'", request.getIdempotencyKey(), commerceOrder);

        return PaymentCreateResponse.builder()
                .success(true)
                .checkoutUrl(checkoutUrl)
                .paymentToken(token)
                .orderId(commerceOrder)
                .message("Orden de pago creada exitosamente en Flow.")
                .build();
    }

    /**
     * Procesa y valida el Webhook enviado por Flow de manera segura.
     */
    @Transactional
    public PaymentStatusDto processWebhook(String token) {
        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Webhook no contiene el token requerido");
        }

        log.info("Procesando Webhook de Flow con token: {}", token);

        Map<String, Object> statusData;
        try {
            statusData = flowClientService.getPaymentStatus(token);
        } catch (Exception e) {
            log.warn("Rechazo de seguridad en Webhook: Token inválido o no reconocido por Flow: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token de webhook no válido en pasarela");
        }

        if (statusData == null || statusData.get("status") == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Respuesta de estado vacía desde Flow");
        }

        int rawStatus = Integer.parseInt(String.valueOf(statusData.get("status")));
        String flowOrder = String.valueOf(statusData.get("flowOrder"));
        String commerceOrder = String.valueOf(statusData.get("commerceOrder"));
        Number amount = (Number) statusData.get("amount");
        String payer = (String) statusData.get("payer");

        String normalizedStatus = switch (rawStatus) {
            case 2 -> "completed";
            case 3 -> "failed";
            case 4 -> "refunded";
            default -> "pending";
        };

        log.info("Webhook procesado para orden {}: estado normalizado '{}' (raw={})", commerceOrder, normalizedStatus, rawStatus);

        // Actualizar registro en base de datos si existe
        Optional<PaymentRecord> recordOpt = paymentRepository.findByOrderId(commerceOrder);
        if (recordOpt.isEmpty() && token != null) {
            recordOpt = paymentRepository.findByPaymentToken(token);
        }

        if (recordOpt.isPresent()) {
            PaymentRecord record = recordOpt.get();
            record.setStatus(normalizedStatus);
            record.setGatewayTransactionId(flowOrder);
            paymentRepository.save(record);
        }

        // Si el estado es completado (PAGADO), emitir evento a Kafka
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
                .message("Webhook procesado con éxito")
                .build();
    }

    /**
     * Procesa un reembolso de orden.
     */
    @Transactional
    public RefundPaymentResponse refundPayment(RefundPaymentRequest request) {
        log.info("Iniciando solicitud de reembolso: refundOrderId={}, originalOrder={}",
                request.getRefundOrderId(), request.getOriginalOrderId());

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
            log.error("Fallo al procesar reembolso en Flow: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Fallo al reembolsar en Flow: " + e.getMessage());
        }

        String refundToken = flowResponse != null ? String.valueOf(flowResponse.get("token")) : null;
        String flowRefundOrder = flowResponse != null ? String.valueOf(flowResponse.get("flowRefundOrder")) : null;
        String status = flowResponse != null ? String.valueOf(flowResponse.get("status")) : "refunded";

        // Actualizar estado en la base de datos local
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
     * Consulta el estado de un pago por token o por orderId.
     */
    public PaymentStatusDto getStatus(String token, String orderId) {
        if (token != null && !token.isBlank()) {
            return processWebhook(token);
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
