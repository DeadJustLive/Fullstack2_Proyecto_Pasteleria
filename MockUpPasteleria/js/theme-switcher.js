/**
 * Theme Switcher — Pastelería Mil Sabores
 * 
 * Componente temporal para la fase de presentación al cliente.
 * Permite cambiar la paleta de colores en tiempo real usando CSS Custom Properties.
 * 
 * USO: Incluir este script en el HTML e invocar ThemeSwitcher.init()
 * El botón se insertará automáticamente en el primer <nav> encontrado.
 * 
 * @module ThemeSwitcher
 */
const ThemeSwitcher = (() => {
    'use strict';

    const STORAGE_KEY = 'pasteleria-theme';
    const THEMES = {
        rosa: { name: 'Rosa Pastel', emoji: '🌸' },
        pink: { name: 'Pink Clásico', emoji: '💖' },
    };

    /**
     * Aplica un tema al documento y lo guarda en localStorage.
     * @param {string} themeName - Nombre del tema ('rosa', 'pink').
     */
    function applyTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem(STORAGE_KEY, themeName);
    }

    /**
     * Aplica un color primario personalizado directamente.
     * @param {string} color - Código hex del color (ej: '#FF5733').
     */
    function applyCustomColor(color) {
        document.documentElement.style.setProperty('--color-primary', color);
        localStorage.setItem(STORAGE_KEY + '-custom', color);
    }

    /**
     * Crea el HTML del panel del Theme Switcher.
     * @returns {HTMLElement} El elemento contenedor del switcher.
     */
    function createSwitcherPanel() {
        const container = document.createElement('div');
        container.id = 'theme-switcher';
        container.innerHTML = `
            <button id="theme-toggle-btn" aria-label="Cambiar tema de colores" title="Selector de tema">
                🎨 Tema
            </button>
            <div id="theme-panel" class="theme-panel--hidden">
                <p style="font-weight:bold; margin-bottom:8px;">🎨 Selector de Tema</p>
                ${Object.entries(THEMES).map(([key, val]) => `
                    <label style="display:block; margin-bottom:6px; cursor:pointer;">
                        <input type="radio" name="theme" value="${key}"> 
                        ${val.emoji} ${val.name}
                    </label>
                `).join('')}
                <hr style="margin: 8px 0;">
                <label style="display:block; margin-bottom:6px;">
                    🖌️ Color personalizado:
                    <input type="color" id="custom-color-picker" value="#F48FB1" 
                           style="margin-left:8px; cursor:pointer;">
                </label>
                <p style="font-size:0.75rem; color: var(--color-text-light); margin-top:8px;">
                    Vista previa instantánea ✨
                </p>
            </div>
        `;

        // Estilos inline para no depender de archivos CSS externos
        const style = document.createElement('style');
        style.textContent = `
            #theme-switcher {
                position: relative;
                display: inline-block;
            }
            #theme-toggle-btn {
                background: var(--color-primary);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: var(--radius-md, 8px);
                cursor: pointer;
                font-family: var(--font-text, sans-serif);
                font-size: 0.875rem;
                transition: var(--transition-fast, 150ms ease);
            }
            #theme-toggle-btn:hover {
                background: var(--color-primary-dark);
            }
            #theme-panel {
                position: absolute;
                top: 100%;
                right: 0;
                background: var(--color-surface, #fff);
                border: 1px solid #ddd;
                border-radius: var(--radius-md, 8px);
                padding: 16px;
                min-width: 240px;
                box-shadow: var(--shadow-lg, 0 10px 25px rgba(0,0,0,0.15));
                z-index: 1000;
                margin-top: 8px;
                font-family: var(--font-text, sans-serif);
            }
            .theme-panel--hidden {
                display: none !important;
            }
        `;
        document.head.appendChild(style);

        return container;
    }

    /**
     * Inicializa el Theme Switcher.
     * Inserta el botón en el primer <nav> encontrado o al final del <body>.
     */
    function init() {
        const panel = createSwitcherPanel();
        const nav = document.querySelector('nav');
        if (nav) {
            nav.appendChild(panel);
        } else {
            document.body.insertBefore(panel, document.body.firstChild);
        }

        // Toggle panel visibility
        const toggleBtn = document.getElementById('theme-toggle-btn');
        const themePanel = document.getElementById('theme-panel');
        toggleBtn.addEventListener('click', () => {
            themePanel.classList.toggle('theme-panel--hidden');
        });

        // Radio buttons para temas predefinidos
        const radios = panel.querySelectorAll('input[name="theme"]');
        radios.forEach((radio) => {
            radio.addEventListener('change', (e) => {
                applyTheme(e.target.value);
            });
        });

        // Color picker personalizado
        const colorPicker = document.getElementById('custom-color-picker');
        colorPicker.addEventListener('input', (e) => {
            applyCustomColor(e.target.value);
            // Desmarcar radios cuando se usa color personalizado
            radios.forEach((r) => { r.checked = false; });
        });

        // Cerrar panel al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!panel.contains(e.target)) {
                themePanel.classList.add('theme-panel--hidden');
            }
        });

        // Restaurar tema guardado
        const savedTheme = localStorage.getItem(STORAGE_KEY);
        if (savedTheme && THEMES[savedTheme]) {
            applyTheme(savedTheme);
            const radio = panel.querySelector(`input[value="${savedTheme}"]`);
            if (radio) radio.checked = true;
        }

        const savedCustom = localStorage.getItem(STORAGE_KEY + '-custom');
        if (savedCustom) {
            colorPicker.value = savedCustom;
        }
    }

    return { init, applyTheme, applyCustomColor };
})();

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    ThemeSwitcher.init();
});
