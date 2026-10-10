document.addEventListener('DOMContentLoaded', () => {
  /**
 * 1. Cargar componentes (sidebar, header, bottom-nav) de forma dinámica usando Fetch API.
 * Esto permite reutilizar el código HTML sin usar motores de plantillas.
 */
  const loadComponent = async (url, placeholderId) => {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const html = await res.text();
        document.getElementById(placeholderId).innerHTML = html;
      }
    } catch (e) {
      console.warn(`Could not load component: ${url}`, e);
    }
  };

  Promise.all([
    loadComponent('./components/sidebar.html', 'sidebar-placeholder'),
    loadComponent('./components/header.html', 'header-placeholder'),
    loadComponent('./components/bottom-nav.html', 'bottomnav-placeholder')
  ]).then(() => {
    initSidebar();
    markActiveNav();
  });

  /**
 * 2. Funcionalidad para alternar el Sidebar entre modo compacto y expandido,
 * guardando la preferencia en Local Storage.
 */
  function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const btnToggle = document.getElementById('btn-toggle-sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (!sidebar || !mainContent || !btnToggle) return;
    
    // Restaura el estado compacto desde localStorage si el usuario lo activó antes
    // La prevención del parpadeo (FOUC) se maneja en un script en el <head>
    
    btnToggle.addEventListener('click', () => {
      const isMobile = window.innerWidth < 992;
      
      if (isMobile) {
        sidebar.classList.toggle('is-mobile-open');
        overlay.classList.toggle('is-visible');
      } else {
        document.documentElement.classList.toggle('is-sidebar-compact');
        localStorage.setItem('admin_sidebar_compact', document.documentElement.classList.contains('is-sidebar-compact'));
      }
    });
    
    // Cierra el sidebar en pantallas móviles al hacer clic en el fondo semitransparente
    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('is-mobile-open');
        overlay.classList.remove('is-visible');
      });
    }
  }

  /**
 * 3. Marca automáticamente como activo el enlace de navegación 
 * correspondiente a la página actual.
 */
  function markActiveNav() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';
    
    // Recorre y actualiza los enlaces principales del sidebar lateral
    document.querySelectorAll('.sidebar-nav-link[data-page]').forEach(link => {
      if (link.dataset.page === currentPage) {
        link.classList.add('is-active');
      }
    });
    
    // Recorre y actualiza los enlaces de la navegación inferior (usada en móviles)
    document.querySelectorAll('.bottom-nav-link[data-page]').forEach(link => {
      if (link.dataset.page === currentPage) {
        link.classList.add('is-active');
      }
    });
  }
});

