/**
 * THE RIOT - LÓGICA DE LA TIENDA
 */

// --- 1. SELECCIÓN DE ELEMENTOS DEL DOM ---
// Guardamos referencias a los elementos que vamos a manipular frecuentemente
const botonesAñadir = document.querySelectorAll('.punk-btn'); // Botones "Añadir" de las cartas
const listaCarrito = document.querySelector('.cart-items');   // Contenedor de items en el modal
const totalElemento = document.querySelector('.total');       // Texto del precio total
const contadorCesta = document.querySelector('.bin-count');    // Burbuja roja del header

// --- 2. ESTADO DE LA APLICACIÓN ---
// El 'carrito' es nuestra base de datos temporal en memoria
let carrito = [];

// --- 3. GESTIÓN DE PRODUCTOS (GRID PRINCIPAL) ---
// Escuchamos el click en cada botón de producto
botonesAñadir.forEach(boton => {
    boton.addEventListener('click', (e) => {
        // Buscamos el contenedor padre '.grid-card' para obtener los datos de ese producto específico
        const card = e.target.closest('.grid-card');
        
        if (card) {
            const nombre = card.querySelector('.produName').textContent;
            // Extraemos el precio eliminando el símbolo € y convirtiéndolo a número decimal
            const precio = parseFloat(card.querySelector('.produPrice').textContent.replace('€', ''));

            añadirProducto(nombre, precio);
            mostrarAlertaRiot(`${nombre} AÑADIDO A LA CESTA`);
        }
    });
});

/**
 * Añade un producto al array 'carrito' o incrementa su cantidad si ya existe.
 */
function añadirProducto(nombre, precio) {
    const existe = carrito.find(item => item.nombre === nombre);

    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({ nombre, precio, cantidad: 1 });
    }
    actualizarInterfaz(); // Refrescamos el modal y el contador
}

// --- 4. RENDERIZADO DE LA INTERFAZ ---
/**
 * Limpia y vuelve a dibujar el contenido del carrito y actualiza los totales.
 */
function actualizarInterfaz() {
    listaCarrito.innerHTML = ''; // Vaciamos la lista antes de re-dibujar

    if (carrito.length === 0) {
        listaCarrito.innerHTML = '<p class="empty-msg">La recolección está vacía...</p>';
    } else {
        // Recorremos el carrito para crear el HTML de cada fila
        carrito.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('cart-item-row');
            // Nota: Se aplican estilos inline para asegurar el layout de la fila
            itemDiv.style.display = 'flex';
            itemDiv.style.justifyContent = 'space-between';
            itemDiv.style.marginBottom = '10px';

            itemDiv.innerHTML = `
                <span>${item.nombre} (x${item.cantidad})</span>
                <div>
                    <button onclick="cambiarCantidad(${index}, 1)" style="cursor:pointer; padding: 0 5px;">+</button>
                    <button onclick="cambiarCantidad(${index}, -1)" style="cursor:pointer; padding: 0 5px;">-</button>
                    <span style="margin-left: 10px;">${(item.precio * item.cantidad).toFixed(2)}€</span>
                </div>
            `;
            listaCarrito.appendChild(itemDiv);
        });
    }

    // Cálculo matemático del total acumulado
    const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    totalElemento.textContent = `TOTAL: ${total.toFixed(2)}€`;
    
    // Actualización del número rojo en el icono del carrito
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    contadorCesta.textContent = totalItems;
}

// --- 5. CONTROL DE CANTIDADES ---
// Función global (unida a 'window') para que los botones creados dinámicamente puedan llamarla
window.cambiarCantidad = (index, cambio) => {
    carrito[index].cantidad += cambio;
    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1); // Si llega a 0, eliminamos el producto del array
    }
    actualizarInterfaz();
};

// --- 6. INTERACTIVIDAD VISUAL (CAMBIO DE COLOR) ---
// Mapa de rutas para las imágenes alternativas
const rutasImagenes = {
    neo: { original: "img/rojo.png", alt: "img/rojo-alt.png" },
    urban: { original: "img/violeta.png", alt: "img/violeta-alt.png" },
    thresholl: { original: "img/orange.png", alt: "img/orange-alt.png" }
};

document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', function() {
        const card = this.closest('.grid-card');
        if(!card) return; 
        
        const id = card.dataset.id;
        const color = this.dataset.color; // 'original' o 'alt'
        
        if(rutasImagenes[id]) {
            card.querySelector('img').src = rutasImagenes[id][color];
        }
        
        // Manejo visual de la clase 'active'
        card.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        this.classList.add('active');
    });
});

// --- 7. LABORATORIO DE DISEÑO ---
/** Cambia la camiseta base en el preview */
function changeBase(imgSrc) {
    document.getElementById('tshirt-preview').src = imgSrc;
}

// Lógica para previsualizar el logo que sube el usuario
const uploadInput = document.getElementById('upload-logo');
const logoPreview = document.getElementById('logo-preview');

if (uploadInput) {
    uploadInput.addEventListener('change', function(e) {
        const reader = new FileReader();
        reader.onload = function() {
            logoPreview.src = reader.result; // Convierte la imagen en una URL base64
        }
        if(e.target.files[0]) reader.readAsDataURL(e.target.files[0]);
    });
}

// --- 8. SISTEMA DE NOTIFICACIONES (TOASTS) ---
/** Crea y muestra una alerta visual temporal */
function mostrarAlertaRiot(mensaje) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.classList.add('punk-toast');
    
    toast.innerHTML = `<span>💀</span><span>${mensaje}</span>`;
    container.appendChild(toast);

    // Auto-eliminación después de 3 segundos con efecto de salida
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}


// --- 9. CONFIRMACIÓN DE DISEÑO PERSONALIZADO ---
const confirmBtn = document.getElementById('confirm-custom');
if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
        const logoPreview = document.getElementById('logo-preview');
        
        // Validación: No permite añadir si no hay logo cargado
        if (!logoPreview.getAttribute('src') || logoPreview.getAttribute('src') === "") {
            mostrarAlertaRiot("¡SUBE UN DISEÑO, REBELDE!");
            return;
        }

        añadirProducto("CUSTOM DESIGN", 40.00);
        mostrarAlertaRiot("DISEÑO AÑADIDO A LA CESTA");
        window.location.hash = "#"; // Cerramos el modal volviendo al inicio de la URL
        logoPreview.src = "";      // Limpiamos el laboratorio
    });
}