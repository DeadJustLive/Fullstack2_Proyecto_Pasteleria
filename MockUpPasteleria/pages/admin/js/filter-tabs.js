document.addEventListener('DOMContentLoaded', () => {
  const pills = document.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('[data-status]');

  if (!pills.length) return;

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      /**
       * 1. Manejo de estado visual:
       * Remueve la clase activa de todos los filtros y se la asigna al elemento clickeado.
       */
      pills.forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');

      const filter = pill.dataset.filter;

      cards.forEach(card => {
        if (filter === 'todos' || card.dataset.status === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
});
