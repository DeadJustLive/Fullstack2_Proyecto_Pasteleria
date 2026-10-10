// auth.js
document.addEventListener("DOMContentLoaded", () => {
    // Determinar prefix
    const isSubdir = window.location.pathname.includes('productos/');
    const prefix = isSubdir ? '../' : '';

    // Inyectar Modales HTML
    const modalsContainer = document.getElementById("auth-modals-container");
    if(modalsContainer) {
        modalsContainer.innerHTML = `
            <!-- Modal Login -->
            <div class="modal-overlay" id="modal-login">
                <div class="modal-content">
                    <span class="modal-close" onclick="closeAuthModals()">&times;</span>
                    <h2 style="margin-bottom: 1.5rem;">Iniciar sesión</h2>
                    <form onsubmit="handleLogin(event)">
                        <div class="form-group" style="margin-bottom: 1rem; text-align: left;">
                            <label style="display:block; margin-bottom: 0.4rem;">Correo</label>
                            <input type="email" placeholder="Ej: micorreo@ejemplo.com" style="width: 100%; padding: 0.7rem; border: 1px solid rgba(93,64,55,0.3); border-radius: 8px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 1.5rem; text-align: left;">
                            <label style="display:block; margin-bottom: 0.4rem;">Contraseña</label>
                            <div style="position: relative; display: flex; align-items: center;">
                                <input type="password" placeholder="Ingresa tu contraseña" style="width: 100%; padding: 0.7rem; padding-right: 40px; border: 1px solid rgba(93,64,55,0.3); border-radius: 8px;">
                                <button type="button" onclick="togglePassword(this)" style="position: absolute; right: 10px; background: none; border: none; cursor: pointer; color: var(--color-secondary); padding: 0; display: flex;" title="Mostrar/Ocultar contraseña">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                </button>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">Entrar</button>
                    </form>
                    <p style="margin-top: 1.5rem; text-align: center; font-size: 0.95rem;">¿No tienes cuenta? <a href="#" onclick="openModal('modal-registro')">Regístrate</a></p>
                </div>
            </div>

            <!-- Modal Registro -->
            <div class="modal-overlay" id="modal-registro">
                <div class="modal-content">
                    <span class="modal-close" onclick="closeAuthModals()">&times;</span>
                    <h2 style="margin-bottom: 1.5rem;">Crear cuenta</h2>
                    <form onsubmit="handleRegistro(event)">
                        <div class="form-group" style="margin-bottom: 1rem; text-align: left;">
                            <label style="display:block; margin-bottom: 0.4rem;">Nombre</label>
                            <input type="text" placeholder="Ej: Juan Pérez" style="width: 100%; padding: 0.7rem; border: 1px solid rgba(93,64,55,0.3); border-radius: 8px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 1rem; text-align: left;">
                            <label style="display:block; margin-bottom: 0.4rem;">Correo</label>
                            <input type="email" placeholder="Ej: micorreo@ejemplo.com" style="width: 100%; padding: 0.7rem; border: 1px solid rgba(93,64,55,0.3); border-radius: 8px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 1.5rem; text-align: left;">
                            <label style="display:block; margin-bottom: 0.4rem;">Contraseña</label>
                            <div style="position: relative; display: flex; align-items: center;">
                                <input type="password" placeholder="Crea una contraseña segura" style="width: 100%; padding: 0.7rem; padding-right: 40px; border: 1px solid rgba(93,64,55,0.3); border-radius: 8px;">
                                <button type="button" onclick="togglePassword(this)" style="position: absolute; right: 10px; background: none; border: none; cursor: pointer; color: var(--color-secondary); padding: 0; display: flex;" title="Mostrar/Ocultar contraseña">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                </button>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">Registrarme</button>
                    </form>
                    <p style="margin-top: 1.5rem; text-align: center; font-size: 0.95rem;">¿Ya tienes cuenta? <a href="#" onclick="openModal('modal-login')">Inicia sesión</a></p>
                </div>
            </div>
        
            <!-- Modal Compartir -->
            <div class="modal-overlay" id="modal-compartir">
                <div class="modal-content" style="max-width: 350px; text-align: center;">
                    <span class="modal-close" onclick="closeAuthModals()">&times;</span>
                    <h2 style="margin-bottom: 1.5rem; color: var(--color-tertiary);">Compartir Producto</h2>
                    
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                      <button type="button" class="btn" onclick="copiarLink(); closeAuthModals();" style="background: white; border: 1px solid var(--color-secondary); padding: 0.8rem; display: flex; align-items: center; justify-content: center; color: var(--color-secondary); gap: 0.5rem;" title="Copiar enlace">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                        Copiar Enlace
                      </button>
                      
                      <a href="#" onclick="compartirWhatsapp(); closeAuthModals();" class="btn" style="background: white; border: 1px solid #25D366; padding: 0.8rem; display: flex; align-items: center; justify-content: center; color: #25D366; gap: 0.5rem; text-decoration: none;" title="Compartir en WhatsApp">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                        WhatsApp
                      </a>
                      
                      <a href="https://www.instagram.com/" target="_blank" onclick="closeAuthModals();" class="btn" style="background: white; border: 1px solid #E1306C; padding: 0.8rem; display: flex; align-items: center; justify-content: center; color: #E1306C; gap: 0.5rem; text-decoration: none;" title="Abrir Instagram">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        Instagram
                      </a>
                    </div>
                </div>
            </div>
`;
    }

    updateDropdown();

    const profileBtn = document.getElementById("nav-profile-btn");
    if(profileBtn) {
        profileBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            document.getElementById("profile-dropdown").classList.toggle("show");
        });
    }

    document.addEventListener("click", (e) => {
        const drop = document.getElementById("profile-dropdown");
        const btn = document.getElementById("nav-profile-btn");
        if(drop && drop.classList.contains("show") && !drop.contains(e.target) && !btn.contains(e.target)) {
            drop.classList.remove("show");
        }
    });
});

/**
 * Verifica el estado de autenticación simulado
 * @returns {boolean} true si el usuario está 'logueado'
 */
function isLogged() {
    return localStorage.getItem("simulated_login") === "true";
}

/**
 * Actualiza el contenido del sub-menú (dropdown) del perfil
 * dependiendo del estado de la sesión simulada.
 */
function updateDropdown() {
    const drop = document.getElementById("profile-dropdown");
    if(!drop) return;
    
    let prefix = window.location.pathname.includes('productos/') ? '../' : '';

    if(isLogged()) {
        drop.innerHTML = `
            <a href="${prefix}perfil.html">Mi Perfil</a>
            <a href="#" onclick="handleLogout(event)">Cerrar Sesión</a>
        `;
    } else {
        drop.innerHTML = `
            <a href="#" onclick="openModal('modal-login'); return false;">Iniciar Sesión</a>
            <a href="#" onclick="openModal('modal-registro'); return false;">Registrarse</a>
        `;
    }
}

/**
 * Abre un modal específico usando su ID HTML y cierra los demás.
 * @param {string} id - El ID del elemento modal a abrir.
 */
window.openModal = function(id) {
    closeAuthModals();
    const m = document.getElementById(id);
    if(m) m.classList.add('active');
    
    // Close dropdown
    const drop = document.getElementById("profile-dropdown");
    if(drop) drop.classList.remove("show");
}

/**
 * Cierra todos los modales activos eliminando la clase 'active'
 * de cualquier elemento con la clase '.modal-overlay'.
 */
window.closeAuthModals = function() {
    document.querySelectorAll('.modal-overlay').forEach(el => el.classList.remove('active'));
}

/**
 * Simula el proceso de inicio de sesión sin necesidad de validación real.
 * @param {Event} e - Evento de formulario (onsubmit).
 */
window.handleLogin = function(e) {
    e.preventDefault();
    localStorage.setItem("simulated_login", "true");
    
    const path = window.location.pathname;
    const prefix = path.includes('productos/') ? '../' : '';
    if (path.endsWith('login.html') || path.endsWith('registro.html')) {
        window.location.href = prefix + 'perfil.html';
    } else {
        closeAuthModals();
        updateDropdown();
        window.location.reload();
    }
}

/**
 * Simula el proceso de registro y posterior inicio de sesión.
 * @param {Event} e - Evento de formulario (onsubmit).
 */
window.handleRegistro = function(e) {
    e.preventDefault();
    localStorage.setItem("simulated_login", "true");
    
    const path = window.location.pathname;
    const prefix = path.includes('productos/') ? '../' : '';
    if (path.endsWith('login.html') || path.endsWith('registro.html')) {
        window.location.href = prefix + 'perfil.html';
    } else {
        closeAuthModals();
        updateDropdown();
        window.location.reload();
    }
}

/**
 * Simula el cierre de sesión, limpia el Local Storage y redirige
 * al usuario a la página de inicio si se encuentra en un área privada.
 * @param {Event} e - Evento de clic.
 */
window.handleLogout = function(e) {
    if(e) e.preventDefault();
    localStorage.removeItem("simulated_login");
    updateDropdown();
    
    // Close dropdown
    const drop = document.getElementById("profile-dropdown");
    if(drop) drop.classList.remove("show");
    
    // Redirect if on perfil
    if(window.location.pathname.endsWith('perfil.html')) {
        let prefix = window.location.pathname.includes('productos/') ? '../' : '';
        window.location.href = prefix + 'index.html';
    } else {
        window.location.reload();
    }
}
/**
 * Intercambia la visibilidad de la contraseña (type="password" vs type="text").
 * Cambia el SVG (ojo abierto/cerrado) de forma dinámica.
 * @param {HTMLElement} btn - Botón presionado.
 */
window.togglePassword = function(btn) {
    const input = btn.previousElementSibling;
    if (input.type === "password") {
        input.type = "text";
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
    } else {
        input.type = "password";
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    }
}

/**
 * API de Portapapeles: Copia la URL actual para compartir un producto.
 */
window.copiarLink = function() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert("¡Enlace copiado al portapapeles!");
    }).catch(err => {
        console.error("Error al copiar enlace: ", err);
    });
}

/**
 * Genera un enlace a la API web de WhatsApp con un mensaje
 * dinámico que incluye la URL del producto actual.
 */
window.compartirWhatsapp = function() {
    const texto = encodeURIComponent(`¡Mira este increíble producto de Crème & Co! ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${texto}`, '_blank');
}
