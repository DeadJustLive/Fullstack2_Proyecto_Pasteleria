package com.cremeco.payment.flow.service;

import com.cremeco.payment.flow.dto.PaymentCreateRequest;
import com.cremeco.payment.flow.dto.PaymentCreateResponse;
import com.cremeco.payment.flow.dto.PaymentStatusDto;
import com.cremeco.payment.flow.model.PaymentRecord;
import com.cremeco.payment.flow.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FlowPaymentServiceTest {

    @Mock
    private FlowClientService flowClientService;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    private FlowPaymentService flowPaymentService;

    @BeforeEach
    void setUp() {
        flowPaymentService = new FlowPaymentService(flowClientService, paymentRepository, Optional.of(kafkaTemplate));
    }

    @Test
    @DisplayName("Idempotencia: Si ya existe un pago pendiente con la misma key, retorna la URL existente sin llamar a Flow")
    void shouldReturnExistingPaymentOnDuplicateIdempotencyKey() {
        String key = "test_idem_duplicate_123";
        PaymentRecord existingRecord = PaymentRecord.builder()
                .idempotencyKey(key)
                .orderId("order_prev_001")
                .status("pending")
                .checkoutUrl("https://sandbox.flow.cl/pay?token=token_prev_123")
                .paymentToken("token_prev_123")
                .build();

        when(paymentRepository.findByIdempotencyKey(key)).thenReturn(Optional.of(existingRecord));

        PaymentCreateRequest request = PaymentCreateRequest.builder()
                .idempotencyKey(key)
                .amount(15000L)
                .email("cliente@test.com")
                .subject("Torta de Chocolate")
                .build();

        PaymentCreateResponse response = flowPaymentService.createPayment(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("https://sandbox.flow.cl/pay?token=token_prev_123", response.getCheckoutUrl());
        assertEquals("token_prev_123", response.getPaymentToken());
        assertEquals("Recuperado intento de pago previo.", response.getMessage());

        // Verificar que NO llamó a la API externa de Flow
        verify(flowClientService, never()).createPaymentOrder(anyString(), anyString(), anyLong(), anyString(), any(), any(), any());
    }

    @Test
    @DisplayName("Idempotencia: Si el pago ya fue completado, rechaza con 409 Conflict")
    void shouldThrowConflictIfPaymentAlreadyCompleted() {
        String key = "test_idem_paid_123";
        PaymentRecord paidRecord = PaymentRecord.builder()
                .idempotencyKey(key)
                .status("completed")
                .build();

        when(paymentRepository.findByIdempotencyKey(key)).thenReturn(Optional.of(paidRecord));

        PaymentCreateRequest request = PaymentCreateRequest.builder()
                .idempotencyKey(key)
                .amount(10000L)
                .email("cliente@test.com")
                .subject("Torta Tres Leches")
                .build();

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                flowPaymentService.createPayment(request)
        );

        assertEquals(409, ex.getStatusCode().value());
    }

    @Test
    @DisplayName("Seguridad: Si se recibe un webhook con token falso o inválido, debe rechazar con 400 Bad Request")
    void shouldRejectFakeOrInvalidWebhookToken() {
        String fakeToken = "hacker_token_falso_123";
        when(flowClientService.getPaymentStatus(fakeToken)).thenThrow(new RuntimeException("Flow 404 Token not found"));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                flowPaymentService.processWebhook(fakeToken)
        );

        assertEquals(400, ex.getStatusCode().value());
        assertTrue(ex.getReason().contains("Token de webhook no válido"));
    }

    @Test
    @DisplayName("Webhook: Si el status en Flow es 2, normaliza a 'completed' y emite Kafka PaymentConfirmedEvent")
    void shouldProcessSuccessfulWebhookAndPublishKafka() {
        String validToken = "valid_flow_token_abc";
        Map<String, Object> flowStatusResponse = new HashMap<>();
        flowStatusResponse.put("status", 2);
        flowStatusResponse.put("flowOrder", "987654");
        flowStatusResponse.put("commerceOrder", "order_12345");
        flowStatusResponse.put("amount", 25000);
        flowStatusResponse.put("payer", "comprador@cremeco.cl");

        when(flowClientService.getPaymentStatus(validToken)).thenReturn(flowStatusResponse);
        when(paymentRepository.findByOrderId("order_12345")).thenReturn(Optional.of(
                PaymentRecord.builder()
                        .orderId("order_12345")
                        .status("pending")
                        .build()
        ));

        PaymentStatusDto result = flowPaymentService.processWebhook(validToken);

        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertEquals("completed", result.getStatus());
        assertEquals("order_12345", result.getOrderId());
        assertEquals("987654", result.getGatewayTransactionId());

        // Verificar que emitió evento a Kafka
        verify(kafkaTemplate, times(1)).send(eq("cremeco.payments.flow.confirmed"), eq("order_12345"), any());
    }
}
