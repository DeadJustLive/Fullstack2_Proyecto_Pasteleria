// @pca:start
// @id(backend.payment.flowClient)
// @kind(service)
// @limit(lines: 200)
// @contract(createPaymentOrder, getPaymentStatus, refundPayment, isConfiguredWithRealCredentials)
// @relates(backend.payment.flowSignature)
// @desc(Cliente HTTP para comunicacion firmada con API oficial de Flow.cl)
// @pca:end
package com.cremeco.payment.flow.service;

import jakarta.annotation.PostConstruct;
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

    private static String sanitize(String value) {
        return value == null ? "" : value.trim().replaceAll("^[\"']|[\"']$", "");
    }

    @PostConstruct
    public void initDiagnostics() {
        this.flowApiUrl = sanitize(this.flowApiUrl).replaceAll("/+$", "");
        this.apiKey = sanitize(this.apiKey);
        this.urlConfirmation = sanitize(this.urlConfirmation);
        this.urlReturn = sanitize(this.urlReturn);

        if (isConfiguredWithRealCredentials()) {
            log.info("[Flow.cl] Credenciales detectadas desde entorno. Modo Pasarela Externa ACTIVO ({})", this.flowApiUrl);
        } else {
            log.warn("[Flow.cl] Usando llaves placeholder por defecto. Se activará el Simulador Híbrido Local.");
        }
    }

    public boolean isConfiguredWithRealCredentials() {
        return apiKey != null && !apiKey.isBlank()
                && !"FLOW_SANDBOX_API_KEY".equalsIgnoreCase(apiKey)
                && !apiKey.startsWith("reemplazar_");
    }

    private String resolveSafeUrlReturn(String customUrlReturn) {
        String candidate = (customUrlReturn != null && !customUrlReturn.isBlank())
                ? sanitize(customUrlReturn) : this.urlReturn;
        if (candidate.endsWith("/pago/exito") || candidate.contains(":5173/pago/")) {
            return "http://localhost:8080/api/payments/flow/return";
        }
        return candidate;
    }

    private Map<String, Object> postSignedForm(String endpoint, Map<String, String> params, String actionLabel) {
        params.put("s", signatureService.calculateSignature(params));
        MultiValueMap<String, String> formBody = new LinkedMultiValueMap<>();
        params.forEach(formBody::add);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(formBody, headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    endpoint, HttpMethod.POST, request, new ParameterizedTypeReference<>() {});
            return response.getBody();
        } catch (HttpStatusCodeException ex) {
            log.error("[Flow.cl HTTP {}] Error en {}: {}", ex.getStatusCode(), actionLabel, ex.getResponseBodyAsString());
            throw ex;
        }
    }

    public Map<String, Object> createPaymentOrder(
            String commerceOrder,
            String subject,
            long amountClp,
            String email,
            String customUrlReturn,
            String customUrlConfirmation,
            String idempotencyKey
    ) {
        Map<String, String> params = new HashMap<>();
        params.put("apiKey", apiKey);
        params.put("commerceOrder", commerceOrder);
        params.put("subject", subject);
        params.put("currency", "CLP");
        params.put("amount", String.valueOf(amountClp));
        params.put("email", email);
        params.put("urlConfirmation", customUrlConfirmation != null && !customUrlConfirmation.isBlank()
                ? sanitize(customUrlConfirmation) : urlConfirmation);
        params.put("urlReturn", resolveSafeUrlReturn(customUrlReturn));

        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            params.put("optional", String.format("{\"idempotencyKey\":\"%s\"}", idempotencyKey));
        }

        log.info("Creando orden en Flow ({}): commerceOrder={}, amount={}, urlReturn={}",
                flowApiUrl, commerceOrder, amountClp, params.get("urlReturn"));
        return postSignedForm(flowApiUrl + "/payment/create", params, "/payment/create");
    }

    public Map<String, Object> getPaymentStatus(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Token de Flow requerido");
        }
        String cleanToken = token.trim();
        Map<String, String> params = new HashMap<>();
        params.put("apiKey", apiKey);
        params.put("token", cleanToken);

        String signature = signatureService.calculateSignature(params);
        String endpoint = String.format("%s/payment/getStatus?apiKey=%s&token=%s&s=%s",
                flowApiUrl, apiKey, cleanToken, signature);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    endpoint, HttpMethod.GET, null, new ParameterizedTypeReference<>() {});
            return response.getBody();
        } catch (HttpStatusCodeException ex) {
            log.error("[Flow.cl HTTP {}] Error en /payment/getStatus: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw ex;
        }
    }

    public Map<String, Object> refundPayment(
            String refundCommerceOrder,
            String receiverEmail,
            long amount,
            String originalCommerceOrder,
            String originalFlowTrxId,
            String urlCallBack
    ) {
        Map<String, String> params = new HashMap<>();
        params.put("apiKey", apiKey);
        params.put("refundCommerceOrder", refundCommerceOrder);
        params.put("receiverEmail", receiverEmail);
        params.put("amount", String.valueOf(amount));
        params.put("urlCallBack", urlCallBack != null && !urlCallBack.isBlank() ? sanitize(urlCallBack) : urlConfirmation);

        if (originalFlowTrxId != null && !originalFlowTrxId.isBlank()) {
            params.put("flowTrxId", originalFlowTrxId);
        } else if (originalCommerceOrder != null && !originalCommerceOrder.isBlank()) {
            params.put("commerceTrxId", originalCommerceOrder);
        } else {
            throw new IllegalArgumentException("Se requiere originalCommerceOrder o originalFlowTrxId para reembolso");
        }

        log.info("Creando reembolso en Flow: refundOrderId={}, amount={}", refundCommerceOrder, amount);
        return postSignedForm(flowApiUrl + "/refund/create", params, "/refund/create");
    }
}
