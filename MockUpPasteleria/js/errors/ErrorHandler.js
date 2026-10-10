/**
 * ============================================================================
 * MANEJADOR DE ERRORES GLOBAL (EJEMPLO OPL)
 * ============================================================================
 * Centralizamos los errores. Nadie usa alert() ni console.error() directamente 
 * en los componentes de UI. Se llama a este manejador.
 */

// Importamos el diccionario visual (simulado)
const UI_DICTIONARY = require('../constants/diccionario_ui.js');

class GlobalErrorHandler {
    
    /**
     * Procesa la respuesta fallida de la API y determina qué mostrar al usuario.
     * @param {number} httpStatus - El código de estado (400, 401, 500, etc.)
     * @param {string} customMessage - Mensaje opcional enviado por el backend
     */
    static handleApiError(httpStatus, customMessage = null) {
        switch (httpStatus) {
            case 400:
                this.showToast(customMessage || "Datos inválidos en el formulario.");
                break;
            case 401:
                this.showToast(UI_DICTIONARY.common.alerts.error_unauthorized);
                this.redirectToLogin();
                break;
            case 404:
                this.showToast("El recurso solicitado no fue encontrado.");
                break;
            case 500:
            default:
                this.showToast(UI_DICTIONARY.common.alerts.error_server);
                // Aquí podríamos integrar Sentry o Datadog para reportar al equipo
                this.logToServer(httpStatus, customMessage);
                break;
        }
    }

    // Funciones auxiliares (Lógica interna que luego será reemplazada por librerías reales)
    static showToast(message) {
        // En React esto dispararía un contexto de notificaciones (ej. react-toastify)
        console.warn(`[UI TOAST] Mostrar al usuario: ${message}`);
    }

    static redirectToLogin() {
        console.warn("[ROUTER] Redirigiendo a /login...");
        // window.location.href = '/login';
    }

    static logToServer(status, error) {
        console.error(`[CRITICAL] Error ${status} no manejado:`, error);
    }
}

if (typeof module !== 'undefined') {
    module.exports = GlobalErrorHandler;
}
