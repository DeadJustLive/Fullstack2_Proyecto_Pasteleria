const products = [
  { id: 1, name: 'Tarta Red Velvet', price: 45.00, category: 'pasteleria', icon: 'bi-cake2' },
  { id: 2, name: 'Croissant de Almendra', price: 12.50, category: 'panaderia', icon: 'bi-moon' },
  { id: 3, name: 'Cheesecake de Maracuyá', price: 38.00, category: 'pasteleria', icon: 'bi-cake2' },
  { id: 4, name: 'Café Americano', price: 18.00, category: 'bebidas', icon: 'bi-cup-hot' },
  { id: 5, name: 'Cappuccino', price: 25.00, category: 'bebidas', icon: 'bi-cup-hot' },
  { id: 6, name: 'Baguette', price: 15.00, category: 'panaderia', icon: 'bi-bag' },
  { id: 7, name: 'Macarons (Caja 6)', price: 60.00, category: 'pasteleria', icon: 'bi-circle' },
  { id: 8, name: 'Jugo Natural', price: 20.00, category: 'bebidas', icon: 'bi-cup-straw' },
];

let cart = [];

document.addEventListener('DOMContentLoaded', () => {
  renderProducts('all');
  
  /**
   * Configuración de los filtros de categoría de productos.
   * Re-renderiza la grilla al hacer clic en un botón de filtro.
   */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Actualiza visualmente el botón activo removiendo las clases outline y asignando solid
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline-primary');
      });
      e.target.classList.remove('btn-outline-primary');
      e.target.classList.add('btn-primary');
      
      const category = e.target.dataset.category;
      renderProducts(category);
    });
  });

  /**
   * Manejador de eventos para los botones de métodos de pago.
   * Cierra los modales actuales y muestra el modal de éxito.
   */
  document.querySelectorAll('.payment-method-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Oculta el modal de pago y el carrito usando la API de Bootstrap antes de confirmar
      const modalPago = bootstrap.Modal.getInstance(document.getElementById('modalMetodoPago'));
      if (modalPago) modalPago.hide();
      
      const modalCarrito = bootstrap.Modal.getInstance(document.getElementById('modalCarrito'));
      if (modalCarrito) modalCarrito.hide();
      
      const modalExito = new bootstrap.Modal(document.getElementById('modalVentaExitosa'));
      modalExito.show();
    });
  });

  /**
   * Función para nueva venta: Vacía el carrito y actualiza la UI.
   */
  document.getElementById('btn-nueva-venta').addEventListener('click', () => {
    cart = [];
    updateCartUI();
  });
});

function renderProducts(category) {
  const grid = document.querySelector('.product-grid');
  grid.innerHTML = '';
  
  const filtered = category === 'all' ? products : products.filter(p => p.category === category);
  
  filtered.forEach(product => {
    const col = document.createElement('div');
    col.className = 'col-6 col-md-4 col-xl-3';
    
    col.innerHTML = `
      <div class="product-card" onclick="addToCart(${product.id})">
        <div class="product-icon"><i class="${product.icon}"></i></div>
        <div>
          <h3 class="product-title">${product.name}</h3>
          <div class="product-price">$${product.price.toFixed(2)}</div>
        </div>
      </div>
    `;
    grid.appendChild(col);
  });
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  const existingItem = cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  
  updateCartUI();
}

function updateItemQty(productId, change) {
  const item = cart.find(item => item.id === productId);
  if (!item) return;
  
  item.qty += change;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }
  
  updateCartUI();
}

function updateCartUI() {
  const cartContainer = document.getElementById('cart-items');
  const btnCobrar = document.getElementById('btn-cobrar');
  const floatingBadge = document.getElementById('floating-cart-badge');
  
  // Suma la cantidad total de artículos y la refleja en la burbuja flotante del carrito
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  if (floatingBadge) floatingBadge.textContent = totalQty;

  if (cart.length === 0) {
    cartContainer.innerHTML = '<div class="text-center text-muted m-auto empty-cart-msg">El carrito está vacío.</div>';
    document.getElementById('cart-subtotal').textContent = '$0.00';
    document.getElementById('cart-total').textContent = '$0.00';
    btnCobrar.disabled = true;
    return;
  }
  
  cartContainer.innerHTML = '';
  let total = 0;
  
  cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-info">
        <p class="cart-item-title">${item.name}</p>
        <p class="cart-item-price">$${item.price.toFixed(2)} c/u</p>
      </div>
      <div class="cart-item-qty">
        <button class="btn-qty" onclick="updateItemQty(${item.id}, -1)">-</button>
        <span class="qty-value">${item.qty}</span>
        <button class="btn-qty" onclick="updateItemQty(${item.id}, 1)">+</button>
      </div>
    `;
    cartContainer.appendChild(div);
  });
  
  document.getElementById('cart-subtotal').textContent = `$${total.toFixed(2)}`;
  document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
  btnCobrar.disabled = false;
}
