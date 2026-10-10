/**
 * ============================================================================
 * DICCIONARIO DE INTERFAZ DE USUARIO (UI DICTIONARY)
 * ============================================================================
 * 
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es la ÚNICA fuente de la verdad para cualquier texto que lea el usuario final.
 * 
 * ¿POR QUÉ LO USAMOS? (Ventajas para el equipo)
 * 1. Evita errores de tipeo: Si alguien escribe "Iniciar Sesión" y otro "Iniciar sesión", 
 *    la web se verá inconsistente. Al usar este diccionario, garantizamos consistencia.
 * 2. Facilita cambios masivos: Si el profesor/cliente dice "Cámbienme todos los botones
 *    que dicen 'Comprar' por 'Agregar al Carro'", solo cambiamos 1 línea aquí, en lugar 
 *    de buscar en 50 archivos de React.
 * 3. Preparación para Internacionalización (i18n): Si el proyecto debe lanzarse en Inglés,
 *    simplemente creamos un `diccionario_ui_en.js` y el código no se toca.
 * 
 * ¿CÓMO SE USA EN REACT?
 * Mal: <button>Enviar Datos</button>
 * Bien: <button>{UI_DICTIONARY.buttons.submit}</button>
 * ============================================================================
 */

const UI_DICTIONARY = {
    // 1. Textos Genéricos y Reutilizables
    common: {
        buttons: {
            submit: "Enviar",
            cancel: "Cancelar",
            save: "Guardar Cambios",
            delete: "Eliminar",
            buy: "Comprar ahora"
        },
        alerts: {
            success: "Operación realizada con éxito.",
            error_server: "No pudimos conectar con el servidor. Inténtalo más tarde.",
            error_unauthorized: "No tienes permisos para ver esto."
        },
        placeholders: {
            search: "Buscar productos...",
            loading: "Cargando, por favor espera..."
        }
    },

    // 2. Textos Específicos por Módulo / Página
    navbar: {
        links: {
            home: "Inicio",
            about: "Quiénes Somos",
            contact: "Contacto",
            profile: "Mi Perfil"
        }
    },
    
    authModule: {
        login: {
            title: "Bienvenido de vuelta",
            subtitle: "Ingresa tus credenciales para continuar",
            emailLabel: "Correo Electrónico",
            passwordLabel: "Contraseña",
            forgotPassword: "¿Olvidaste tu contraseña?"
        },
        register: {
            title: "Crea una cuenta nueva",
            submitButton: "Registrarme"
        }
    }
};

// Exportación para ser consumido por los componentes (React/ES6)
// export default UI_DICTIONARY;

// Exportación temporal para Node/JS Clásico
if (typeof module !== 'undefined') {
    module.exports = UI_DICTIONARY;
}
