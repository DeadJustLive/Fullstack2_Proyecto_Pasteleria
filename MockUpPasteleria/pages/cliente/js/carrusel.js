
document.addEventListener('DOMContentLoaded', () => {
  const wrappers = document.querySelectorAll('.carousel-wrapper');
  wrappers.forEach(wrapper => {
    const carousel = wrapper.querySelector('.carousel');
    const btnPrev = wrapper.querySelector('.carousel-btn.prev');
    const btnNext = wrapper.querySelector('.carousel-btn.next');

    if (carousel && btnPrev && btnNext) {
      const scrollAmount = carousel.clientWidth * 0.75; // desplaza un 75% de la vista actual

      btnPrev.addEventListener('click', () => {
        carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });

      btnNext.addEventListener('click', () => {
        carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });
    }
  });
});
