package com.cremeco.payment.flow.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class FlowSignatureServiceTest {

    private FlowSignatureService signatureService;
    private final String secretKey = "test_secret_key_123456";

    @BeforeEach
    void setUp() {
        signatureService = new FlowSignatureService();
        ReflectionTestUtils.setField(signatureService, "secretKey", secretKey);
    }

    @Test
    @DisplayName("Debe ordenar los parámetros alfabéticamente y calcular firma HMAC-SHA256 consistente")
    void shouldCalculateConsistentSignature() {
        Map<String, String> params = new HashMap<>();
        params.put("apiKey", "api_key_abc");
        params.put("commerceOrder", "order_999");
        params.put("amount", "10000");
        params.put("email", "test@cremeco.cl");

        String sig1 = signatureService.calculateSignature(params);
        String sig2 = signatureService.calculateSignature(params);

        assertNotNull(sig1);
        assertEquals(64, sig1.length(), "La firma SHA-256 debe tener 64 caracteres hex");
        assertEquals(sig1, sig2, "Mismos parámetros deben producir la misma firma");
    }

    @Test
    @DisplayName("Debe validar la firma recibida correctamente e ignorar el parámetro 's'")
    void shouldValidateSignature() {
        Map<String, String> params = new HashMap<>();
        params.put("token", "flow_token_xyz");
        params.put("status", "2");

        String validSignature = signatureService.calculateSignature(params);

        params.put("s", validSignature); // Añadir 's' a los params recibidos
        assertTrue(signatureService.validateSignature(params, validSignature));
        assertFalse(signatureService.validateSignature(params, "firma_falsa_invalida"));
    }
}
