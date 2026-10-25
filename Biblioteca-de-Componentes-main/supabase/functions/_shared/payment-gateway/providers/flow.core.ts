import { PaymentGatewayConfig } from "../types.ts";

export abstract class FlowCore {
  protected readonly config: PaymentGatewayConfig;
  protected readonly providerName = 'Flow';

  constructor(config: PaymentGatewayConfig) {
    this.config = config;
  }

  /**
   * Genera el HMAC SHA256 usando Web Crypto API
   */
  protected async generateSignature(params: Record<string, string | number>): Promise<string> {
    const keys = Object.keys(params).sort();
    
    let toSign = "";
    for (const key of keys) {
      toSign += key + params[key];
    }

    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.config.secretKey);
    const dataToSign = encoder.encode(toSign);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, dataToSign);
    
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Construye el body form-urlencoded
   */
  protected buildFormData(params: Record<string, string | number>, signature: string): string {
    const bodyParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      bodyParams.append(key, String(value));
    }
    bodyParams.append("s", signature);
    return bodyParams.toString();
  }

  /**
   * Ejecuta la petición HTTP POST a Flow y maneja errores de red
   */
  protected async executeHttpRequest(endpoint: string, bodyUrlEncoded: string): Promise<any> {
    const response = await fetch(`${this.config.apiUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyUrlEncoded,
    });

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        // Flow suele mandar el detalle del error en `message` o `error`
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } catch (e) {
        // Ignorar si no es JSON
      }
      throw new Error(`HTTP Error ${response.status}: ${errorMessage}`);
    }

    return await response.json();
  }
}
