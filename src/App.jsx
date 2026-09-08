import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Navbar,
  Row,
  Col,
  Button,
  Offcanvas,
  Modal,
  Form
} from 'react-bootstrap';
import { menuItems, categories, deliveryZones, paymentMethods } from './data/menu';
import ProductCustomizerModal from './components/ProductCustomizerModal';
import './App.css';
import { sendOrderToTelegram } from './services/telegram';

// Lista de bancos nacionales para Pago Móvil
const VENEZUELAN_BANKS = [
  'Banesco',
  'Banco de Venezuela',
  'Mercantil',
  'BBVA Provincial',
  'Banco Nacional de Crédito (BNC)',
  'Bancaribe',
  'Banco Exterior',
  'Banco Bicentenario',
  'Banplus',
  '100% Banco',
  'Dancor / Otros'
];

// Número de WhatsApp oficial de Cumbre Food
const WHATSAPP_PHONE = '584168769923';

/**
 * Helper para obtener imagen de fallback según categoría
 * @param {string} category 
 * @returns {string} Ruta de la imagen
 */
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

/**
 * Generador de ID único de pedido con formato #CF-XXXX
 * @returns {string} Código de 4 dígitos (Ej. CF-8421)
 */
const generateOrderId = () => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `CF-${randomSuffix}`;
};
// Evaluar si Cumbre Food está abierto según la hora de Venezuela
  const checkIsOpen = () => {
  // Obtener hora local de Venezuela (America/Caracas)
  const venezuelaDate = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/Caracas' })
  );

  const day = venezuelaDate.getDay(); // 0 = Domingo, 1 = Lunes, 2 = Martes, ...
  const hour = venezuelaDate.getHours();
  const minutes = venezuelaDate.getMinutes();
  const currentTime = hour + minutes / 60;

  // Lunes: Cerrado
  if (day === 1) return false;

  // Martes: 5:00 PM a 10:00 PM (17:00 a 22:00)
  if (day === 2) {
    return currentTime >= 17 && currentTime < 22;
  }

  // Miércoles (3) a Domingo (0): 1:00 PM a 10:00 PM (13:00 a 22:00)
  return currentTime >= 13 && currentTime < 22;
};

function App() {
  // Estado que controla la sobrepantalla si el negocio está cerrado
  const [isOpen] = useState(() => checkIsOpen());
  const [showClosedModal, setShowClosedModal] = useState(() => !checkIsOpen());
  // Estado del Carrito con lectura segura y resiliente de localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cumbre_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter((item) => item && typeof item === 'object')
        .map((item) => {
          const rawPrice = Number(item.price);
          const rawQty = Number(item.quantity);
          const validPrice = !isNaN(rawPrice) && rawPrice >= 0 ? rawPrice : 0;
          const validQty = !isNaN(rawQty) && rawQty > 0 ? Math.floor(rawQty) : 1;

          // Normalizar customizationDetails a un arreglo de { label, value }
          let details = [];
          if (Array.isArray(item.customizationDetails)) {
            details = item.customizationDetails
              .map((d) => {
                if (typeof d === 'string') return { label: 'Opción', value: d };
                if (d && typeof d === 'object') {
                  return {
                    label: String(d.label || 'Opción'),
                    value: String(d.value || '')
                  };
                }
                return null;
              })
              .filter(Boolean);
          } else if (typeof item.customizationSummary === 'string' && item.customizationSummary) {
            details = item.customizationSummary.split('|').map((s) => {
              const parts = s.split(':');
              if (parts.length >= 2) {
                return { label: parts[0].trim(), value: parts.slice(1).join(':').trim() };
              }
              return { label: 'Detalle', value: s.trim() };
            });
          }

          return {
            id: item.id || `item-${Date.now()}`,
            cartItemId:
              item.cartItemId ||
              `${item.id || 'item'}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: String(item.name || 'Producto'),
            price: validPrice,
            quantity: validQty,
            image: item.image || getFallbackImage(item.category),
            category: item.category || 'otros',
            customizationDetails: details,
            customizationSummary:
              item.customizationSummary ||
              details.map((d) => `${d.label}: ${d.value}`).join(' | '),
            basePrice: Number(item.basePrice) || validPrice,
            rawOptions: item.rawOptions || {}
          };
        });
    } catch (error) {
      console.error('Error al inicializar el carrito desde localStorage:', error);
      return [];
    }
  });

  // Filtros de navegación y búsqueda en vivo
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Estados de control de flujo en 2 Fases (Mochila / Checkout Modal)
  const [showCart, setShowCart] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(() => generateOrderId());

  // Estado del Modal de Personalización de Producto
  const [customizingProduct, setCustomizingProduct] = useState(null);
  const [showCustomizer, setShowCustomizer] = useState(false);

  // Estados del Formulario de Checkout
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('pickup');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0] || 'Pago Móvil');
  const [notes, setNotes] = useState('');

  // Nuevos campos para Pago Móvil y comprobante
  const [customerIdCard, setCustomerIdCard] = useState('');
  const [bankOrigin, setBankOrigin] = useState('Banesco');
  const [paymentReference, setPaymentReference] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);

  // Estados de control de envío y éxito
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);

  // Capturar la imagen del comprobante
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, sube un formato de imagen válido (JPG, PNG, JPEG).');
        return;
      }
      setReceiptFile(file);
    }
  };

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem('cumbre_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error guardando el carrito en localStorage:', e);
    }
  }, [cart]);

  const handleOpenCustomizer = (product) => {
    setCustomizingProduct(product);
    setShowCustomizer(true);
  };

  const handleAddCustomizedToCart = (customizedItem) => {
    if (!customizedItem) return;

    const validPrice =
      typeof customizedItem.price === 'number' && !isNaN(customizedItem.price)
        ? customizedItem.price
        : Number(customizedItem.price) || 0;

    const validQuantity =
      typeof customizedItem.quantity === 'number' && customizedItem.quantity > 0
        ? Math.floor(customizedItem.quantity)
        : 1;

    const safeCartItemId =
      customizedItem.cartItemId ||
      `${customizedItem.id || 'item'}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const sanitizedItem = {
      ...customizedItem,
      id: customizedItem.id || 'item',
      cartItemId: safeCartItemId,
      name: customizedItem.name || 'Producto',
      price: validPrice,
      quantity: validQuantity,
      image: customizedItem.image || getFallbackImage(customizedItem.category),
      category: customizedItem.category || 'otros',
      customizationDetails: Array.isArray(customizedItem.customizationDetails)
        ? customizedItem.customizationDetails
        : []
    };

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (i) => i.cartItemId === sanitizedItem.cartItemId
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + sanitizedItem.quantity
        };
        return updated;
      }
      return [...prevCart, sanitizedItem];
    });
  };

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

  const removeFromCart = (cartItemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    if (window.confirm('¿Deseas vaciar todos los productos de tu mochila?')) {
      setCart([]);
    }
  };

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

  // Transiciones de Fase
  const handleOpenCheckout = () => {
    setShowCart(false);
    setCurrentOrderId(generateOrderId());
    setShowCheckoutModal(true);
  };

  const handleBackToCart = () => {
    setShowCheckoutModal(false);
    setShowCart(true);
  };

  // Enviar Comanda a Telegram
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (paymentMethod === 'Pago Móvil') {
      if (!customerIdCard.trim()) {
        alert('Por favor ingresa la cédula del titular del Pago Móvil.');
        return;
      }
      if (!paymentReference.trim() || paymentReference.trim().length < 4) {
        alert('Por favor ingresa los últimos 4 dígitos de la referencia.');
        return;
      }
      if (!receiptFile) {
        alert('Por favor adjunta la captura de pantalla del comprobante de Pago Móvil.');
        return;
      }
    }

    setIsSubmitting(true);
    const orderId = currentOrderId || generateOrderId();

    const orderPayload = {
      orderId,
      customerName: customerName.trim(),
      customerIdCard: customerIdCard.trim(),
      customerPhone: customerPhone.trim(),
      deliveryZone: selectedZone.name,
      deliveryAddress: selectedZone.id !== 'pickup' ? customerAddress.trim() : null,
      deliveryCost,
      subtotal,
      grandTotal,
      paymentMethod,
      bankOrigin,
      paymentReference: paymentReference.trim(),
      notes: notes.trim(),
      items: cart
    };

    try {
      await sendOrderToTelegram(orderPayload, receiptFile);

      setOrderSuccessData(orderPayload);
      setCart([]);
      localStorage.removeItem('cumbre_cart');
    } catch (error) {
      console.error('Error al procesar comanda:', error);
      alert('Hubo un problema al enviar tu pedido. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--cf-bg-main)' }}>
      {/* NAVBAR */}
      <Navbar sticky="top" className="cf-navbar py-2 px-3">
        <Container className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <a
              href="#home"
              className="cf-brand d-flex align-items-center gap-2"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
            >
              <img 
                src="/logocumbrefood.jpg" 
                alt="Logo Cumbre Food" 
                style={{ height: '38px', width: 'auto', objectFit: 'contain' }} 
              />
              <span>CUMBRE <span className="cf-brand-highlight">FOOD</span></span>
            </a>
            <div 
              className="d-none d-md-inline-flex cf-nav-badge" 
              style={{ cursor: 'pointer' }}
              onClick={() => !isOpen && setShowClosedModal(true)}
            >
              <span 
                className="cf-nav-badge-dot" 
                style={{ backgroundColor: isOpen ? '#22c55e' : '#ef4444' }}
              ></span>
              <span>Mérida • {isOpen ? 'Abierto' : 'Cerrado'}</span>
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

      {/* HERO BANNER */}
      <section className="cf-hero">
        <Container>
          <div className="cf-hero-badges">
            <span className="cf-hero-badge-pill fire">🔥 SABOR ARTESANAL DE ALTURA</span>
            <span className="cf-hero-badge-pill highlight">📍 Pick Up: Feria C.C. Plaza Mayor</span>
            <span className="cf-hero-badge-pill">🛵 Delivery Activo en Toda Mérida</span>
          </div>

          <h1 className="cf-hero-title">
            Hamburguesas y Platos de <span className="cf-brand-highlight">Altura</span>
          </h1>
          <p className="cf-hero-subtitle">
            Inspiradas en los picos más altos de la Sierra Nevada. Ingredientes frescos, pan artesanal de papa y la mejor parrilla andina.
          </p>

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

      {/* CATEGORÍAS */}
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

      {/* CATÁLOGO DE PRODUCTOS */}
      <main className="flex-grow-1 pb-5">
        <Container>
          {filteredItems.length === 0 ? (
            <div className="cf-empty-state">
              <span className="cf-empty-icon">🔍</span>
              <h4 className="fw-bold text-white mb-2">No encontramos coincidencias</h4>
              <p className="text-cf-muted small mb-4">
                No hay productos que coincidan con tu búsqueda "{searchQuery}".
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

                        <div className="price-tag">
                          ${item.price.toFixed(2)}
                        </div>

                        {categoryObj && (
                          <div className="product-card-cat-badge">
                            {categoryObj.name}
                          </div>
                        )}
                      </div>

                      <div className="product-card-body">
                        <h3
                          className="product-card-title"
                          onClick={() => handleOpenCustomizer(item)}
                          style={{ cursor: 'pointer' }}
                        >
                          {item.name}
                        </h3>
                        <p className="product-card-desc">{item.description}</p>

                        <div className="mt-auto pt-2">
                          <button
                            type="button"
                            className="btn-cf-add"
                            onClick={() => handleOpenCustomizer(item)}
                          >
                            <span>
                              {qtyInCart > 0
                                ? `+ Agregar (${qtyInCart} en Mochila)`
                                : '+ Agregar'}
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

      {/* MODAL PERSONALIZADOR */}
      <ProductCustomizerModal
        show={showCustomizer}
        onHide={() => setShowCustomizer(false)}
        product={customizingProduct}
        onAddToCart={handleAddCustomizedToCart}
        getFallbackImage={getFallbackImage}
      />

      {/* BARRA FLOTANTE INFERIOR */}
      {totalItemsCount > 0 && !showCart && !showCheckoutModal && (
        <aside className="floating-cart-bar" aria-label="Resumen rápido de pedido">
          <div className="floating-cart-content" onClick={() => setShowCart(true)}>
            <div className="floating-cart-info">
              <div className="floating-cart-icon-wrap">
                <span>🛒</span>
                <span className="floating-cart-badge">{totalItemsCount}</span>
              </div>
              <div className="floating-cart-text">
                <span className="floating-cart-label">Tu Mochila</span>
                <span className="floating-cart-total">${subtotal.toFixed(2)}</span>
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

      {/* FASE 1: OFFCANVAS DE MOCHILA */}
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
                Explora el menú y agrega tus hamburguesas o platos favoritos con sus opciones personalizadas.
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
              <div className="d-flex justify-content-between align-items-center mb-3 px-1">
                <span className="small text-cf-muted fw-bold">PRODUCTOS EN TU MOCHILA</span>
                <button
                  type="button"
                  className="btn btn-link text-danger text-decoration-none p-0 small fw-semibold"
                  onClick={clearCart}
                >
                  Vaciar Mochila
                </button>
              </div>

              <div className="cf-cart-items-scroll flex-grow-1 mb-3">
                {cart.map((item) => {
                  const itemSubtotal = item.price * item.quantity;

                  return (
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

                        {item.customizationDetails && item.customizationDetails.length > 0 && (
                          <div className="cf-cart-item-modifiers">
                            {item.customizationDetails.map((detail, idx) => (
                              <span key={idx} className="cf-modifier-badge">
                                <strong>{detail.label}:</strong> {detail.value}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="d-flex align-items-center justify-content-between mt-2 flex-wrap gap-2">
                          <div>
                            <span className="cf-cart-item-price">${item.price.toFixed(2)}</span>
                            <span className="cf-cart-item-subtotal ms-2">
                              (${itemSubtotal.toFixed(2)})
                            </span>
                          </div>

                          <div className="cf-cart-qty-group">
                            <button
                              type="button"
                              className="btn-cf-qty-ctrl"
                              onClick={() => updateQuantity(item.cartItemId, -1)}
                              title={item.quantity === 1 ? 'Eliminar ítem' : 'Disminuir'}
                              aria-label="Disminuir cantidad"
                            >
                              −
                            </button>
                            <span className="cf-qty-display">{item.quantity}</span>
                            <button
                              type="button"
                              className="btn-cf-qty-ctrl"
                              onClick={() => updateQuantity(item.cartItemId, 1)}
                              title="Aumentar"
                              aria-label="Aumentar cantidad"
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
                        aria-label={`Eliminar ${item.name}`}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="cf-cart-drawer-footer">
                <div className="cf-summary-box mb-3">
                  <div className="cf-summary-row total mb-0">
                    <span>Subtotal Mochila:</span>
                    <span className="total-amount">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="small text-cf-muted mt-1">
                    * El método de entrega y pago se configuran al cancelar.
                  </div>
                </div>

                <div className="d-flex flex-column gap-2">
                  <button
                    type="button"
                    className="btn-cf-primary-checkout"
                    onClick={handleOpenCheckout}
                  >
                    <span>Ir a Cancelar / Pagar</span>
                    <span>→</span>
                  </button>

                  <button
                    type="button"
                    className="btn-cf-secondary-continue"
                    onClick={() => setShowCart(false)}
                  >
                    + Seguir pidiendo / Volver al Menú
                  </button>
                </div>
              </div>
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* FASE 2: MODAL CENTRAL DE PAGO & DATOS (CHECKOUT MODAL) */}
      <Modal
        show={showCheckoutModal}
        onHide={() => {
          if (!isSubmitting) {
            setShowCheckoutModal(false);
            if (orderSuccessData) setOrderSuccessData(null);
          }
        }}
        centered
        size="lg"
        className="cf-checkout-modal"
        backdropClassName="cf-modal-backdrop"
        scrollable
      >
        <Modal.Header className="cf-checkout-modal-header d-flex align-items-center justify-content-between">
          <div>
            <div className="cf-modal-badge-order mb-1">
              <span>🆔 Pedido: <strong>#{orderSuccessData ? orderSuccessData.orderId : currentOrderId}</strong></span>
            </div>
            <Modal.Title className="cf-checkout-modal-title">
              <span>{orderSuccessData ? '✅' : '💳'}</span>
              <span>{orderSuccessData ? 'Comanda Confirmada' : 'Finalizar Compra & Pago'}</span>
            </Modal.Title>
          </div>
          <button
            type="button"
            className="btn-close btn-close-white-custom"
            onClick={() => {
              if (!isSubmitting) {
                setShowCheckoutModal(false);
                if (orderSuccessData) setOrderSuccessData(null);
              }
            }}
            aria-label="Cerrar ventana"
          ></button>
        </Modal.Header>

        <Modal.Body className="cf-checkout-modal-body p-3 p-md-4">
          {orderSuccessData ? (
            /* PANTALLA DE ÉXITO TRAS ENVIAR A TELEGRAM */
            <div className="text-center py-4 px-2 d-flex flex-column align-items-center">
              <div 
                className="d-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{ 
                  width: '74px', 
                  height: '74px', 
                  backgroundColor: 'rgba(34, 197, 94, 0.15)', 
                  border: '2px solid #22c55e' 
                }}
              >
                <span style={{ fontSize: '2.4rem' }}>✅</span>
              </div>

              <h4 className="fw-bold text-white mb-1">¡Comanda Enviada a Cocina!</h4>
              <p className="text-secondary small mb-3">
                Hemos recibido tu orden y tu comprobante de Pago Móvil con éxito.
              </p>

              <div 
                className="w-100 p-3 rounded text-start mb-3" 
                style={{ backgroundColor: '#141210', border: '1px solid #383028', fontSize: '0.88rem' }}
              >
                <div className="d-flex justify-content-between mb-2 pb-2 border-bottom border-secondary border-opacity-25">
                  <span className="text-secondary">Número de Pedido:</span>
                  <span className="fw-bold text-warning fs-6">#{orderSuccessData.orderId}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-secondary">Cliente:</span>
                  <span className="text-white">{orderSuccessData.customerName}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-secondary">Modalidad:</span>
                  <span className="text-white">{orderSuccessData.deliveryZone}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-secondary">Banco Origen:</span>
                  <span className="text-white">{orderSuccessData.bankOrigin}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-secondary">Referencia:</span>
                  <span className="text-white">***{orderSuccessData.paymentReference}</span>
                </div>
                <div className="d-flex justify-content-between mt-2 pt-2 border-top border-secondary border-opacity-25">
                  <span className="fw-bold text-white">Monto Total:</span>
                  <span className="fw-bold text-warning fs-6">${orderSuccessData.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div 
                className="p-3 rounded mb-4 w-100" 
                style={{ backgroundColor: '#211a14', border: '1px dashed #d97706' }}
              >
                <p className="small text-warning m-0" style={{ fontSize: '0.82rem' }}>
                  📲 Caja verificará el pago en el banco y te contactará por WhatsApp para notificarte el despacho.
                </p>
              </div>

              <button
                type="button"
                className="btn w-100 py-2 fw-bold"
                style={{ 
                  backgroundColor: '#d97706', 
                  color: '#ffffff', 
                  borderRadius: '9999px', 
                  border: 'none',
                  boxShadow: '0 0 14px rgba(217, 119, 6, 0.45)'
                }}
                onClick={() => {
                  setOrderSuccessData(null);
                  setShowCheckoutModal(false);
                }}
              >
                Entendido, volver al Menú
              </button>
            </div>
          ) : (
            /* FORMULARIO DE CHECKOUT */
            <Form onSubmit={handleCheckout}>
              <div className="cf-checkout-order-summary mb-3">
                <h6 className="fw-bold text-white mb-2 d-flex justify-content-between align-items-center">
                  <span>🎒 Resumen de Productos ({totalItemsCount} ítems)</span>
                  <span className="cf-text-gold">${subtotal.toFixed(2)}</span>
                </h6>
                <div className="cf-checkout-items-preview">
                  {cart.map((item) => (
                    <div key={item.cartItemId} className="cf-checkout-item-chip">
                      <strong className="text-warning">{item.quantity}x</strong> {item.name}
                      <span className="text-secondary ms-1">(${(item.price * item.quantity).toFixed(2)})</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="row g-3">
                {/* Columna 1: Datos del Cliente */}
                <div className="col-12 col-md-6">
                  <h6 className="cf-section-title">
                    <span>👤</span> Datos del Cliente
                  </h6>

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

                  <Form.Group className="mb-2">
                    <Form.Label className="cf-form-label">Teléfono de Contacto (WhatsApp) *</Form.Label>
                    <Form.Control
                      type="tel"
                      size="sm"
                      className="cf-form-control"
                      placeholder="Ej. 0412-1234567"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </Form.Group>

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

                  {/* Campos condicionales para Pago Móvil */}
                  {paymentMethod === 'Pago Móvil' && (
                    <div 
                      className="p-3 mb-3 rounded" 
                      style={{ backgroundColor: '#161311', border: '1px solid #d97706', color: '#fff' }}
                    >
                      <div className="small fw-bold text-warning mb-2 d-flex align-items-center gap-1">
                        <span>📲</span>
                        <span>DATOS PARA EL PAGO MÓVIL</span>
                      </div>
                      
                      <div className="small text-secondary mb-3" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                        <div>🏦 <strong>Banco:</strong> Banesco (0134)</div>
                        <div>🪪 <strong>Cédula/RIF:</strong> V-24555888</div>
                        <div>📱 <strong>Teléfono:</strong> 0416-8769923</div>
                        <div className="mt-1 text-warning">Transfiere antes de confirmar tu pedido.</div>
                      </div>

                      <Form.Group className="mb-2">
                        <Form.Label className="cf-form-label" style={{ fontSize: '0.8rem' }}>Banco de Origen *</Form.Label>
                        <Form.Select
                          size="sm"
                          className="cf-form-select"
                          value={bankOrigin}
                          onChange={(e) => setBankOrigin(e.target.value)}
                        >
                          {VENEZUELAN_BANKS.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-2">
                        <Form.Label className="cf-form-label" style={{ fontSize: '0.8rem' }}>Cédula del Titular *</Form.Label>
                        <Form.Control
                          type="text"
                          size="sm"
                          className="cf-form-control"
                          placeholder="Ej. V-18234567"
                          required
                          value={customerIdCard}
                          onChange={(e) => setCustomerIdCard(e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group className="mb-2">
                        <Form.Label className="cf-form-label" style={{ fontSize: '0.8rem' }}>Últimos 4 Dígitos de Referencia *</Form.Label>
                        <Form.Control
                          type="text"
                          maxLength={6}
                          size="sm"
                          className="cf-form-control"
                          placeholder="Ej. 8421"
                          required
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value.replace(/\D/g, ''))}
                        />
                      </Form.Group>

                      <Form.Group className="mb-1">
                        <Form.Label className="cf-form-label" style={{ fontSize: '0.8rem' }}>Captura del Comprobante *</Form.Label>
                        <Form.Control
                          type="file"
                          accept="image/*"
                          size="sm"
                          className="cf-form-control"
                          required
                          onChange={handleFileChange}
                        />
                        <Form.Text className="text-secondary" style={{ fontSize: '0.7rem' }}>
                          Sube la captura de pantalla de la transferencia.
                        </Form.Text>
                      </Form.Group>
                    </div>
                  )}
                </div>

                {/* Columna 2: Modalidad de Entrega & Notas */}
                <div className="col-12 col-md-6">
                  <h6 className="cf-section-title">
                    <span>🛵</span> Modalidad de Entrega
                  </h6>

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
                          {z.name} {z.price === 0 ? '(Gratis)' : `(+$${z.price.toFixed(2)})`}
                        </option>
                      ))}
                    </Form.Select>
                    <div className="cf-zone-desc">
                      {selectedZone.description}
                    </div>
                  </Form.Group>

                  {selectedZone.id !== 'pickup' && (
                    <Form.Group className="mb-2">
                      <Form.Label className="cf-form-label">Dirección Exacta y Referencia *</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        size="sm"
                        className="cf-form-control"
                        placeholder="Ej. Av. Las Américas, Res. Los Bucares, Torre A, Apto 4-B. Frente al semáforo."
                        required
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                      />
                    </Form.Group>
                  )}

                  <Form.Group className="mb-2">
                    <Form.Label className="cf-form-label">Notas para la Cocina (Opcional)</Form.Label>
                    <Form.Control
                      type="text"
                      size="sm"
                      className="cf-form-control"
                      placeholder="Ej. Entregar en la garita, sin salsas picantes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </Form.Group>
                </div>
              </div>

              {/* Desglose Financiero */}
              <div className="cf-summary-box mt-3 mb-3">
                <div className="cf-summary-row">
                  <span>Subtotal Productos:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="cf-summary-row">
                  <span>Modalidad de Entrega ({selectedZone.id === 'pickup' ? 'Pick Up' : selectedZone.name}):</span>
                  <span>{deliveryCost === 0 ? 'Gratis' : `$${deliveryCost.toFixed(2)}`}</span>
                </div>
                <div className="cf-summary-row total">
                  <span>Total a Pagar:</span>
                  <span className="total-amount">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Botones de acción del Modal */}
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-4 pt-2 border-top border-secondary border-opacity-25">
                <button
                  type="button"
                  className="btn-cf-back-to-cart order-2 order-sm-1"
                  onClick={handleBackToCart}
                  disabled={isSubmitting}
                >
                  <span>←</span> Volver a la Mochila
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn w-100 py-2 fw-bold mt-3 order-1 order-sm-2"
                  style={{
                    backgroundColor: isSubmitting ? '#78350f' : '#d97706',
                    color: '#ffffff',
                    borderRadius: '9999px',
                    boxShadow: '0 0 14px rgba(217, 119, 6, 0.45)',
                    border: 'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmitting ? (
                    <span>⏳ Procesando comanda a cocina...</span>
                  ) : (
                    <span>🚀 Confirmar y Enviar Pedido</span>
                  )}
                </button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
        {/* =========================================================================
            MODAL INFORMATIVO: LOCAL CERRADO / GLASSMORPHISM STYLE
            ========================================================================= */}
        <Modal
          show={showClosedModal}
          onHide={() => setShowClosedModal(false)}
          centered
          backdrop="static"
          keyboard={false}
          contentClassName="border-0 bg-transparent"
        >
          <div
            className="p-4 p-md-5 text-center text-white position-relative"
            style={{
              backgroundColor: 'rgba(18, 15, 13, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '28px',
              border: '1px solid rgba(217, 119, 6, 0.35)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
            }}
          >
            {/* Ícono de Cumbre Food con resplandor ámbar */}
            <div className="d-flex justify-content-center mb-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle p-2"
                style={{
                  width: '84px',
                  height: '84px',
                  backgroundColor: 'rgba(217, 119, 6, 0.12)',
                  border: '2px solid #d97706',
                  boxShadow: '0 0 20px rgba(217, 119, 6, 0.3)'
                }}
              >
                <img 
                  src="/logocumbrefood.jpg" 
                  alt="Cumbre Food" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
              </div>
            </div>

            {/* Título de Alerta con estilo de marca */}
            <h2
              className="fw-black text-uppercase mb-2"
              style={{
                color: '#f87171',
                letterSpacing: '1px',
                fontWeight: '900',
                fontSize: '1.65rem'
              }}
            >
              ¡HOLA! ESTAMOS CERRADOS
            </h2>

            <p className="text-secondary small mb-3">Nuestro horario de atención es:</p>

            {/* Tabla de horarios integrada con estética Cumbre */}
            <div
              className="p-3 mb-3 rounded-4 text-start mx-auto"
              style={{
                backgroundColor: 'rgba(28, 23, 19, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                maxWidth: '340px',
                fontSize: '0.85rem'
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom border-secondary border-opacity-10">
                <span className="text-secondary">Lunes:</span>
                <span className="badge rounded-pill bg-danger bg-opacity-25 text-danger px-2 py-1">Cerrado</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom border-secondary border-opacity-10">
                <span className="text-secondary">Martes:</span>
                <span className="text-warning fw-semibold">5:00 PM – 10:00 PM</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-secondary">Miércoles a Domingo:</span>
                <span className="text-warning fw-semibold">1:00 PM – 10:00 PM</span>
              </div>
            </div>

            <p className="fw-semibold text-light mb-1" style={{ fontSize: '0.92rem' }}>
              Estamos cerrados por ahora, pero puedes pre-ordenar tu pedido.
            </p>
            <p className="text-secondary small mb-4" style={{ fontSize: '0.8rem' }}>
              Tu orden quedará registrada y se preparará en cuanto abramos parrilla.
            </p>

            {/* Botón Pre-ordenar oficial */}
            <button
              type="button"
              className="btn w-100 py-3 fw-bold text-uppercase"
              style={{
                backgroundColor: '#d97706',
                color: '#ffffff',
                borderRadius: '9999px',
                fontSize: '0.95rem',
                letterSpacing: '1px',
                border: 'none',
                boxShadow: '0 0 20px rgba(217, 119, 6, 0.45)',
                transition: 'transform 0.15s ease'
              }}
              onClick={() => setShowClosedModal(false)}
            >
              Pre-ordenar
            </button>
          </div>
        </Modal>

      {/* FOOTER */}
      <footer className="cf-footer">
        <Container>
          <div className="cf-footer-logo d-flex align-items-center justify-content-center gap-2">
            <img 
              src="/logocumbrefood.jpg" 
              alt="Cumbre Food" 
              style={{ height: '32px', width: 'auto', objectFit: 'contain' }} 
            />
            <span>CUMBRE FOOD</span>
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