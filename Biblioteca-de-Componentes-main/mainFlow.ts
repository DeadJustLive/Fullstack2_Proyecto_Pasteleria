// En Supabase Edge Functions / Deno, usamos las APIs web estándar (fetch, crypto, URLSearchParams)
// y accedemos a las variables de entorno con Deno.env.get()

// Configuraciones principales
const config = {
  apiUrl: "https://sandbox.flow.cl/api",
  apiKey: Deno.env.get("FLOW_API_KEY") ?? "",
  secretKey: Deno.env.get("FLOW_SECRET_KEY") ?? ""
};

// Interfaz para los parámetros de la petición
interface PaymentParams {
  apiKey: string;
  commerceOrder: string;
  urlConfirmation: string;
  urlReturn: string;
  email: string;
  subject: string;
  amount: number;
  [key: string]: string | number;
}

// Genera la firma HMAC SHA256 usando Web Crypto API
async function createSignature(params: PaymentParams, secretKey: string): Promise<string> {
  const keys = Object.keys(params).sort();
  
  let toSign = "";
  for (const key of keys) {
    toSign += key + params[key];
  }

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const dataToSign = encoder.encode(toSign);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, dataToSign);
  
  // Convertir a string hexadecimal
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function createPayment() {
  const params: PaymentParams = {
    apiKey: config.apiKey,
    commerceOrder: crypto.randomUUID(), // Web Crypto API tiene randomUUID
    urlConfirmation: "https://mydomain.com/confirmation",
    urlReturn: "https://mydomain.com/payment-status",
    email: "juanperez123@gmail.com",
    subject: "Compra de articulos en tienda online",
    amount: 30000,
  };

  try {
    const signature = await createSignature(params, config.secretKey);

    // Crear el form-urlencoded body usando la API estándar URLSearchParams
    const bodyParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      bodyParams.append(key, String(value));
    }
    bodyParams.append("s", signature);

    // Enviar petición con la API fetch nativa de Deno
    const response = await fetch(`${config.apiUrl}/payment/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: bodyParams.toString(),
    });

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("checkout url", `${data.url}?token=${data.token}`);
    
    return data;
  } catch (error) {
    console.error("Error procesando pago:", error);
    throw error;
  }
}

// Llama a la función si se ejecuta este archivo directamente
if (import.meta.main) {
  createPayment();
}
