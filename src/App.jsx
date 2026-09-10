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
import { menuItems, categories, deliveryZones } from './data/menu';
import ProductCustomizerModal from './components/ProductCustomizerModal';
import './App.css';
import { sendOrderToTelegram } from './services/telegram';

// Lista de métodos de pago completa
const PAYMENT_METHODS = [
  'Pago Móvil',
  'Zelle',
  'Zinli',
  'Binance Pay (USDT)',
  'Efectivo Divisas ($)',
  'Efectivo Bolívares (Bs.)',
  'Punto de Venta (Solo Pick Up)'
];

// Bancos para Pago Móvil
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

// Datos oficiales de pago de Cumbre Food
const PAYMENT_INFO = {
  pagoMovil: {
    banco: 'Banesco (0134)',
    telefono: '0416-8769923',
    cedula: 'V-24555888',
    titular: 'Cumbre Food C.A.'
  },
  zelle: {
    email: 'pagos@cumbrefood.com',
    titular: 'Cumbre Food LLC',
    min: 15
  },
  zinli: {
    email: 'pagoszinli@cumbrefood.com',
    titular: 'Cumbre Food',
    min: 15
  },
  binance: {
    payId: '84920194',
    email: 'binance@cumbrefood.com',
    titular: 'CumbreFoodPay',
    min: 15
  }
};

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

const generateOrderId = () => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `CF-${randomSuffix}`;
};

const checkIsOpen = () => {
  const venezuelaDate = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/Caracas' })
  );

  const day = venezuelaDate.getDay();
  const hour = venezuelaDate.getHours();
  const minutes = venezuelaDate.getMinutes();
  const currentTime = hour + minutes / 60;

  if (day === 1) return false;
  if (day === 2) return currentTime >= 17 && currentTime < 22;
  return currentTime >= 13 && currentTime < 22;
};

function App() {
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [copiedText, setCopiedText] = useState(false);

  const [bcvRate, setBcvRate] = useState(() => {
    const cached = localStorage.getItem('cumbre_bcv_rate');
    return cached ? Number(cached) : 48.5;
  });

  useEffect(() => {
    const fetchBcvRate = async () => {
      try {
        const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        if (res.ok) {
          const data = await res.json();
          const rate = data.promedio || data.price;
          if (rate && !isNaN(rate)) {
            setBcvRate(Number(rate));
            localStorage.setItem('cumbre_bcv_rate', String(rate));
            return;
          }
        }
      } catch (err) {
        console.warn('Fallo primario BCV, intentando respaldo...', err);
      }

      try {
        const fallbackRes = await fetch('https://rates.dolarvzla.com/bcv/latest.json');
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          const rate = fallbackData.usd || fallbackData.rate;
          if (rate && !isNaN(rate)) {
            setBcvRate(Number(rate));
            localStorage.setItem('cumbre_bcv_rate', String(rate));
          }
        }
      } catch (fallbackErr) {
        console.error('Error cargando tasa BCV de respaldo:', fallbackErr);
      }
    };

    fetchBcvRate();
  }, []);

  const formatBs = (dollars) => {
    const bsAmount = (Number(dollars) || 0) * bcvRate;
    return new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(bsAmount);
  };

  const [isOpen] = useState(() => checkIsOpen());
  const [showClosedModal, setShowClosedModal] = useState(() => !checkIsOpen());

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

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [showCart, setShowCart] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(() => generateOrderId());

  const [customizingProduct, setCustomizingProduct] = useState(null);
  const [showCustomizer, setShowCustomizer] = useState(false);

  // Formulario Checkout
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('pickup');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [notes, setNotes] = useState('');

  // Datos específicos de pago
  const [customerIdCard, setCustomerIdCard] = useState('');
  const [bankOrigin, setBankOrigin] = useState('Banesco');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentSenderName, setPaymentSenderName] = useState(''); // Titular de Zelle/Zinli/Binance
  const [receiptFile, setReceiptFile] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);

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

  const handleOpenCheckout = () => {
    setShowCart(false);
    setCheckoutStep(1);
    setCurrentOrderId(generateOrderId());
    setShowCheckoutModal(true);
  };

  const handleBackToCart = () => {
    setShowCheckoutModal(false);
    setCheckoutStep(1);
    setShowCart(true);
  };

  const handleProceedToStep2 = () => {
    if (selectedZoneId !== 'pickup' && !customerAddress.trim()) {
      alert('Por favor indica tu dirección exacta de entrega y punto de referencia.');
      return;
    }
    setCheckoutStep(2);
  };

  const handleCopyPaymentDetails = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!customerName.trim()) {
      alert('Por favor indica tu Nombre y Apellido.');
      return;
    }

    if (!customerPhone.trim()) {
      alert('Por favor indica tu Teléfono de contacto (WhatsApp).');
      return;
    }

    // Validaciones de monto mínimo para transferencias internacionales
    const isDigitalInternational = ['Zelle', 'Zinli', 'Binance Pay (USDT)'].includes(paymentMethod);
    if (isDigitalInternational && grandTotal < 15) {
      alert(`El monto mínimo para cancelar con ${paymentMethod} es de $15.00.`);
      return;
    }

    // Validaciones para Zelle, Zinli o Binance
    if (isDigitalInternational) {
      if (!paymentSenderName.trim()) {
        alert(`Por favor coloca el Nombre del titular de la cuenta que envió el pago por ${paymentMethod}.`);
        return;
      }
      if (!receiptFile) {
        alert(`Es obligatorio adjuntar la captura del comprobante para verificar tu pago por ${paymentMethod}.`);
        return;
      }
    }

    // Validaciones Pago Móvil
    if (paymentMethod === 'Pago Móvil') {
      if (!customerIdCard.trim()) {
        alert('Por favor ingresa la cédula del titular del Pago Móvil.');
        return;
      }
      if (!paymentReference.trim() || paymentReference.trim().length < 4) {
        alert('Por favor ingresa al menos los últimos 4 dígitos de la referencia.');
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
      customerIdCard: customerIdCard.trim() || 'N/A',
      customerPhone: customerPhone.trim(),
      deliveryZone: selectedZone.name,
      deliveryAddress: selectedZone.id !== 'pickup' ? customerAddress.trim() : null,
      deliveryCost,
      subtotal,
      grandTotal,
      grandTotalBs: formatBs(grandTotal),
      bcvRate: bcvRate.toFixed(2),
      paymentMethod,
      bankOrigin: paymentMethod === 'Pago Móvil' ? bankOrigin : 'N/A',
      paymentReference: paymentMethod === 'Pago Móvil' ? paymentReference.trim() : 'N/A',
      paymentSenderName: isDigitalInternational ? paymentSenderName.trim() : 'N/A',
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
                Explora el menú y agrega tus productos favoritos.
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
                  <div className="cf-summary-row total mb-0 d-flex justify-content-between align-items-center">
                    <span>Subtotal Mochila:</span>
                    <div className="text-end">
                      <div className="total-amount text-success fw-black fs-4">${subtotal.toFixed(2)}</div>
                      <div className="text-secondary fw-semibold" style={{ fontSize: '0.9rem' }}>
                        ≈ {formatBs(subtotal)} Bs.
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top border-secondary border-opacity-25" style={{ fontSize: '0.75rem' }}>
                    <span className="text-cf-muted">* El método de entrega y pago se configuran al cancelar.</span>
                    <span className="badge bg-dark border border-secondary text-warning">
                      Tasa BCV: {bcvRate.toFixed(2)} Bs/$
                    </span>
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

      {/* FASE 2: MODAL DE CHECKOUT EN 2 PASOS */}
      <Modal
        show={showCheckoutModal}
        onHide={() => {
          if (!isSubmitting) {
            setShowCheckoutModal(false);
            setCheckoutStep(1);
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
            <div className="cf-modal-badge-order mb-1 d-flex align-items-center gap-2">
              <span>🆔 Pedido: <strong>#{orderSuccessData ? orderSuccessData.orderId : currentOrderId}</strong></span>
              {!orderSuccessData && (
                <span className="badge bg-dark border border-secondary text-warning" style={{ fontSize: '0.72rem' }}>
                  Paso {checkoutStep} de 2
                </span>
              )}
            </div>
            <Modal.Title className="cf-checkout-modal-title">
              <span>{orderSuccessData ? '✅' : checkoutStep === 1 ? '🛍️' : '💳'}</span>
              <span>
                {orderSuccessData 
                  ? 'Comanda Confirmada' 
                  : checkoutStep === 1 
                    ? 'Resumen del Pedido & Entrega' 
                    : 'Método de Pago & Contacto'}
              </span>
            </Modal.Title>
          </div>
          <button
            type="button"
            className="btn-close btn-close-white-custom"
            onClick={() => {
              if (!isSubmitting) {
                setShowCheckoutModal(false);
                setCheckoutStep(1);
                if (orderSuccessData) setOrderSuccessData(null);
              }
            }}
            aria-label="Cerrar ventana"
          ></button>
        </Modal.Header>

        <Modal.Body className="cf-checkout-modal-body p-3 p-md-4">
          {orderSuccessData ? (
            /* PANTALLA DE ÉXITO */
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
                Hemos recibido tu orden con éxito en nuestro sistema de despacho.
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
                  <span className="text-secondary">Teléfono:</span>
                  <span className="text-white">{orderSuccessData.customerPhone}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-secondary">Modalidad:</span>
                  <span className="text-white">{orderSuccessData.deliveryZone}</span>
                </div>
                {orderSuccessData.deliveryAddress && (
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-secondary">Dirección:</span>
                    <span className="text-white text-end" style={{ maxWidth: '65%' }}>{orderSuccessData.deliveryAddress}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-secondary">Método de Pago:</span>
                  <span className="text-white">{orderSuccessData.paymentMethod}</span>
                </div>
                {orderSuccessData.paymentMethod === 'Pago Móvil' && (
                  <>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-secondary">Banco Origen:</span>
                      <span className="text-white">{orderSuccessData.bankOrigin}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-secondary">Referencia:</span>
                      <span className="text-white">***{orderSuccessData.paymentReference}</span>
                    </div>
                  </>
                )}
                {['Zelle', 'Zinli', 'Binance Pay (USDT)'].includes(orderSuccessData.paymentMethod) && (
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-secondary">Titular emisor:</span>
                    <span className="text-white">{orderSuccessData.paymentSenderName}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between mt-2 pt-2 border-top border-secondary border-opacity-25">
                  <div>
                    <span className="fw-bold text-white d-block">TOTAL:</span>
                    <small className="text-secondary">Tasa BCV: {orderSuccessData.bcvRate} Bs.</small>
                  </div>
                  <div className="text-end">
                    <span className="fw-bold text-success fs-5">${orderSuccessData.grandTotal.toFixed(2)}</span>
                    <div className="fw-bold text-warning small">{orderSuccessData.grandTotalBs} Bs.</div>
                  </div>
                </div>
              </div>

              <div 
                className="p-3 rounded mb-4 w-100" 
                style={{ backgroundColor: '#211a14', border: '1px dashed #d97706' }}
              >
                <p className="small text-warning m-0" style={{ fontSize: '0.82rem' }}>
                  📲 Caja procesará tu pedido y te contactará vía WhatsApp para coordinar la entrega.
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
                  setCheckoutStep(1);
                }}
              >
                Entendido, volver al Menú
              </button>
            </div>
          ) : (
            <div>
              {/* =========================================================================
                  PASO 1: 1º ÍTEMS Y PRECIOS -> 2º BLOQUE TOTAL -> 3º MODALIDAD ENTREGA
                  ========================================================================= */}
              {checkoutStep === 1 && (
                <div>
                  {/* 1. ÍTEMS CON SUS PRECIOS DESGLOSADOS */}
                  <div
                    className="p-3 mb-3"
                    style={{
                      backgroundColor: '#120f0d',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px'
                    }}
                  >
                    {/* Cabecera: Título con ícono y Monto en dorado */}
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: '1.2rem' }}>🎒</span>
                        <span
                          className="fw-black text-white text-uppercase"
                          style={{ fontSize: '0.95rem', letterSpacing: '0.5px' }}
                        >
                          RESUMEN DE PRODUCTOS ({totalItemsCount} ÍTEMS)
                        </span>
                      </div>
                      <span
                        className="fw-black"
                        style={{
                          color: '#f59e0b',
                          fontSize: '1.25rem'
                        }}
                      >
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Chips de productos */}
                    <div className="d-flex flex-wrap gap-2 pt-1">
                      {cart.map((item) => (
                        <div
                          key={item.cartItemId}
                          className="d-inline-flex align-items-center px-3 py-1"
                          style={{
                            backgroundColor: '#1c1714',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '10px',
                            fontSize: '0.88rem'
                          }}
                        >
                          <span className="fw-bold me-1" style={{ color: '#facc15' }}>
                            {item.quantity}x
                          </span>
                          <span className="text-white me-1">{item.name}</span>
                          <span className="text-secondary" style={{ fontSize: '0.82rem' }}>
                            (${ (item.price * item.quantity).toFixed(2) })
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* 2. BLOQUE DE TOTAL INMEDIATO ARRIBA */}
                  <div 
                    className="p-3 rounded-3 mb-3" 
                    style={{ 
                      backgroundColor: '#120f0d', 
                      border: '1px solid rgba(255, 255, 255, 0.08)' 
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="text-secondary" style={{ fontSize: '0.9rem' }}>
                        Subtotal Productos:
                      </span>
                      <div className="text-end">
                        <span className="fw-bold text-white fs-6">${subtotal.toFixed(2)}</span>
                        <span className="text-secondary small ms-2">({formatBs(subtotal)} Bs.)</span>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-secondary" style={{ fontSize: '0.9rem' }}>
                        Modalidad ({selectedZone.id === 'pickup' ? 'Pick Up' : selectedZone.name}):
                      </span>
                      <div className="text-end">
                        {deliveryCost === 0 ? (
                          <span className="fw-bold text-white">Gratis</span>
                        ) : (
                          <>
                            <span className="fw-bold text-white fs-6">${deliveryCost.toFixed(2)}</span>
                            <span className="text-secondary small ms-2">({formatBs(deliveryCost)} Bs.)</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-end pt-2 border-top border-secondary border-opacity-25">
                      <div>
                        <div 
                          className="fw-black text-white text-uppercase" 
                          style={{ fontSize: '1.25rem', letterSpacing: '0.5px' }}
                        >
                          TOTAL:
                        </div>
                        <span 
                          className="badge mt-1 px-2 py-1 text-warning fw-bold"
                          style={{ 
                            backgroundColor: 'rgba(217, 119, 6, 0.12)', 
                            border: '1px solid rgba(217, 119, 6, 0.35)', 
                            borderRadius: '6px', 
                            fontSize: '0.75rem' 
                          }}
                        >
                          Tasa Oficial BCV: {bcvRate.toFixed(2)} Bs.
                        </span>
                      </div>

                      <div className="text-end">
                        <div 
                          className="fw-black" 
                          style={{ 
                            color: '#22c55e', 
                            fontSize: '1.85rem', 
                            lineHeight: '1.1' 
                          }}
                        >
                          ${grandTotal.toFixed(2)}
                        </div>
                        <div 
                          className="fw-bold text-warning" 
                          style={{ 
                            fontSize: '1.2rem', 
                            letterSpacing: '0.5px' 
                          }}
                        >
                          {formatBs(grandTotal)} Bs.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. MODALIDAD DE ENTREGA Y NOTAS */}
                  <div className="row g-3 mb-3">
                    <div className="col-12">
                      <label className="form-label small fw-bold text-uppercase text-warning">
                        🛵 Modalidad del Pedido *
                      </label>
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
                      <div className="cf-zone-desc mt-1">
                        {selectedZone.description}
                      </div>
                    </div>

                    {selectedZone.id !== 'pickup' && (
                      <div className="col-12">
                        <label className="form-label small fw-bold text-uppercase text-warning">
                          📍 Dirección Exacta de Entrega *
                        </label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          size="sm"
                          className="cf-form-control"
                          placeholder="Sector, calle/avenida, edificio, casa, punto de referencia..."
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          required
                        />
                      </div>
                    )}

                    <div className="col-12">
                      <label className="form-label small fw-bold text-uppercase text-warning">
                        📝 Notas Especiales para la Cocina (Opcional)
                      </label>
                      <Form.Control
                        type="text"
                        size="sm"
                        className="cf-form-control"
                        placeholder="Ej. Salsas aparte, entregar en la recepción..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* BOTONES PASO 1 */}
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-4 pt-2 border-top border-secondary border-opacity-25">
                    <button
                      type="button"
                      className="btn-cf-back-to-cart order-2 order-sm-1"
                      onClick={handleBackToCart}
                    >
                      <span>←</span> Volver a la Mochila
                    </button>

                    <button
                      type="button"
                      className="btn w-100 py-3 fw-bold order-1 order-sm-2"
                      style={{
                        backgroundColor: '#d97706',
                        color: '#ffffff',
                        borderRadius: '9999px',
                        border: 'none',
                        boxShadow: '0 0 16px rgba(217, 119, 6, 0.45)',
                        fontSize: '0.95rem'
                      }}
                      onClick={handleProceedToStep2}
                    >
                      Continuar al Pago →
                    </button>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  PASO 2: 1º TOTAL ARRIBA -> 2º MÉTODO DE PAGO -> 3º DATOS DE CONTACTO
                  ========================================================================= */}
              {checkoutStep === 2 && (
                <Form onSubmit={handleCheckout}>
                  {/* 1. TOTAL ARRIBA EN EL PASO 2 */}
                  <div 
                    className="p-3 rounded-3 mb-3 d-flex justify-content-between align-items-center" 
                    style={{ backgroundColor: '#120f0d', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                  >
                    <div>
                      <div className="fw-black text-white text-uppercase" style={{ fontSize: '1.25rem' }}>
                        TOTAL:
                      </div>
                      <span className="badge mt-1 text-warning fw-bold bg-dark border border-secondary" style={{ fontSize: '0.72rem' }}>
                        Tasa Oficial BCV: {bcvRate.toFixed(2)} Bs.
                      </span>
                    </div>

                    <div className="text-end">
                      <div className="fw-black" style={{ color: '#22c55e', fontSize: '1.85rem', lineHeight: '1.1' }}>
                        ${grandTotal.toFixed(2)}
                      </div>
                      <div className="fw-bold text-warning" style={{ fontSize: '1.2rem' }}>
                        {formatBs(grandTotal)} Bs.
                      </div>
                    </div>
                  </div>

                  {/* 2. SELECTOR DE MÉTODO DE PAGO Y SUS DATOS DINÁMICOS */}
                  <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: '#14110f', border: '1px solid #29211b' }}>
                    <label className="form-label small fw-bold text-uppercase text-warning">
                      💳 Elige tu Método de Pago *
                    </label>
                    <Form.Select
                      size="sm"
                      className="cf-form-select mb-3"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </Form.Select>

                    {/* BLOQUE DINÁMICO: PAGO MÓVIL */}
                    {paymentMethod === 'Pago Móvil' && (
                      <div 
                        className="p-3 rounded" 
                        style={{ backgroundColor: '#181411', border: '1px solid #d97706', color: '#fff' }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="small fw-bold text-warning d-flex align-items-center gap-1">
                            <span>📲</span> DATOS PARA EL PAGO MÓVIL
                          </span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-warning rounded-pill px-2 py-0 fw-bold"
                            style={{ fontSize: '0.72rem' }}
                            onClick={() => handleCopyPaymentDetails(
                              `Banco: ${PAYMENT_INFO.pagoMovil.banco}\nCédula: ${PAYMENT_INFO.pagoMovil.cedula}\nTeléfono: ${PAYMENT_INFO.pagoMovil.telefono}\nMonto: ${formatBs(grandTotal)} Bs.`
                            )}
                          >
                            {copiedText ? '✓ ¡Copiado!' : '📋 Copiar Datos'}
                          </button>
                        </div>

                        <div className="small text-secondary mb-3" style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
                          <div>🏦 <strong>Banco:</strong> {PAYMENT_INFO.pagoMovil.banco}</div>
                          <div>🪪 <strong>Cédula / RIF:</strong> {PAYMENT_INFO.pagoMovil.cedula}</div>
                          <div>📱 <strong>Teléfono:</strong> {PAYMENT_INFO.pagoMovil.telefono}</div>
                          <div>👤 <strong>Titular:</strong> {PAYMENT_INFO.pagoMovil.titular}</div>
                          <div className="mt-2 text-warning fw-bold fs-6">
                            Monto exacto: {formatBs(grandTotal)} Bs. (${grandTotal.toFixed(2)})
                          </div>
                        </div>

                        <div className="row g-2">
                          <div className="col-12 col-md-6">
                            <Form.Group>
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
                          </div>

                          <div className="col-12 col-md-6">
                            <Form.Group>
                              <Form.Label className="cf-form-label" style={{ fontSize: '0.8rem' }}>Últimos 4 Dígitos de Ref. *</Form.Label>
                              <Form.Control
                                type="text"
                                maxLength={8}
                                size="sm"
                                className="cf-form-control"
                                placeholder="Ej. 8421"
                                required
                                value={paymentReference}
                                onChange={(e) => setPaymentReference(e.target.value.replace(/\D/g, ''))}
                              />
                            </Form.Group>
                          </div>

                          <div className="col-12 mt-2">
                            <Form.Group>
                              <Form.Label className="cf-form-label" style={{ fontSize: '0.8rem' }}>Comprobante de Pago Móvil (Captura) *</Form.Label>
                              <Form.Control
                                type="file"
                                accept="image/*"
                                size="sm"
                                className="cf-form-control"
                                required
                                onChange={handleFileChange}
                              />
                            </Form.Group>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* BLOQUE DINÁMICO: ZELLE */}
                    {paymentMethod === 'Zelle' && (
                      <div 
                        className="p-3 rounded" 
                        style={{ backgroundColor: '#181411', border: '1px solid #a855f7', color: '#fff' }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="small fw-bold text-info d-flex align-items-center gap-1">
                            <span>💵</span> DATOS PARA ZELLE
                          </span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-info rounded-pill px-2 py-0 fw-bold"
                            style={{ fontSize: '0.72rem' }}
                            onClick={() => handleCopyPaymentDetails(
                              `Zelle: ${PAYMENT_INFO.zelle.email}\nTitular: ${PAYMENT_INFO.zelle.titular}\nMonto: $${grandTotal.toFixed(2)}`
                            )}
                          >
                            {copiedText ? '✓ ¡Copiado!' : '📋 Copiar Datos'}
                          </button>
                        </div>

                        {grandTotal < 15 && (
                          <div className="alert alert-danger py-1 px-2 mb-2 small fw-bold">
                            ⚠️ El monto mínimo para pagar con Zelle es de $15.00.
                          </div>
                        )}

                        <div className="small text-secondary mb-3" style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
                          <div>📧 <strong>Correo Zelle:</strong> {PAYMENT_INFO.zelle.email}</div>
                          <div>👤 <strong>Titular:</strong> {PAYMENT_INFO.zelle.titular}</div>
                          <div>⚠️ <strong>Monto mínimo:</strong> $15.00</div>
                          <div className="mt-1 text-info fw-bold fs-6">
                            Monto exacto a transferir: ${grandTotal.toFixed(2)}
                          </div>
                        </div>

                        <div className="row g-2">
                          <div className="col-12 col-md-6">
                            <Form.Group>
                              <Form.Label className="cf-form-label" style={{ fontSize: '0.8rem' }}>Nombre del Titular de la Cuenta Zelle *</Form.Label>
                              <Form.Control
                                type="text"
                                size="sm"
                                className="cf-form-control"
                                placeholder="Ej. Robert Smith"
                                required
                                value={paymentSenderName}
                                onChange={(e) => setPaymentSenderName(e.target.value)}
                              />
                            </Form.Group>
                          </div>

                          <div className="col-12 col-md-6">
                            <Form.Group>
                              <Form.Label className="cf-form-label" style={{ fontSize: '0.8rem' }}>Capture del Comprobante (Obligatorio) *</Form.Label>
                              <Form.Control
                                type="file"
                                accept="image/*"
                                size="sm"
                                className="cf-form-control"
                                required
                                onChange={handleFileChange}
                              />
                            </Form.Group>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* BLOQUE DINÁMICO: ZINLI */}
                    {paymentMethod === 'Zinli' && (
                      <div 
                        className="p-3 rounded" 
                        style={{ backgroundColor: '#181411', border: '1px solid #3b82f6', color: '#fff' }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="small fw-bold text-primary d-flex align-items-center gap-1">
                            <span>💳</span> DATOS PARA ZINLI
                          </span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary rounded-pill px-2 py-0 fw-bold"
                            style={{ fontSize: '0.72rem' }}
                            onClick={() => handleCopyPaymentDetails(
                              `Zinli: ${PAYMENT_INFO.zinli.email}\nTitular: ${PAYMENT_INFO.zinli.titular}\nMonto: $${grandTotal.toFixed(2)}`
                            )}
                          >
                            {copiedText ? '✓ ¡Copiado!' : '📋 Copiar Datos'}
                          </button>
                        </div>

                        {grandTotal < 15 && (
                          <div className="alert alert-danger py-1 px-2 mb-2 small fw-bold">
                            ⚠️ El monto mínimo para pagar con Zinli es de $15.00.
                          </div>
                        )}

                        <div className="small text-secondary mb-3" style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
                          <div>📧 <strong>Correo Zinli:</strong> {PAYMENT_INFO.zinli.email}</div>
                          <div>👤 <strong>Titular:</strong> {PAYMENT_INFO.zinli.titular}</div>
                          <div>⚠️ <strong>Monto mínimo:</strong> $15.00</div>
                          <div className="mt-1 text-primary fw-bold fs-6">
                            Monto exacto a transferir: ${grandTotal.toFixed(2)}
                          </div>
                        </div>

                        <div className="row g-2">
                          <div className="col-12 col-md-6">
                            <Form.Group>
                              <Form.Label className="cf-form-label" style={{ fontSize: '0.8rem' }}>Nombre del Titular de la Cuenta Zinli *</Form.Label>
                              <Form.Control
                                type="text"
                                size="sm"
                                className="cf-form-control"
                                placeholder="Ej. Maria Delgado"
                                required
                                value={paymentSenderName}
                                onChange={(e) => setPaymentSenderName(e.target.value)}
                              />
                            </Form.Group>
                          </div>

                          <div className="col-12 col-md-6">
                            <Form.Group>
                              <Form.Label className="cf-form-label" style={{ fontSize: '0.8rem' }}>Capture del Comprobante (Obligatorio) *</Form.Label>
                              <Form.Control
                                type="file"
                                accept="image/*"
                                size="sm"
                                className="cf-form-control"
                                required
                                onChange={handleFileChange}
                              />
                            </Form.Group>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* BLOQUE DINÁMICO: BINANCE PAY */}
                    {paymentMethod === 'Binance Pay (USDT)' && (
                      <div 
                        className="p-3 rounded" 
                        style={{ backgroundColor: '#181411', border: '1px solid #facc15', color: '#fff' }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="small fw-bold text-warning d-flex align-items-center gap-1">
                            <span>🟡</span> DATOS BINANCE PAY (USDT)
                          </span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-warning rounded-pill px-2 py-0 fw-bold"
                            style={{ fontSize: '0.72rem' }}
                            onClick={() => handleCopyPaymentDetails(
                              `Binance Pay ID: ${PAYMENT_INFO.binance.payId}\nEmail: ${PAYMENT_INFO.binance.email}\nTitular: ${PAYMENT_INFO.binance.titular}\nMonto: $${grandTotal.toFixed(2)} USDT`
                            )}
                          >
                            {copiedText ? '✓ ¡Copiado!' : '📋 Copiar Datos'}
                          </button>
                        </div>

                        {grandTotal < 15 && (
                          <div className="alert alert-danger py-1 px-2 mb-2 small fw-bold">
                            ⚠️ El monto mínimo para pagar con Binance Pay es de $15.00 USDT.
                          </div>
                        )}

                        <div className="small text-secondary mb-3" style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
                          <div>🆔 <strong>Binance Pay ID:</strong> {PAYMENT_INFO.binance.payId}</div>
                          <div>📧 <strong>Correo de cuenta:</strong> {PAYMENT_INFO.binance.email}</div>
                          <div>👤 <strong>Nickname:</strong> {PAYMENT_INFO.binance.titular}</div>
                          <div>⚠️ <strong>Monto mínimo:</strong> $15.00 USDT</div>
                          <div className="mt-1 text-warning fw-bold fs-6">
                            Monto a enviar: ${grandTotal.toFixed(2)} USDT
                          </div>
                        </div>

                        <div className="row g-2">
                          <div className="col-12 col-md-6">
                            <Form.Group>
                              <Form.Label className="cf-form-label" style={{ fontSize: '0.8rem' }}>Nickname o Nombre de tu Cuenta Binance *</Form.Label>
                              <Form.Control
                                type="text"
                                size="sm"
                                className="cf-form-control"
                                placeholder="Ej. CryptoUser99"
                                required
                                value={paymentSenderName}
                                onChange={(e) => setPaymentSenderName(e.target.value)}
                              />
                            </Form.Group>
                          </div>

                          <div className="col-12 col-md-6">
                            <Form.Group>
                              <Form.Label className="cf-form-label" style={{ fontSize: '0.8rem' }}>Capture del Comprobante (Obligatorio) *</Form.Label>
                              <Form.Control
                                type="file"
                                accept="image/*"
                                size="sm"
                                className="cf-form-control"
                                required
                                onChange={handleFileChange}
                              />
                            </Form.Group>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* OTROS MÉTODOS (EFECTIVO O PUNTO DE VENTA) */}
                    {!['Pago Móvil', 'Zelle', 'Zinli', 'Binance Pay (USDT)'].includes(paymentMethod) && (
                      <div className="p-3 rounded bg-dark border border-secondary border-opacity-25 small text-secondary">
                        <strong className="text-white d-block mb-1">Pago presencial: {paymentMethod}</strong>
                        Cancela directamente al momento de recibir o retirar tu orden.
                      </div>
                    )}
                  </div>

                  {/* 3. FORMULARIO: DATOS DE CONTACTO DEL CLIENTE */}
                  <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: '#14110f', border: '1px solid #29211b' }}>
                    <h6 className="cf-section-title mb-3">
                      <span>👤</span> Datos de Contacto para el Pedido
                    </h6>

                    <div className="row g-2">
                      <div className="col-12 col-md-4">
                        <Form.Group>
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
                      </div>

                      <div className="col-12 col-md-4">
                        <Form.Group>
                          <Form.Label className="cf-form-label">WhatsApp de Contacto *</Form.Label>
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
                      </div>

                      <div className="col-12 col-md-4">
                        <Form.Group>
                          <Form.Label className="cf-form-label">Cédula de Identidad *</Form.Label>
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
                      </div>
                    </div>
                  </div>

                  {/* BOTONES PASO 2 */}
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 mt-4 pt-2 border-top border-secondary border-opacity-25">
                    <button
                      type="button"
                      className="btn-cf-back-to-cart order-2 order-sm-1"
                      onClick={() => setCheckoutStep(1)}
                      disabled={isSubmitting}
                    >
                      <span>←</span> Volver a Paso 1
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn w-100 py-3 fw-bold order-1 order-sm-2"
                      style={{
                        backgroundColor: isSubmitting ? '#78350f' : '#22c55e',
                        color: isSubmitting ? '#ffffff' : '#000000',
                        borderRadius: '9999px',
                        boxShadow: '0 0 16px rgba(34, 197, 94, 0.45)',
                        border: 'none',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        fontSize: '0.95rem'
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
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* MODAL HORARIOS / GLASSMORPHISM */}
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
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)'
          }}
        >
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
              boxShadow: '0 0 20px rgba(217, 119, 6, 0.45)'
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