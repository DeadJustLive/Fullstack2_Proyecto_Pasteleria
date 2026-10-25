package com.cremeco.payment.flow.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class FlowClientService {

    private final FlowSignatureService signatureService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${flow.api-url:https://sandbox.flow.cl/api}")
    private String flowApiUrl;

    @Value("${flow.api-key}")
    private String apiKey;

    @Value("${flow.url-confirmation}")
    private String urlConfirmation;

    @Value("${flow.url-return}")
    private String urlReturn;

    /**
     * Crea una orden de pago en Flow.cl y retorna la URL para redirigir al pagador.
     */
    public Map<String, Object> createPaymentOrder(
            String commerceOrder,
            String subject,
            long amountClp,
            String email,
            String customUrlReturn,
            String customUrlConfirmation,
            String idempotencyKey
    ) {
        String endpoint = flowApiUrl + "/payment/create";

        Map<String, String> params = new HashMap<>();
        params.put("apiKey", apiKey);
        params.put("commerceOrder", commerceOrder);
        params.put("subject", subject);
        params.put("currency", "CLP");
        params.put("amount", String.valueOf(amountClp));
        params.put("email", email);
        params.put("urlConfirmation", customUrlConfirmation != null && !customUrlConfirmation.isBlank() ? customUrlConfirmation : urlConfirmation);
        params.put("urlReturn", customUrlReturn != null && !customUrlReturn.isBlank() ? customUrlReturn : urlReturn);

        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            params.put("optional", String.format("{\"idempotencyKey\":\"%s\"}", idempotencyKey));
        }

        // Generar firma HMAC-SHA256 oficial
        String signature = signatureService.calculateSignature(params);
        params.put("s", signature);

        MultiValueMap<String, String> formBody = new LinkedMultiValueMap<>();
        params.forEach(formBody::add);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(formBody, headers);

        log.info("Creando orden en Flow: commerceOrder={}, amount={}", commerceOrder, amountClp);
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                endpoint,
                HttpMethod.POST,
                request,
                new ParameterizedTypeReference<>() {}
        );

        return response.getBody();
    }

    /**
     * Consulta el estado de un pago en Flow mediante su token.
     */
    public Map<String, Object> getPaymentStatus(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Token de Flow requerido");
        }

        Map<String, String> params = new HashMap<>();
        params.put("apiKey", apiKey);
        params.put("token", token);

        String signature = signatureService.calculateSignature(params);

        String endpoint = String.format("%s/payment/getStatus?apiKey=%s&token=%s&s=%s",
                flowApiUrl, apiKey, token, signature);

        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                endpoint,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {}
        );

        return response.getBody();
    }

    /**
     * Solicita un reembolso de pago en Flow.cl.
     */
    public Map<String, Object> refundPayment(
            String refundCommerceOrder,
            String receiverEmail,
            long amount,
            String originalCommerceOrder,
            String originalFlowTrxId,
            String urlCallBack
    ) {
        String endpoint = flowApiUrl + "/refund/create";

        Map<String, String> params = new HashMap<>();
        params.put("apiKey", apiKey);
        params.put("refundCommerceOrder", refundCommerceOrder);
        params.put("receiverEmail", receiverEmail);
        params.put("amount", String.valueOf(amount));
        params.put("urlCallBack", urlCallBack != null && !urlCallBack.isBlank() ? urlCallBack : urlConfirmation);

        if (originalFlowTrxId != null && !originalFlowTrxId.isBlank()) {
            params.put("flowTrxId", originalFlowTrxId);
        } else if (originalCommerceOrder != null && !originalCommerceOrder.isBlank()) {
            params.put("commerceTrxId", originalCommerceOrder);
        } else {
            throw new IllegalArgumentException("Se requiere originalCommerceOrder o originalFlowTrxId para reembolso");
        }

        String signature = signatureService.calculateSignature(params);
        params.put("s", signature);

        MultiValueMap<String, String> formBody = new LinkedMultiValueMap<>();
        params.forEach(formBody::add);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(formBody, headers);

        log.info("Creando reembolso en Flow: refundOrderId={}, amount={}", refundCommerceOrder, amount);
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                endpoint,
                HttpMethod.POST,
                request,
                new ParameterizedTypeReference<>() {}
        );

        return response.getBody();
    }
}
