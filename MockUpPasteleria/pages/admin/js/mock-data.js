window.MOCK_DATA = {
  kpiData: {
    sales: "$1,245.50",
    orders: 24,
    deliveries: 18
  },
  chartData: {
    labels: ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"],
    values: [300, 800, 600, 1300, 1000, 1600, 1400]
  },
  products: [
    { id: 1, name: "Pastel de Fresa", category: "Pasteles", stock: 12, price: "$25.00", image: "img/placeholder.jpg" },
    { id: 2, name: "Cupcake de Chocolate", category: "Postres", stock: 50, price: "$3.50", image: "img/placeholder.jpg" },
    { id: 3, name: "Galletas de Avena", category: "Galletas", stock: 100, price: "$1.00", image: "img/placeholder.jpg" },
    { id: 4, name: "Tarta de Limón", category: "Tartas", stock: 5, price: "$18.00", image: "img/placeholder.jpg" },
    { id: 5, name: "Pan Artesanal", category: "Panadería", stock: 20, price: "$4.00", image: "img/placeholder.jpg" }
  ],
  orders: [
    { id: "#00123", client: "Juan Pérez", date: "2026-09-06", total: "$45.00", status: "Completado" },
    { id: "#00124", client: "María Gómez", date: "2026-09-06", total: "$12.50", status: "En progreso" },
    { id: "#00125", client: "Carlos Ruiz", date: "2026-09-05", total: "$80.00", status: "Pendiente" },
    { id: "#00126", client: "Ana López", date: "2026-09-05", total: "$22.00", status: "Completado" }
  ],
  users: [
    { id: 1, name: "Admin Principal", email: "admin@milsabores.com", role: "Administrador", status: "Activo", avatar: "A" },
    { id: 2, name: "Laura Martínez", email: "laura@milsabores.com", role: "Vendedor", status: "Activo", avatar: "L" },
    { id: 3, name: "Pedro Cárdenas", email: "pedro@milsabores.com", role: "Vendedor", status: "Inactivo", avatar: "P" },
    { id: 4, name: "Sofia Silva", email: "sofia@milsabores.com", role: "Editor", status: "Activo", avatar: "S" }
  ],
  storeConfig: {
    name: "Crème & Co",
    email: "contacto@milsabores.com",
    bannerText: "¡Bienvenido al sistema de administración!"
  }
};

