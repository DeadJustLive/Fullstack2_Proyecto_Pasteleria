// Funcionalidad de modales para vista de servicios
document.addEventListener('DOMContentLoaded', function() {
  const servicioCards = document.querySelectorAll('.servicio-card');
  const modalOverlay = document.querySelector('.modal-overlay');
  const modalClose = document.querySelector('.modal__close');
  const modalCloseBtn = document.querySelector('.modal__close-btn');
  
  servicioCards.forEach(card => {
    card.addEventListener('click', function() {
      const servicioId = this.getAttribute('data-servicio');
      abrirModal(servicioId);
    });
  });
  
  if (modalClose) {
    modalClose.addEventListener('click', cerrarModal);
  }
  
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', cerrarModal);
  }
  
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function(e) {
      if (e.target === modalOverlay) {
        cerrarModal();
      }
    });
  }
  
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      cerrarModal();
    }
  });
  
  function abrirModal(servicioId) {
    if (modalOverlay) {
      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }
  
  function cerrarModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  }
});
