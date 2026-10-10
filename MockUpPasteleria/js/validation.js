/**
 * validation.js — Validaciones Reutilizables para Formularios
 * Pastelería Mil Sabores - Prototipo Interactivo HTML
 * 
 * USO:
 *   1. Importar este script en tu página: <script src="../../js/validation.js"></script>
 *   2. Agregar la clase "validate-form" a tu <form>.
 *   3. Agregar atributos data-* a cada input para definir reglas.
 *   4. Agregar data-redirect="ruta.html" al <form> para redirigir tras éxito.
 * 
 * ATRIBUTOS DE VALIDACIÓN SOPORTADOS:
 *   data-required         → Campo obligatorio
 *   data-min-length="3"   → Mínimo de caracteres
 *   data-max-length="150" → Máximo de caracteres
 *   data-type="email"     → Validar formato de email
 *   data-type="tel"       → Validar formato teléfono chileno (9 dígitos, empieza con 9)
 *   data-type="number"    → Validar que sea numérico
 *   data-min="1"          → Valor numérico mínimo
 *   data-max="100"        → Valor numérico máximo
 *   data-match="#field"   → Debe coincidir con otro campo (ej: confirmar contraseña)
 * 
 * ESTRUCTURA HTML ESPERADA POR CAMPO:
 *   <div class="form-field">
 *     <label class="form-field__label" for="miCampo">Mi Campo</label>
 *     <input class="form-field__input" id="miCampo" data-required data-min-length="3">
 *     <span class="form-field__error"></span>  ← Aquí se inyecta el mensaje de error
 *     <span class="form-field__hint"></span>   ← Opcional: hint permanente
 *   </div>
 */

(function () {
  'use strict';

  // ─── Mensajes de Error ───
  const MESSAGES = {
    required: 'Este campo es obligatorio.',
    minLength: (n) => `Debe tener al menos ${n} caracteres.`,
    maxLength: (n) => `No puede exceder los ${n} caracteres.`,
    email: 'Ingresa un correo electrónico válido.',
    tel: 'Ingresa un teléfono válido (9 dígitos, ej: 912345678).',
    number: 'Debe ser un número válido.',
    min: (n) => `El valor mínimo es ${n}.`,
    max: (n) => `El valor máximo es ${n}.`,
    match: 'Los campos no coinciden.',
    radioRequired: 'Debes seleccionar una opción.',
  };

  // ─── Validar un campo individual ───
  function validateField(field) {
    const value = field.value.trim();
    const errors = [];

    // Required
    if (field.hasAttribute('data-required') && value === '') {
      errors.push(MESSAGES.required);
      return errors; // No seguir validando si está vacío
    }

    // Si no es requerido y está vacío, no validar más
    if (value === '') return errors;

    // Min length
    const minLen = field.getAttribute('data-min-length');
    if (minLen && value.length < parseInt(minLen)) {
      errors.push(MESSAGES.minLength(minLen));
    }

    // Max length
    const maxLen = field.getAttribute('data-max-length');
    if (maxLen && value.length > parseInt(maxLen)) {
      errors.push(MESSAGES.maxLength(maxLen));
    }

    // Type: email
    const type = field.getAttribute('data-type');
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push(MESSAGES.email);
      }
    }

    // Type: tel (Chile)
    if (type === 'tel') {
      const telRegex = /^9\d{8}$/;
      if (!telRegex.test(value)) {
        errors.push(MESSAGES.tel);
      }
    }

    // Type: number
    if (type === 'number') {
      if (isNaN(value)) {
        errors.push(MESSAGES.number);
      }
    }

    // Min value
    const minVal = field.getAttribute('data-min');
    if (minVal && parseFloat(value) < parseFloat(minVal)) {
      errors.push(MESSAGES.min(minVal));
    }

    // Max value
    const maxVal = field.getAttribute('data-max');
    if (maxVal && parseFloat(value) > parseFloat(maxVal)) {
      errors.push(MESSAGES.max(maxVal));
    }

    // Match
    const matchSelector = field.getAttribute('data-match');
    if (matchSelector) {
      const matchField = document.querySelector(matchSelector);
      if (matchField && value !== matchField.value.trim()) {
        errors.push(MESSAGES.match);
      }
    }

    return errors;
  }

  // ─── Validar radio buttons agrupados ───
  function validateRadioGroup(form, groupName) {
    const radios = form.querySelectorAll(`input[type="radio"][name="${groupName}"]`);
    if (radios.length === 0) return [];

    const isRequired = radios[0].hasAttribute('data-required');
    if (!isRequired) return [];

    const checked = form.querySelector(`input[type="radio"][name="${groupName}"]:checked`);
    if (!checked) return [MESSAGES.radioRequired];

    return [];
  }

  // ─── Mostrar error en un campo ───
  function showError(field, message) {
    const container = field.closest('.form-field');
    if (!container) return;

    container.classList.add('form-field--error');
    container.classList.remove('form-field--success');

    const errorEl = container.querySelector('.form-field__error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  }

  // ─── Limpiar error de un campo ───
  function clearError(field) {
    const container = field.closest('.form-field');
    if (!container) return;

    container.classList.remove('form-field--error');

    const errorEl = container.querySelector('.form-field__error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  }

  // ─── Mostrar éxito visual ───
  function showSuccess(field) {
    const container = field.closest('.form-field');
    if (!container) return;
    container.classList.add('form-field--success');
  }

  // ─── Feedback de éxito global ───
  function showSuccessFeedback(form, message) {
    let feedback = form.querySelector('.form-feedback--success');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'form-feedback form-feedback--success';
      form.prepend(feedback);
    }
    feedback.textContent = message || '¡Operación exitosa! ✓';
    feedback.style.display = 'block';

    setTimeout(() => {
      feedback.style.display = 'none';
    }, 3000);
  }

  // ─── Inicializar validación en todos los formularios ───
  function init() {
    const forms = document.querySelectorAll('.validate-form');

    forms.forEach((form) => {
      const fields = form.querySelectorAll(
        'input:not([type="radio"]):not([type="checkbox"]):not([type="submit"]):not([type="button"]), textarea, select'
      );

      // Validación en tiempo real (al perder el foco)
      fields.forEach((field) => {
        field.addEventListener('blur', function () {
          const errors = validateField(this);
          if (errors.length > 0) {
            showError(this, errors[0]);
          } else {
            clearError(this);
            if (this.value.trim() !== '') showSuccess(this);
          }
        });

        // Limpiar error mientras escribe
        field.addEventListener('input', function () {
          if (this.closest('.form-field--error')) {
            clearError(this);
          }
        });
      });

      // Validación al enviar
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        let isValid = true;
        let firstErrorField = null;

        // Validar campos de texto
        fields.forEach((field) => {
          const errors = validateField(field);
          if (errors.length > 0) {
            showError(field, errors[0]);
            if (!firstErrorField) firstErrorField = field;
            isValid = false;
          } else {
            clearError(field);
          }
        });

        // Validar radio groups
        const radioGroups = new Set();
        form.querySelectorAll('input[type="radio"][data-required]').forEach((r) => {
          radioGroups.add(r.name);
        });
        radioGroups.forEach((groupName) => {
          const errors = validateRadioGroup(form, groupName);
          if (errors.length > 0) {
            const firstRadio = form.querySelector(`input[name="${groupName}"]`);
            if (firstRadio) {
              showError(firstRadio, errors[0]);
              if (!firstErrorField) firstErrorField = firstRadio;
            }
            isValid = false;
          }
        });

        // Scroll al primer error
        if (!isValid && firstErrorField) {
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstErrorField.focus();
          return;
        }

        // Éxito: redirigir o mostrar feedback
        const redirectUrl = form.getAttribute('data-redirect');
        const successMessage = form.getAttribute('data-success-message');

        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else if (successMessage) {
          showSuccessFeedback(form, successMessage);
        } else {
          showSuccessFeedback(form);
        }
      });
    });
  }

  // Auto-inicializar cuando el DOM está listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Exponer para uso manual si es necesario
  window.FormValidator = { validateField, showError, clearError, init };
})();
