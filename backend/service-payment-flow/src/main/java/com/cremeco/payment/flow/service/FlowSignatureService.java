package com.cremeco.payment.flow.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
import java.util.TreeMap;

@Service
public class FlowSignatureService {

    @Value("${flow.secret-key}")
    private String secretKey;

    /**
     * Calcula la firma HMAC-SHA256 ordenando los parámetros alfabéticamente (A-Z).
     * Regla oficial de Flow: concatena llave y valor sucesivamente sin separadores.
     */
    public String calculateSignature(Map<String, String> params) {
        Map<String, String> sortedParams = new TreeMap<>(params);
        StringBuilder toSign = new StringBuilder();

        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            if (!"s".equalsIgnoreCase(entry.getKey()) && entry.getValue() != null) {
                toSign.append(entry.getKey()).append(entry.getValue());
            }
        }

        return hmacSha256(toSign.toString(), secretKey);
    }

    /**
     * Valida que la firma recibida en un Webhook de Flow coincida exactamente con la esperada.
     */
    public boolean validateSignature(Map<String, String> params, String signatureReceived) {
        if (signatureReceived == null || signatureReceived.isBlank()) {
            return false;
        }
        String expectedSignature = calculateSignature(params);
        return expectedSignature.equalsIgnoreCase(signatureReceived);
    }

    private String hmacSha256(String data, String key) {
        try {
            Mac sha256Hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256Hmac.init(secretKeySpec);
            byte[] signedBytes = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hex = new StringBuilder();
            for (byte b : signedBytes) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new IllegalStateException("Error al calcular firma HMAC-SHA256 de Flow", e);
        }
    }
}
