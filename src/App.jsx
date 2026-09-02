import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Navbar,
  Row,
  Col,
  Button,
  Offcanvas,
  Form
} from 'react-bootstrap';
import { menuItems, categories, deliveryZones, paymentMethods } from './data/menu';
import ProductCustomizerModal from './components/ProductCustomizerModal';
import './App.css';

// Número de WhatsApp oficial de Cumbre Food
const WHATSAPP_PHONE = '584168769923';

// Helper para obtener imagen de fallback según categoría
const getFallbackImage = (category) => {
  switch (category) {
    case 'entradas':
      return '/tequenos_nevados.jpg';
    case 'hamburguesas_pollo':
      return '/burger_chicken.jpg';
    case 'hamburguesas_carne':
    case 'hamburguesas_chuleta':
      return '/burger_latorre.jpg';
    case 'combos':
      return '/combo_cheeseburger_conpapas.jpg';
    case 'platos':
      return '/burger_bosquepino.jpg';
    default:
      return '/hero_background.jpg';
  }
};

function App() {
  // Estado del Carrito con persistencia en localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cumbre_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed)
        ? parsed.map((item) => ({
            ...item,
            cartItemId: item.cartItemId || `${item.id}-${Math.random().toString(36).slice(2, 7)}`
          }))
        : [];
    } catch {
      return [];
    }
  });

  // Filtros de navegación y búsqueda en vivo
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);

  // Estado del Modal de Personalización
  const [customizingProduct, setCustomizingProduct] = useState(null);
  const [showCustomizer, setShowCustomizer] = useState(false);

  // Estados del Formulario de Checkout
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('pickup');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0] || 'Pago Móvil');
  const [notes, setNotes] = useState('');

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem('cumbre_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  }, [cart]);

  // Abrir Modal de Personalización para un producto
  const handleOpenCustomizer = (product) => {
    setCustomizingProduct(product);
    setShowCustomizer(true);
  };

  // Agregar producto configurado al carrito
  const handleAddCustomizedToCart = (customizedItem) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (i) => i.cartItemId === customizedItem.cartItemId
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + customizedItem.quantity
        };
        return updated;
      }
      return [...prevCart, customizedItem];
    });
  };

  // Modificar cantidad de un ítem específico del carrito
  const updateQuantity = (cartItemId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Eliminar ítem del carrito
  const removeFromCart = (cartItemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
  };

  // Vaciar carrito
  const clearCart = () => {
    if (window.confirm('¿Deseas vaciar todos los productos de tu mochila?')) {
      setCart([]);
    }
  };

  // Contar cantidad total de un producto base en el carrito
  const getBaseProductQuantityInCart = (productId) => {
    return cart
      .filter((i) => i.id === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  // Cálculos financieros
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const selectedZone = useMemo(
    () => deliveryZones.find((z) => z.id === selectedZoneId) || deliveryZones[0],
    [selectedZoneId]
  );
  const deliveryCost = selectedZone ? selectedZone.price : 0;
  const grandTotal = subtotal + deliveryCost;
  const totalItemsCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  // Filtrado en vivo de productos por categoría y buscador
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Enviar Pedido detallado a WhatsApp
  const handleCheckout = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    let message = `🏔️ *¡NUEVO PEDIDO - CUMBRE FOOD!* 🍔\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `👤 *Cliente:* ${customerName.trim()}\n`;
    message += `📱 *Teléfono:* ${customerPhone.trim()}\n`;
    message += `🛵 *Tipo de Entrega:* ${selectedZone.name}\n`;

    if (selectedZone.id !== 'pickup') {
      message += `📍 *Dirección / Referencia:* ${customerAddress.trim()}\n`;
    }

    message += `💳 *Método de Pago:* ${paymentMethod}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📋 *DETALLE DEL PEDIDO:*\n\n`;

    cart.forEach((item, index) => {
      message += `*${item.quantity}x* *${item.name}* — $${(item.price * item.quantity).toFixed(2)}\n`;
      if (item.customizationDetails && item.customizationDetails.length > 0) {
        item.customizationDetails.forEach((detail) => {
          message += `   ↳ _${detail.label}:_ ${detail.value}\n`;
        });
      }
      if (index < cart.length - 1) {
        message += `\n`;
      }
    });

    message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💵 *Subtotal:* $${subtotal.toFixed(2)}\n`;
    if (deliveryCost > 0) {
      message += `🛵 *Costo Delivery (${selectedZone.name}):* $${deliveryCost.toFixed(2)}\n`;
    } else {
      message += `📍 *Entrega:* Pick Up (Gratis)\n`;
    }
    message += `💰 *TOTAL A PAGAR:* $${grandTotal.toFixed(2)}\n`;

    if (notes.trim()) {
      message += `━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `📝 *Notas Generales de Cocina:*\n${notes.trim()}\n`;
    }

    message += `\n🚀 _Enviado desde Cumbre Food App_`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--cf-bg-main)' }}>
      {/* =========================================================================
          NAVBAR SUPERIOR OSCURO & LIMPIO
          ========================================================================= */}
      <Navbar sticky="top" className="cf-navbar py-2 px-3">
        <Container className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <a href="#home" className="cf-brand" onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}>
              <span>🏔️</span>
              <span>CUMBRE <span className="cf-brand-highlight">FOOD</span></span>
            </a>
            <div className="d-none d-md-inline-flex cf-nav-badge">
              <span className="cf-nav-badge-dot"></span>
              <span>Mérida • Abierto</span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="cf-cart-btn"
              onClick={() => setShowCart(true)}
              aria-label="Ver Mochila de Pedidos"
            >
              <span>🛒</span>
              <span className="d-none d-sm-inline">Mi Mochila</span>
              {totalItemsCount > 0 && (
                <span className="cf-cart-badge-count">{totalItemsCount}</span>
              )}
            </button>
          </div>
        </Container>
      </Navbar>

      {/* =========================================================================
          HERO BANNER CON BADGES Y BUSCADOR INTERACTIVO EN VIVO
          ========================================================================= */}
      <section className="cf-hero">
        <Container>
          {/* Badges de Confianza */}
          <div className="cf-hero-badges">
            <span className="cf-hero-badge-pill fire">
              🔥 SABOR ARTESANAL DE ALTURA
            </span>
            <span className="cf-hero-badge-pill highlight">
              📍 Pick Up: Feria C.C. Plaza Mayor
            </span>
            <span className="cf-hero-badge-pill">
              🛵 Delivery Activo en Toda Mérida
            </span>
          </div>

          <h1 className="cf-hero-title">
            Hamburguesas y Platos de <span className="cf-brand-highlight">Altura</span>
          </h1>
          <p className="cf-hero-subtitle">
            Inspiradas en los picos más altos de la Sierra Nevada. Ingredientes frescos, pan artesanal de papa y la mejor parrilla andina.
          </p>

          {/* Buscador Interactivo en Vivo */}
          <div className="cf-hero-search-wrapper">
            <div className="cf-search-box">
              <span className="cf-search-icon">🔍</span>
              <input
                type="text"
                className="cf-search-input"
                placeholder="¿Qué te provoca hoy? Busca por nombre o ingredientes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Buscar productos"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="cf-search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="cf-search-results-count">
                Mostrando {filteredItems.length} resultado{filteredItems.length !== 1 ? 's' : ''} para "{searchQuery}"
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* =========================================================================
          SELECTOR DE CATEGORÍAS TIPO PILLS CON SCROLL SUAVE (SIN SCROLLBAR)
          ========================================================================= */}
      <div className="cf-category-nav-wrapper">
        <Container>
          <div className="category-scroll">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`cf-category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </Container>
      </div>

      {/* =========================================================================
          GRILLA DE PRODUCTOS (.product-card)
          ========================================================================= */}
      <main className="flex-grow-1 pb-5">
        <Container>
          {filteredItems.length === 0 ? (
            <div className="cf-empty-state">
              <span className="cf-empty-icon">🔍</span>
              <h4 className="fw-bold text-white mb-2">No encontramos coincidencias</h4>
              <p className="text-cf-muted small mb-4">
                No hay productos que coincidan con tu búsqueda actual "{searchQuery}".
              </p>
              <Button
                variant="outline-warning"
                className="rounded-pill px-4 fw-bold"
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              >
                Ver todo el Menú
              </Button>
            </div>
          ) : (
            <Row xs={1} sm={2} lg={3} xl={3} className="g-4">
              {filteredItems.map((item) => {
                const qtyInCart = getBaseProductQuantityInCart(item.id);
                const categoryObj = categories.find((c) => c.id === item.category);

                return (
                  <Col key={item.id}>
                    <div className="product-card">
                      {/* Contenedor de Imagen con Zoom Hover */}
                      <div
                        className="product-card-img-wrap"
                        onClick={() => handleOpenCustomizer(item)}
                        style={{ cursor: 'pointer' }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="product-card-img"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getFallbackImage(item.category);
                          }}
                        />

                        {/* Etiqueta de Precio Flotante Glassmorphism */}
                        <div className="price-tag">
                          ${item.price.toFixed(2)}
                        </div>

                        {/* Badge de Categoría */}
                        {categoryObj && (
                          <div className="product-card-cat-badge">
                            {categoryObj.name}
                          </div>
                        )}
                      </div>

                      {/* Cuerpo de la Tarjeta */}
                      <div className="product-card-body">
                        <h3
                          className="product-card-title"
                          onClick={() => handleOpenCustomizer(item)}
                          style={{ cursor: 'pointer' }}
                        >
                          {item.name}
                        </h3>
                        <p className="product-card-desc">{item.description}</p>

                        {/* Botón de Acción / Personalizar */}
                        <div className="mt-auto pt-2">
                          <button
                            type="button"
                            className="btn-cf-add"
                            onClick={() => handleOpenCustomizer(item)}
                          >
                            <span className="fs-6">✨</span>
                            <span>
                              {qtyInCart > 0
                                ? `Personalizar / Agregar (${qtyInCart} en Mochila)`
                                : '+ Personalizar & Agregar'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          )}
        </Container>
      </main>

      {/* =========================================================================
          MODAL INTERACTIVO DE PERSONALIZACIÓN DE PRODUCTOS
          ========================================================================= */}
      <ProductCustomizerModal
        show={showCustomizer}
        onHide={() => setShowCustomizer(false)}
        product={customizingProduct}
        onAddToCart={handleAddCustomizedToCart}
        getFallbackImage={getFallbackImage}
      />

      {/* =========================================================================
          BARRA FLOTANTE DE CARRITO INFERIOR (ANIMACIÓN SLIDE-UP)
          ========================================================================= */}
      {totalItemsCount > 0 && !showCart && (
        <aside className="floating-cart-bar" aria-label="Resumen rápido de pedido">
          <div className="floating-cart-content" onClick={() => setShowCart(true)}>
            <div className="floating-cart-info">
              <div className="floating-cart-icon-wrap">
                <span>🛒</span>
                <span className="floating-cart-badge">{totalItemsCount}</span>
              </div>
              <div className="floating-cart-text">
                <span className="floating-cart-label">Tu Pedido</span>
                <span className="floating-cart-total">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
            <button
              type="button"
              className="btn-floating-view"
              onClick={(e) => {
                e.stopPropagation();
                setShowCart(true);
              }}
            >
              <span>Ver Mochila</span>
              <span>→</span>
            </button>
          </div>
        </aside>
      )}

      {/* =========================================================================
          DRAWER / OFFCANVAS LATERAL PARA EL CARRITO & CHECKOUT
          ========================================================================= */}
      <Offcanvas
        show={showCart}
        onHide={() => setShowCart(false)}
        placement="end"
        className="cf-offcanvas"
      >
        <Offcanvas.Header className="cf-offcanvas-header d-flex align-items-center justify-content-between">
          <div className="cf-offcanvas-title">
            <span>🎒</span>
            <span>Tu Mochila ({totalItemsCount})</span>
          </div>
          <button
            type="button"
            className="btn-close btn-close-white-custom"
            onClick={() => setShowCart(false)}
            aria-label="Cerrar mochila"
          ></button>
        </Offcanvas.Header>

        <Offcanvas.Body className="d-flex flex-column p-3">
          {cart.length === 0 ? (
            <div className="text-center my-auto py-5 text-cf-muted">
              <span className="fs-1 d-block mb-3">🎒</span>
              <h5 className="fw-bold text-white mb-2">Tu mochila está vacía</h5>
              <p className="small text-cf-muted mb-4">
                Explora el menú y agrega tus hamburguesas o platos favoritos de altura con sus opciones personalizadas.
              </p>
              <Button
                variant="warning"
                className="rounded-pill fw-bold px-4"
                onClick={() => setShowCart(false)}
              >
                Explorar Menú
              </Button>
            </div>
          ) : (
            <>
              {/* Botón para vaciar si hay items */}
              <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                <span className="small text-cf-muted fw-bold">PRODUCTOS PERSONALIZADOS</span>
                <button
                  type="button"
                  className="btn btn-link text-danger text-decoration-none p-0 small fw-semibold"
                  onClick={clearCart}
                >
                  Vaciar Mochila
                </button>
              </div>

              {/* Lista interactiva de productos */}
              <div className="overflow-y-auto pe-1 mb-2 cf-cart-items-scroll" style={{ maxHeight: '34vh' }}>
                {cart.map((item) => (
                  <div key={item.cartItemId} className="cf-cart-item">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cf-cart-item-img"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getFallbackImage(item.category);
                      }}
                    />
                    <div className="cf-cart-item-details">
                      <div className="cf-cart-item-title" title={item.name}>
                        {item.name}
                      </div>

                      {/* Detalles y Opciones personalizadas */}
                      {item.customizationDetails && item.customizationDetails.length > 0 && (
                        <div className="cf-cart-item-modifiers">
                          {item.customizationDetails.map((detail, idx) => (
                            <span key={idx} className="cf-modifier-badge">
                              <strong>{detail.label}:</strong> {detail.value}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="d-flex align-items-center justify-content-between mt-2">
                        <div>
                          <span className="cf-cart-item-price">${item.price.toFixed(2)}</span>
                          <span className="cf-cart-item-subtotal ms-2">
                            (${(item.price * item.quantity).toFixed(2)})
                          </span>
                        </div>
                        <div className="cf-cart-qty-group">
                          <button
                            type="button"
                            className="btn-cf-qty-ctrl"
                            onClick={() => updateQuantity(item.cartItemId, -1)}
                            title="Disminuir"
                          >
                            -
                          </button>
                          <span className="cf-qty-display">{item.quantity}</span>
                          <button
                            type="button"
                            className="btn-cf-qty-ctrl"
                            onClick={() => updateQuantity(item.cartItemId, 1)}
                            title="Aumentar"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-cf-remove"
                      onClick={() => removeFromCart(item.cartItemId)}
                      title="Eliminar producto"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Formulario de Entrega y Pago */}
              <Form onSubmit={handleCheckout} className="cf-checkout-card flex-grow-1 d-flex flex-column">
                <h6 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                  <span>📍</span>
                  <span>Datos de Entrega & Pago</span>
                </h6>

                {/* Nombre y Apellido */}
                <Form.Group className="mb-2">
                  <Form.Label className="cf-form-label">Nombre y Apellido *</Form.Label>
                  <Form.Control
                    type="text"
                    size="sm"
                    className="cf-form-control"
                    placeholder="Ej. Juan Pérez"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </Form.Group>

                {/* Teléfono */}
                <Form.Group className="mb-2">
                  <Form.Label className="cf-form-label">Teléfono de Contacto *</Form.Label>
                  <Form.Control
                    type="tel"
                    size="sm"
                    className="cf-form-control"
                    placeholder="Ej. 04124253607"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </Form.Group>

                {/* Zona de Delivery */}
                <Form.Group className="mb-2">
                  <Form.Label className="cf-form-label">Zona de Entrega / Delivery *</Form.Label>
                  <Form.Select
                    size="sm"
                    className="cf-form-select"
                    value={selectedZoneId}
                    onChange={(e) => setSelectedZoneId(e.target.value)}
                  >
                    {deliveryZones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} - {z.price === 0 ? 'Gratis' : `$${z.price.toFixed(2)}`}
                      </option>
                    ))}
                  </Form.Select>
                  <div className="cf-zone-desc">
                    {selectedZone.description}
                  </div>
                </Form.Group>

                {/* Dirección condicional si no es Pick Up */}
                {selectedZone.id !== 'pickup' && (
                  <Form.Group className="mb-2">
                    <Form.Label className="cf-form-label">Dirección y Punto de Referencia *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      size="sm"
                      className="cf-form-control"
                      placeholder="Ej. Av. Las Américas, Res. Los Bucares, Torre A, Apto 4-B. Portón negro."
                      required
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                    />
                  </Form.Group>
                )}

                {/* Método de Pago */}
                <Form.Group className="mb-2">
                  <Form.Label className="cf-form-label">Método de Pago *</Form.Label>
                  <Form.Select
                    size="sm"
                    className="cf-form-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    {paymentMethods.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Notas de Cocina */}
                <Form.Group className="mb-3">
                  <Form.Label className="cf-form-label">Notas Generales / Cocina</Form.Label>
                  <Form.Control
                    type="text"
                    size="sm"
                    className="cf-form-control"
                    placeholder="Ej. Entregar en la garita, cambio para billete de $20..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Form.Group>

                {/* Resumen de Costos */}
                <div className="cf-summary-box">
                  <div className="cf-summary-row">
                    <span>Subtotal Productos:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="cf-summary-row">
                    <span>Delivery ({selectedZone.id === 'pickup' ? 'Pick Up' : selectedZone.name}):</span>
                    <span>{deliveryCost === 0 ? 'Gratis' : `$${deliveryCost.toFixed(2)}`}</span>
                  </div>
                  <div className="cf-summary-row total">
                    <span>Total a Pagar:</span>
                    <span className="total-amount">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Botón WhatsApp */}
                <button
                  type="submit"
                  className="btn-cf-whatsapp mt-auto"
                >
                  <span className="fs-5">🚀</span>
                  <span>Enviar Pedido a WhatsApp</span>
                </button>
              </Form>
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* =========================================================================
          FOOTER
          ========================================================================= */}
      <footer className="cf-footer">
        <Container>
          <div className="cf-footer-logo">
            🏔️ CUMBRE FOOD
          </div>
          <p className="cf-footer-text">
            Sabor en lo más alto. Hamburguesas a la parrilla, platos y entradas artesanales en Mérida, Venezuela.
          </p>
          <div className="mt-3 small text-cf-dim">
            📍 Feria C.C. Plaza Mayor • 🛵 Delivery Activo en Toda la Ciudad • © {new Date().getFullYear()} Cumbre Food
          </div>
        </Container>
      </footer>
    </div>
  );
}

export default App;