window.showToast = function(message, type = 'success') {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    console.warn('No toast container found');
    return;
  }
  
  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center text-bg-${type} border-0`;
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');
  
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  
  toastContainer.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();
  
  toastEl.addEventListener('hidden.bs.toast', () => {
    toastEl.remove();
  });
};

window.initForms = function() {
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      window.showToast('Operación completada con éxito', 'success');
    });
  });
};

window.confirmDelete = function(callback) {
  if (confirm('¿Estás seguro de que deseas eliminar este elemento?')) {
    callback();
    window.showToast('Elemento eliminado', 'success');
  }
};

window.initRipple = function() {
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      let x = e.clientX - e.target.getBoundingClientRect().left;
      let y = e.clientY - e.target.getBoundingClientRect().top;
      
      let ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      this.appendChild(ripple);
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
};

document.addEventListener('DOMContentLoaded', () => {
  window.initForms();
  window.initRipple();
});

  /**
 * Transiciones de Página (Interceptar clics para una salida suave)
 * Se encarga de añadir una clase de salida antes de navegar a otra vista.
 */
  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link) {
      const href = link.getAttribute('href');
      // Ignorar enlaces ancla, componentes de Bootstrap (modales/offcanvas) y enlaces que abren en nueva pestaña
      if (href && !href.startsWith('#') && !href.startsWith('javascript') && !link.hasAttribute('data-bs-toggle') && link.target !== '_blank') {
        e.preventDefault();
        document.body.classList.add('page-is-exiting');
        setTimeout(() => {
          window.location.href = link.href; // Use full resolved URL
        }, 200); // Matches the 0.2s CSS animation
      }
    }
  });

  /**
 * Inyectar botón flotante de "Volver al Hub" fuera de los contenedores 
 * con transformaciones para evitar conflictos de Z-Index y opacidad.
 */
  if (!document.querySelector('.prototype-return-btn')) {
    const btnHtml = 
      <a href="../../index.html" class="prototype-return-btn" title="Volver al Índice Principal">
        <i class="bi bi-house-door-fill fs-4"></i>
      </a>
      <style>
        .prototype-return-btn {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 55px;
          height: 55px;
          background-color: var(--bs-secondary, #934b19);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(147, 75, 25, 0.4);
          z-index: 99999;
          text-decoration: none;
          transition: transform 0.2s, background-color 0.2s;
        }
        .prototype-return-btn:hover {
          transform: scale(1.1) translateY(-3px);
          background-color: var(--bs-primary, #81515a);
          color: white;
        }
        @media (max-width: 767.98px) {
          .prototype-return-btn {
            bottom: 90px;
            right: 20px;
            width: 50px;
            height: 50px;
          }
        }
      </style>
    ;
    document.body.insertAdjacentHTML('beforeend', btnHtml);
  }
