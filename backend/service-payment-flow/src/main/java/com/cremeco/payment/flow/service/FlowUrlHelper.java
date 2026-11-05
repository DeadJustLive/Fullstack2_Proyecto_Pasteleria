package com.cremeco.payment.flow.service;

import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Component
public class FlowUrlHelper {

    public String urlEncode(String val) {
        return val == null ? "" : URLEncoder.encode(val, StandardCharsets.UTF_8);
    }

    public String cleanStoreUrl(String storeUrl) {
        return (storeUrl == null || storeUrl.isBlank())
                ? "http://localhost:5173"
                : storeUrl.trim().replaceAll("^[\"']|[\"']$", "").replaceAll("/+$", "");
    }

    public String buildSimulatorUrl(String storeUrl, String token, String commerceOrder, long amount, String email) {
        return cleanStoreUrl(storeUrl) + "/pago/flow-gateway?token=" + urlEncode(token)
                + "&orderId=" + urlEncode(commerceOrder)
                + "&amount=" + amount
                + "&email=" + urlEncode(email);
    }

    public List<String> evaluateConfirmationWarnings(String urlConfirmation) {
        List<String> warnings = new ArrayList<>();
        if (urlConfirmation == null || urlConfirmation.isBlank()) {
            warnings.add("urlConfirmation no está configurada.");
        } else {
            String lower = urlConfirmation.toLowerCase();
            if (lower.contains("localhost") || lower.contains("127.0.0.1") || lower.contains("api-gateway")) {
                warnings.add("urlConfirmation (" + urlConfirmation + ") no es una URL pública en internet. " +
                        "Los webhooks asíncronos de Flow.cl no podrán alcanzar tu servidor local; " +
                        "la confirmación se procesará mediante el retorno del navegador del comprador (/return). " +
                        "Para pruebas de webhook directas use un túnel como ngrok o cloudflared.");
            }
        }
        return warnings;
    }
}
