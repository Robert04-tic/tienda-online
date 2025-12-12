// Cargar carrito al iniciar
document.addEventListener('DOMContentLoaded', () => {
    actualizarContadorCarrito();
    mostrarCarrito();
});

// Mostrar contenido del carrito
function mostrarCarrito() {
    const cartItemsList = document.getElementById('cartItemsList');
    const cartSummary = document.getElementById('cartSummary');
    const emptyCart = document.getElementById('emptyCart');
    const cartItems = document.getElementById('cartItems');
    
    if (carrito.length === 0) {
        emptyCart.style.display = 'block';
        cartItems.style.display = 'none';
        return;
    }
    
    emptyCart.style.display = 'none';
    cartItems.style.display = 'block';
    
    // Lista de productos
    cartItemsList.innerHTML = '';
    carrito.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-info">
                <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-img">
                <div>
                    <h3>${item.nombre}</h3>
                    <p>$${item.precio.toFixed(2)} c/u</p>
                    <p>Categoría: ${item.categoria}</p>
                </div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                <span class="quantity">${item.cantidad}</span>
                <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
            </div>
            <div class="cart-item-total">
                $${(item.precio * item.cantidad).toFixed(2)}
            </div>
            <button class="remove-btn" data-id="${item.id}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItemsList.appendChild(itemElement);
    });
    
    // Resumen
    const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const envio = subtotal > 50 ? 0 : 9.99;
    const total = subtotal + envio;
    
    cartSummary.innerHTML = `
        <div class="summary-item">
            <span>Subtotal:</span>
            <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-item">
            <span>Envío:</span>
            <span>${envio === 0 ? 'Gratis' : `$${envio.toFixed(2)}`}</span>
        </div>
        <div class="summary-item total">
            <span>Total:</span>
            <span>$${total.toFixed(2)}</span>
        </div>
    `;
    
    // Agregar eventos
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            const action = btn.dataset.action;
            actualizarCantidad(id, action);
        });
    });
    
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            eliminarDelCarrito(id);
        });
    });
}

// Actualizar cantidad
function actualizarCantidad(id, action) {
    const item = carrito.find(item => item.id === id);
    const producto = productos.find(p => p.id === id);
    
    if (action === 'increase') {
        if (item.cantidad < producto.stock) {
            item.cantidad++;
        } else {
            alert('No hay suficiente stock disponible');
            return;
        }
    } else if (action === 'decrease') {
        if (item.cantidad > 1) {
            item.cantidad--;
        } else {
            eliminarDelCarrito(id);
            return;
        }
    }
    
    guardarCarrito();
    actualizarContadorCarrito();
    mostrarCarrito();
}

// Eliminar del carrito
function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    guardarCarrito();
    actualizarContadorCarrito();
    mostrarCarrito();
    mostrarNotificacion('Producto eliminado del carrito');
}

// Estilos adicionales para el carrito
const carritoStyles = document.createElement('style');
carritoStyles.textContent = `
    .empty-cart {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--gray);
    }
    
    .empty-cart i {
        margin-bottom: 1rem;
        color: var(--gray);
    }
    
    .cart-item {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr auto;
        gap: 1rem;
        align-items: center;
        padding: 1.5rem;
        background: white;
        border-radius: var(--radius);
        margin-bottom: 1rem;
        box-shadow: var(--shadow);
    }
    
    .cart-item-info {
        display: flex;
        gap: 1rem;
        align-items: center;
    }
    
    .cart-item-img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: var(--radius);
    }
    
    .cart-item-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .quantity-btn {
        width: 30px;
        height: 30px;
        border: 1px solid var(--primary);
        background: white;
        color: var(--primary);
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
    }
    
    .quantity-btn:hover {
        background-color: var(--primary);
        color: white;
    }
    
    .quantity {
        font-weight: 600;
        min-width: 30px;
        text-align: center;
    }
    
    .cart-item-total {
        font-weight: 700;
        font-size: 1.2rem;
        color: var(--accent);
    }
    
    .remove-btn {
        background: none;
        border: none;
        color: var(--accent);
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0.5rem;
    }
    
    .cart-summary {
        background: white;
        padding: 2rem;
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        margin: 2rem 0;
    }
    
    .summary-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--light);
    }
    
    .summary-item.total {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--dark);
        border-bottom: none;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 2px solid var(--primary);
    }
    
    .cart-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    }
    
    @media (max-width: 768px) {
        .cart-item {
            grid-template-columns: 1fr;
            text-align: center;
        }
        
        .cart-item-info {
            flex-direction: column;
        }
        
        .cart-actions {
            flex-direction: column;
        }
        
        .cart-actions .btn {
            width: 100%;
        }
    }
`;
document.head.appendChild(carritoStyles);