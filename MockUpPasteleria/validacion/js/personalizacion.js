// Funcionalidad visual para personalización
document.addEventListener('DOMContentLoaded', function() {
  const personasOptions = document.querySelectorAll('.personas-option__input');
  const saboresInputs = document.querySelectorAll('.sabor-option__input');
  
  personasOptions.forEach(input => {
    input.addEventListener('change', function() {
      actualizarResumen();
    });
  });
  
  saboresInputs.forEach(input => {
    input.addEventListener('change', function() {
      actualizarResumen();
    });
  });
  
  function actualizarResumen() {
    const personasSeleccionadas = document.querySelector('.personas-option__input:checked');
    const saboresSeleccionados = document.querySelectorAll('.sabor-option__input:checked');
    
    const resumenPersonas = document.querySelector('.resumen-personas');
    const resumenSabores = document.querySelector('.resumen-sabores');
    const resumenSaboresList = document.querySelector('.resumen-sabores-list');
    
    if (resumenPersonas && personasSeleccionadas) {
      resumenPersonas.textContent = personasSeleccionadas.value + ' personas';
    }
    
    if (resumenSaboresList && saboresSeleccionados.length > 0) {
      resumenSaboresList.innerHTML = '';
      saboresSeleccionados.forEach(sabor => {
        const label = sabor.parentElement.querySelector('.sabor-option__name');
        if (label) {
          const item = document.createElement('div');
          item.className = 'resumen-card__list-item';
          item.innerHTML = '<span>• ' + label.textContent + '</span>';
          resumenSaboresList.appendChild(item);
        }
      });
      if (resumenSabores) {
        resumenSabores.style.display = 'flex';
      }
    } else if (resumenSabores) {
      resumenSabores.style.display = 'none';
    }
  }
  
  // Inicializar
  actualizarResumen();
});
