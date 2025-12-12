// Datos de productos (simulando base de datos)
const productos = [
    {
        id: 1,
        nombre: "Laptop Gaming",
        precio: 1299.99,
        categoria: "electronica",
        imagen: "assets/producto1.jpg",
        descripcion: "Laptop para gaming con RTX 4060, 16GB RAM, 1TB SSD",
        stock: 10
    },
    {
        id: 2,
        nombre: "Smartphone Pro",
        precio: 899.99,
        categoria: "electronica",
        imagen: "assets/producto2.jpg",
        descripcion: "Smartphone flagship con cámara de 108MP",
        stock: 15
    },
    {
        id: 3,
        nombre: "Auriculares Bluetooth",
        precio: 199.99,
        categoria: "electronica",
        imagen: "assets/producto3.jpg",
        descripcion: "Auriculares con cancelación de ruido",
        stock: 25
    },
    {
        id: 4,
        nombre: "Camiseta Algodón",
        precio: 29.99,
        categoria: "ropa",
        imagen: "https://via.placeholder.com/400x300",
        descripcion: "Camiseta 100% algodón orgánico",
        stock: 50
    },
    {
        id: 5,
        nombre: "Jeans Slim Fit",
        precio: 59.99,
        categoria: "ropa",
        imagen: "https://via.placeholder.com/400x300",
        descripcion: "Jeans ajustados de alta calidad",
        stock: 30
    },
    {
        id: 6,
        nombre: "Sofá Moderno",
        precio: 499.99,
        categoria: "hogar",
        imagen: "https://via.placeholder.com/400x300",
        descripcion: "Sofá de 3 plazas en tela resistente",
        stock: 8
    },
    {
        id: 7,
        nombre: "Lámpara LED",
        precio: 39.99,
        categoria: "hogar",
        imagen: "https://via.placeholder.com/400x300",
        descripcion: "Lámpara inteligente con control por app",
        stock: 40
    },
    {
        id: 8,
        nombre: "Juego de Sartenes",
        precio: 89.99,
        categoria: "hogar",
        imagen: "https://via.placeholder.com/400x300",
        descripcion: "Set de 3 sartenes antiadherentes",
        stock: 20
    }
];

// Carrito de compras
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Elementos DOM
const productsGrid = document.getElementById('productsGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const cartCount = document.querySelector('.cart-count');
const modal = document.getElementById('productModal');
const closeModal = document.querySelector('.close');
const modalContent = document.getElementById('modalProductContent');

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    mostrarProductos('all');
    actualizarContadorCarrito();
    setupEventListeners();
});

// Mostrar productos
function mostrarProductos(categoria) {
    productsGrid.innerHTML = '';
    
    const productosFiltrados = categoria === 'all' 
        ? productos 
        : productos.filter(p => p.categoria === categoria);
    
    productosFiltrados.forEach(producto => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.dataset.category = producto.categoria;
        
        productCard.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="product-img">
            <div class="product-info">
                <div class="product-category">${producto.categoria}</div>
                <h3 class="product-title">${producto.nombre}</h3>
                <div class="product-price">$${producto.precio.toFixed(2)}</div>
                <div class="product-actions">
                    <button class="btn btn-small ver-detalle" data-id="${producto.id}">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button class="btn btn-small btn-outline agregar-carrito" data-id="${producto.id}">
                        <i class="fas fa-cart-plus"></i> Agregar
                    </button>
                </div>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
    
    // Agregar eventos a los botones nuevos
    document.querySelectorAll('.ver-detalle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('button').dataset.id);
            mostrarDetalleProducto(id);
        });
    });
    
    document.querySelectorAll('.agregar-carrito').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.closest('button').dataset.id);
            agregarAlCarrito(id);
        });
    });
}

// Mostrar detalle de producto
function mostrarDetalleProducto(id) {
    const producto = productos.find(p => p.id === id);
    
    modalContent.innerHTML = `
        <h2>${producto.nombre}</h2>
        <img src="${producto.imagen}" alt="${producto.nombre}" style="width:100%; max-height:300px; object-fit:cover; border-radius:8px; margin:1rem 0;">
        <p><strong>Descripción:</strong> ${producto.descripcion}</p>
        <p><strong>Categoría:</strong> ${producto.categoria}</p>
        <p><strong>Precio:</strong> $${producto.precio.toFixed(2)}</p>
        <p><strong>Stock disponible:</strong> ${producto.stock}</p>
        <button class="btn agregar-carrito-modal" data-id="${producto.id}" style="margin-top:1rem; width:100%;">
            <i class="fas fa-cart-plus"></i> Agregar al Carrito
        </button>
    `;
    
    modal.style.display = 'block';
    
    // Evento para el botón del modal
    document.querySelector('.agregar-carrito-modal').addEventListener('click', () => {
        agregarAlCarrito(id);
        modal.style.display = 'none';
    });
}

// Agregar al carrito
function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    const itemEnCarrito = carrito.find(item => item.id === id);
    
    if (itemEnCarrito) {
        if (itemEnCarrito.cantidad < producto.stock) {
            itemEnCarrito.cantidad++;
        } else {
            alert('No hay suficiente stock disponible');
            return;
        }
    } else {
        carrito.push({
            ...producto,
            cantidad: 1
        });
    }
    
    guardarCarrito();
    actualizarContadorCarrito();
    mostrarNotificacion('Producto agregado al carrito');
}

// Guardar carrito en localStorage
function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Actualizar contador del carrito
function actualizarContadorCarrito() {
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    cartCount.textContent = totalItems;
}

// Mostrar notificación
function mostrarNotificacion(mensaje) {
    const notification = document.createElement('div');
    notification.textContent = mensaje;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: var(--secondary);
        color: white;
        padding: 1rem 2rem;
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Configurar event listeners
function setupEventListeners() {
    // Filtros
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            mostrarProductos(btn.dataset.category);
        });
    });
    
    // Modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Animaciones CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);