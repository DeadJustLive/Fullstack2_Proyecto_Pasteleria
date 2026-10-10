document.addEventListener('DOMContentLoaded', () => {
    /**
 * Utilidad para extraer el número de una cadena formateada como "$38.000 c/u".
 * @param {string} text - Texto a analizar
 * @returns {number} Valor numérico entero
 */
    const parsePrice = (str) => {
        // Expresión regular que elimina todo carácter que no sea un dígito
        return parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
    };

    /**
 * Formatea un valor numérico a moneda local de Chile (CLP).
 * @param {number} num - Monto a formatear
 * @returns {string} Cadena en formato moneda
 */
    const formatPrice = (num) => {
        return '$' + num.toLocaleString('es-CL');
    };

    /**
 * Función central: Recorre cada elemento del carrito en el DOM,
 * calcula subtotales, costo de envío y total global.
 */
    const updateTotals = () => {
        let subtotal = 0;
        let itemCount = 0;

        const items = document.querySelectorAll('.carrito-item');
        
        items.forEach(item => {
            const priceText = item.querySelector('.carrito-precio-unitario').textContent;
            const price = parsePrice(priceText);
            const input = item.querySelector('input[type="number"]');
            const qty = parseInt(input.value, 10) || 1;
            
            // Multiplica el precio base por la cantidad ingresada para obtener el subtotal de ese producto
            const lineTotal = price * qty;
            item.querySelector('.carrito-subtotal-linea').textContent = formatPrice(lineTotal);
            
            subtotal += lineTotal;
            itemCount += 1;
        });

        // Muestra la suma total de las cantidades de todos los artículos en la cabecera
        const header = document.querySelector('.carrito-principal h2');
        if (header) {
            header.textContent = `Tus productos (${itemCount})`;
        }

        // Aplica formato de moneda y actualiza el subtotal en el panel lateral
        const shipping = 8000;
        // Verifica si el subtotal es 0 para evitar cobrar un envío fantasma
        const currentShipping = itemCount > 0 ? shipping : 0;
        const total = subtotal + currentShipping;

        const summarySubtotal = document.querySelectorAll('.carrito-totales .valor')[0];
        if (summarySubtotal) {
            summarySubtotal.textContent = formatPrice(subtotal);
        }

        const summaryShipping = document.querySelectorAll('.carrito-totales .valor')[1];
        if (summaryShipping) {
            summaryShipping.textContent = formatPrice(currentShipping);
        }

        const summaryTotal = document.querySelector('.carrito-total span:last-child');
        if (summaryTotal) {
            summaryTotal.textContent = formatPrice(total);
        }
    };

    /**
 * Inicializa y asocia los eventos de "incrementar", "decrementar" 
 * y "eliminar" a todos los elementos que se encuentren renderizados.
 */
    document.querySelectorAll('.carrito-item').forEach(item => {
        const btnMinus = item.querySelector('button[aria-label="Quitar uno"]');
        const btnPlus = item.querySelector('button[aria-label="Agregar uno"]');
        const input = item.querySelector('input[type="number"]');
        const btnDelete = item.querySelector('.carrito-eliminar');

        if (btnMinus) {
            btnMinus.addEventListener('click', () => {
                let val = parseInt(input.value, 10) || 1;
                if (val > 1) {
                    input.value = val - 1;
                    updateTotals();
                }
            });
        }

        if (btnPlus) {
            btnPlus.addEventListener('click', () => {
                let val = parseInt(input.value, 10) || 1;
                input.value = val + 1;
                updateTotals();
            });
        }

        if (input) {
            input.addEventListener('change', () => {
                let val = parseInt(input.value, 10);
                if (isNaN(val) || val < 1) {
                    input.value = 1;
                }
                updateTotals();
            });
        }

        if (btnDelete) {
            btnDelete.addEventListener('click', (e) => {
                e.preventDefault();
                // Reduce la opacidad para un efecto de salida y luego elimina el nodo del DOM
                item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                item.style.opacity = '0';
                item.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    item.remove();
                    updateTotals();
                }, 300);
            });
        }
    });

    // Dispara un recálculo al cargar la vista para asegurar que el resumen y los items cuadren
    updateTotals();
});
