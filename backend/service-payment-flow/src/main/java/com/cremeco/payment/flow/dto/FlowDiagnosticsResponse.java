// @pca:start
// @id(backend.service_payment_flow.main.java.com.cremeco.payment.flow.dto.flowdiagnosticsresponse)
// @kind(component)
// @limit(lines: 80)
// @desc(DTO de diagnostico de conectividad y configuracion de Flow.cl)
// @pca:end
package com.cremeco.payment.flow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlowDiagnosticsResponse {
    private boolean configuredWithRealCredentials;
    private String flowApiUrl;
    private String apiKeyMasked;
    private String urlConfirmation;
    private String urlReturn;
    private String storeUrl;
    private boolean strictRealMode;
    private List<String> warnings;
}
