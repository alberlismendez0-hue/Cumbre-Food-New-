import { useState, useEffect, useMemo } from 'react';
import { Modal } from 'react-bootstrap';
import {
  BURGER_SIDES,
  CHICKEN_COOKING_TYPES,
  BURGER_ADDONS,
  CROSS_SELL_DRINKS,
  DRINK_FLAVORS,
  COMBO_1Y1_MEAT_OPTIONS,
  COMBO_1Y1_CHICKEN_OPTIONS,
  PLATO_SIDES,
  PLATO_SALADS
} from '../data/menu';

export default function ProductCustomizerModal({
  show,
  onHide,
  product,
  onAddToCart,
  getFallbackImage
}) {
  if (!product) return null;

  // Determinar el tipo de producto para renderizado condicional
  const isBurger =
    product.category === 'hamburguesas_carne' ||
    product.category === 'hamburguesas_pollo' ||
    product.category === 'hamburguesas_chuleta';
  const isChickenBurger = product.category === 'hamburguesas_pollo';
  const isPlato = product.category === 'platos';
  const isPlatoPollo =
    isPlato &&
    (product.id === 'pl_pollo' || product.id === 'pl_pollo_crema');
  const isCombo = product.category === 'combos';
  const isBebida = product.category === 'bebidas';

  // --- ESTADOS DE CONFIGURACIÓN ---
  const [quantity, setQuantity] = useState(1);

  // Hamburguesas
  const [burgerSide, setBurgerSide] = useState('chips');
  const [chickenCooking, setChickenCooking] = useState('crispy');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [crossSellDrink, setCrossSellDrink] = useState('none');
  const [drinkFlavor, setDrinkFlavor] = useState('Coca Cola');

  // Combos
  const [comboDrinkFlavor, setComboDrinkFlavor] = useState('Coca Cola');
  const [chicken1Cooking, setChicken1Cooking] = useState('crispy');
  const [chicken2Cooking, setChicken2Cooking] = useState('crispy');
  const [combo1y1Meat, setCombo1y1Meat] = useState(COMBO_1Y1_MEAT_OPTIONS[0]);
  const [combo1y1Chicken, setCombo1y1Chicken] = useState(COMBO_1Y1_CHICKEN_OPTIONS[0]);
  const [combo1y1ChickenCooking, setCombo1y1ChickenCooking] = useState('crispy');

  // Platos
  const [platoSide, setPlatoSide] = useState(PLATO_SIDES[0]);
  const [platoSalad, setPlatoSalad] = useState(PLATO_SALADS[0]);
  const [platoChickenCooking, setPlatoChickenCooking] = useState('crispy');

  // Bebidas directas
  const [directDrinkFlavor, setDirectDrinkFlavor] = useState('Coca Cola');

  // Notas de cocina individuales
  const [itemNotes, setItemNotes] = useState('');

  // Reiniciar estados cuando se abre el modal con un nuevo producto
  useEffect(() => {
    if (show) {
      setQuantity(1);
      setBurgerSide('chips');
      setChickenCooking('crispy');
      setSelectedAddons([]);
      setCrossSellDrink('none');
      setDrinkFlavor('Coca Cola');
      setComboDrinkFlavor('Coca Cola');
      setChicken1Cooking('crispy');
      setChicken2Cooking('crispy');
      setCombo1y1Meat(COMBO_1Y1_MEAT_OPTIONS[0]);
      setCombo1y1Chicken(COMBO_1Y1_CHICKEN_OPTIONS[0]);
      setCombo1y1ChickenCooking('crispy');
      setPlatoSide(PLATO_SIDES[0]);
      setPlatoSalad(PLATO_SALADS[0]);
      setPlatoChickenCooking('crispy');
      setDirectDrinkFlavor('Coca Cola');
      setItemNotes('');
    }
  }, [show, product]);

  // Manejador de selección/deselección de adicionales
  const toggleAddon = (addonId) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  };

  // Cálculo de precios en tiempo real
  const addonsTotal = useMemo(() => {
    return selectedAddons.reduce((sum, addonId) => {
      const addon = BURGER_ADDONS.find((a) => a.id === addonId);
      return sum + (addon ? addon.price : 0);
    }, 0);
  }, [selectedAddons]);

  const crossSellDrinkObj = useMemo(() => {
    return CROSS_SELL_DRINKS.find((d) => d.id === crossSellDrink) || CROSS_SELL_DRINKS[0];
  }, [crossSellDrink]);

  const crossSellPrice = crossSellDrinkObj.price;
  const unitPrice = product.price + addonsTotal + crossSellPrice;
  const totalPrice = unitPrice * quantity;

  // Generar descripción estructurada de las opciones seleccionadas
  const buildCustomizationDetails = () => {
    const details = [];

    // Hamburguesas
    if (isBurger) {
      const sideObj = BURGER_SIDES.find((s) => s.id === burgerSide);
      if (sideObj) details.push({ label: 'Acompañante', value: sideObj.name });

      if (isChickenBurger) {
        const cookObj = CHICKEN_COOKING_TYPES.find((c) => c.id === chickenCooking);
        if (cookObj) details.push({ label: 'Preparación', value: cookObj.name });
      }

      if (selectedAddons.length > 0) {
        const addonNames = selectedAddons
          .map((id) => {
            const a = BURGER_ADDONS.find((item) => item.id === id);
            return a ? `+${a.name}` : '';
          })
          .filter(Boolean);
        details.push({ label: 'Adicionales', value: addonNames.join(', ') });
      }

      if (crossSellDrink !== 'none') {
        details.push({
          label: 'Bebida',
          value: `${crossSellDrinkObj.name} (${drinkFlavor})`
        });
      }
    }

    // Combos
    if (isCombo) {
      if (product.id === 'cb_lomito') {
        details.push({ label: 'Refresco 1L', value: comboDrinkFlavor });
      } else if (product.id === 'cb_chicken') {
        const c1 = CHICKEN_COOKING_TYPES.find((c) => c.id === chicken1Cooking)?.name;
        const c2 = CHICKEN_COOKING_TYPES.find((c) => c.id === chicken2Cooking)?.name;
        details.push({ label: 'Burger 1', value: c1 });
        details.push({ label: 'Burger 2', value: c2 });
        details.push({ label: 'Refresco 1L', value: comboDrinkFlavor });
      } else if (product.id === 'cb_1_y_1') {
        const cCook = CHICKEN_COOKING_TYPES.find((c) => c.id === combo1y1ChickenCooking)?.name;
        details.push({ label: 'Burger Carne', value: combo1y1Meat });
        details.push({ label: 'Burger Pollo', value: `${combo1y1Chicken} (${cCook})` });
        details.push({ label: 'Refresco 1L', value: comboDrinkFlavor });
      } else if (product.id === 'cb_sierra_nevada') {
        details.push({ label: 'Refresco 1.5L', value: comboDrinkFlavor });
      } else {
        // Otros combos
        if (crossSellDrink !== 'none') {
          details.push({
            label: 'Bebida',
            value: `${crossSellDrinkObj.name} (${drinkFlavor})`
          });
        }
      }

      if (selectedAddons.length > 0) {
        const addonNames = selectedAddons
          .map((id) => {
            const a = BURGER_ADDONS.find((item) => item.id === id);
            return a ? `+${a.name}` : '';
          })
          .filter(Boolean);
        details.push({ label: 'Adicionales', value: addonNames.join(', ') });
      }
    }

    // Platos
    if (isPlato) {
      details.push({ label: 'Acompañante', value: platoSide });
      details.push({ label: 'Ensalada', value: platoSalad });
      if (isPlatoPollo) {
        const cookObj = CHICKEN_COOKING_TYPES.find((c) => c.id === platoChickenCooking);
        if (cookObj) details.push({ label: 'Tipo Pollo', value: cookObj.name });
      }
      if (selectedAddons.length > 0) {
        const addonNames = selectedAddons
          .map((id) => {
            const a = BURGER_ADDONS.find((item) => item.id === id);
            return a ? `+${a.name}` : '';
          })
          .filter(Boolean);
        details.push({ label: 'Adicionales', value: addonNames.join(', ') });
      }
      if (crossSellDrink !== 'none') {
        details.push({
          label: 'Bebida',
          value: `${crossSellDrinkObj.name} (${drinkFlavor})`
        });
      }
    }

    // Bebidas directas
    if (isBebida) {
      details.push({ label: 'Sabor', value: directDrinkFlavor });
    }

    // Entradas / Otros
    if (product.category === 'entradas' || product.category === 'adicionales') {
      if (selectedAddons.length > 0) {
        const addonNames = selectedAddons
          .map((id) => {
            const a = BURGER_ADDONS.find((item) => item.id === id);
            return a ? `+${a.name}` : '';
          })
          .filter(Boolean);
        details.push({ label: 'Extras', value: addonNames.join(', ') });
      }
      if (crossSellDrink !== 'none') {
        details.push({
          label: 'Bebida',
          value: `${crossSellDrinkObj.name} (${drinkFlavor})`
        });
      }
    }

    if (itemNotes.trim()) {
      details.push({ label: 'Nota', value: itemNotes.trim() });
    }

    return details;
  };

  // Confirmar y agregar al carrito
  const handleConfirm = () => {
    const details = buildCustomizationDetails();
    
    // Crear una clave única que distinga esta combinación específica
    const signature = JSON.stringify({
      id: product.id,
      details,
      unitPrice
    });

    const customizedItem = {
      ...product,
      cartItemId: `${product.id}-${btoa(encodeURIComponent(signature)).slice(0, 16)}`,
      quantity,
      price: unitPrice, // Precio unitario con extras
      basePrice: product.price,
      customizationDetails: details,
      customizationSummary: details.map((d) => `${d.label}: ${d.value}`).join(' | '),
      rawOptions: {
        burgerSide,
        chickenCooking,
        selectedAddons,
        crossSellDrink,
        drinkFlavor,
        comboDrinkFlavor,
        chicken1Cooking,
        chicken2Cooking,
        combo1y1Meat,
        combo1y1Chicken,
        combo1y1ChickenCooking,
        platoSide,
        platoSalad,
        platoChickenCooking,
        directDrinkFlavor,
        itemNotes
      }
    };

    onAddToCart(customizedItem);
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      className="cf-modal-customizer"
      backdropClassName="cf-modal-backdrop"
      scrollable
    >
      <Modal.Body className="p-0 position-relative">
        {/* Botón flotante de cierre */}
        <button
          type="button"
          className="cf-modal-close-btn"
          onClick={onHide}
          aria-label="Cerrar personalización"
        >
          ✕
        </button>

        {/* =========================================================================
            HERO DEL PRODUCTO CON IMAGEN Y DATOS
            ========================================================================= */}
        <div className="cf-modal-hero">
          <img
            src={product.image}
            alt={product.name}
            className="cf-modal-hero-img"
            onError={(e) => {
              e.currentTarget.onerror = null;
              if (getFallbackImage) {
                e.currentTarget.src = getFallbackImage(product.category);
              }
            }}
          />
          <div className="cf-modal-hero-overlay">
            <span className="cf-modal-badge-cat">
              ✨ Personaliza tu plato
            </span>
            <h2 className="cf-modal-title">{product.name}</h2>
            <p className="cf-modal-desc">{product.description}</p>
            <div className="cf-modal-base-price">
              Precio base: <strong>${product.price.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* =========================================================================
            CUERPO DE OPCIONES Y MODIFICADORES
            ========================================================================= */}
        <div className="cf-modal-content-scroll">
          {/* 1. SELECCIÓN DE ACOMPAÑANTE (HAMBURGUESAS) */}
          {isBurger && (
            <div className="cf-option-group">
              <div className="cf-option-group-header">
                <div>
                  <h4 className="cf-option-title">🥔 Elige tu Acompañante</h4>
                  <p className="cf-option-subtitle">Incluido con tu hamburguesa</p>
                </div>
                <span className="cf-badge-required">Obligatorio</span>
              </div>
              <div className="row g-2">
                {BURGER_SIDES.map((side) => {
                  const isSelected = burgerSide === side.id;
                  return (
                    <div key={side.id} className="col-12 col-sm-6">
                      <div
                        className={`cf-choice-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setBurgerSide(side.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <span className="cf-radio-circle">
                            {isSelected && <span className="cf-radio-dot" />}
                          </span>
                          <div>
                            <div className="cf-choice-name">{side.name}</div>
                            <div className="cf-choice-desc">{side.description}</div>
                          </div>
                        </div>
                        <span className="cf-choice-free">Gratis</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. TIPO DE COCCIÓN / PREPARACIÓN (SOLO HAMBURGUESAS DE POLLO) */}
          {isChickenBurger && (
            <div className="cf-option-group">
              <div className="cf-option-group-header">
                <div>
                  <h4 className="cf-option-title">🍗 Tipo de Preparación del Pollo</h4>
                  <p className="cf-option-subtitle">Elige cómo prefieres tu pechuga</p>
                </div>
                <span className="cf-badge-required">Obligatorio</span>
              </div>
              <div className="row g-2">
                {CHICKEN_COOKING_TYPES.map((type) => {
                  const isSelected = chickenCooking === type.id;
                  return (
                    <div key={type.id} className="col-12 col-sm-6">
                      <div
                        className={`cf-choice-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setChickenCooking(type.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <span className="cf-radio-circle">
                            {isSelected && <span className="cf-radio-dot" />}
                          </span>
                          <div>
                            <div className="cf-choice-name">{type.name}</div>
                            <div className="cf-choice-desc">{type.description}</div>
                          </div>
                        </div>
                        <span className="cf-choice-free">Incluido</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. COMBOS: FLUJO ESPECÍFICO POR COMBO */}
          {isCombo && (
            <>
              {/* COMBO LOMITO */}
              {product.id === 'cb_lomito' && (
                <div className="cf-option-group">
                  <div className="cf-option-group-header">
                    <div>
                      <h4 className="cf-option-title">🍾 Sabor del Refresco 1L</h4>
                      <p className="cf-option-subtitle">Incluido en el Combo Lomito</p>
                    </div>
                    <span className="cf-badge-required">Obligatorio</span>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {DRINK_FLAVORS.map((flavor) => (
                      <button
                        key={flavor}
                        type="button"
                        className={`cf-chip-btn ${comboDrinkFlavor === flavor ? 'active' : ''}`}
                        onClick={() => setComboDrinkFlavor(flavor)}
                      >
                        {flavor}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* COMBO CHICKEN */}
              {product.id === 'cb_chicken' && (
                <>
                  <div className="cf-option-group">
                    <div className="cf-option-group-header">
                      <div>
                        <h4 className="cf-option-title">🍗 Burger de Pollo 1</h4>
                        <p className="cf-option-subtitle">Cocción de la primera hamburguesa</p>
                      </div>
                      <span className="cf-badge-required">Obligatorio</span>
                    </div>
                    <div className="row g-2">
                      {CHICKEN_COOKING_TYPES.map((type) => (
                        <div key={type.id} className="col-12 col-sm-6">
                          <div
                            className={`cf-choice-card ${chicken1Cooking === type.id ? 'selected' : ''}`}
                            onClick={() => setChicken1Cooking(type.id)}
                            role="button"
                            tabIndex={0}
                          >
                            <div className="d-flex align-items-center gap-3">
                              <span className="cf-radio-circle">
                                {chicken1Cooking === type.id && <span className="cf-radio-dot" />}
                              </span>
                              <span className="cf-choice-name">{type.name}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="cf-option-group">
                    <div className="cf-option-group-header">
                      <div>
                        <h4 className="cf-option-title">🍗 Burger de Pollo 2</h4>
                        <p className="cf-option-subtitle">Cocción de la segunda hamburguesa</p>
                      </div>
                      <span className="cf-badge-required">Obligatorio</span>
                    </div>
                    <div className="row g-2">
                      {CHICKEN_COOKING_TYPES.map((type) => (
                        <div key={type.id} className="col-12 col-sm-6">
                          <div
                            className={`cf-choice-card ${chicken2Cooking === type.id ? 'selected' : ''}`}
                            onClick={() => setChicken2Cooking(type.id)}
                            role="button"
                            tabIndex={0}
                          >
                            <div className="d-flex align-items-center gap-3">
                              <span className="cf-radio-circle">
                                {chicken2Cooking === type.id && <span className="cf-radio-dot" />}
                              </span>
                              <span className="cf-choice-name">{type.name}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="cf-option-group">
                    <div className="cf-option-group-header">
                      <div>
                        <h4 className="cf-option-title">🍾 Sabor del Refresco 1L</h4>
                        <p className="cf-option-subtitle">Incluido en el Combo Chicken</p>
                      </div>
                      <span className="cf-badge-required">Obligatorio</span>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {DRINK_FLAVORS.map((flavor) => (
                        <button
                          key={flavor}
                          type="button"
                          className={`cf-chip-btn ${comboDrinkFlavor === flavor ? 'active' : ''}`}
                          onClick={() => setComboDrinkFlavor(flavor)}
                        >
                          {flavor}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* COMBO 1 Y 1 */}
              {product.id === 'cb_1_y_1' && (
                <>
                  <div className="cf-option-group">
                    <div className="cf-option-group-header">
                      <div>
                        <h4 className="cf-option-title">🍔 Selecciona tu Burger de Carne</h4>
                        <p className="cf-option-subtitle">
                          Opciones disponibles (Excluye Pico Bolívar y Pico La Torre)
                        </p>
                      </div>
                      <span className="cf-badge-required">Obligatorio</span>
                    </div>
                    <div className="row g-2">
                      {COMBO_1Y1_MEAT_OPTIONS.map((name) => (
                        <div key={name} className="col-12 col-sm-6">
                          <div
                            className={`cf-choice-card ${combo1y1Meat === name ? 'selected' : ''}`}
                            onClick={() => setCombo1y1Meat(name)}
                            role="button"
                            tabIndex={0}
                          >
                            <div className="d-flex align-items-center gap-3">
                              <span className="cf-radio-circle">
                                {combo1y1Meat === name && <span className="cf-radio-dot" />}
                              </span>
                              <span className="cf-choice-name">🍔 {name}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="cf-option-group">
                    <div className="cf-option-group-header">
                      <div>
                        <h4 className="cf-option-title">🍗 Selecciona tu Burger de Pollo</h4>
                        <p className="cf-option-subtitle">Elige la variedad y su cocción</p>
                      </div>
                      <span className="cf-badge-required">Obligatorio</span>
                    </div>
                    <div className="row g-2 mb-3">
                      {COMBO_1Y1_CHICKEN_OPTIONS.map((name) => (
                        <div key={name} className="col-12 col-sm-6">
                          <div
                            className={`cf-choice-card ${combo1y1Chicken === name ? 'selected' : ''}`}
                            onClick={() => setCombo1y1Chicken(name)}
                            role="button"
                            tabIndex={0}
                          >
                            <div className="d-flex align-items-center gap-3">
                              <span className="cf-radio-circle">
                                {combo1y1Chicken === name && <span className="cf-radio-dot" />}
                              </span>
                              <span className="cf-choice-name">🍗 {name}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <label className="cf-sublabel mb-2">Preparación del pollo:</label>
                    <div className="d-flex gap-2">
                      {CHICKEN_COOKING_TYPES.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          className={`cf-chip-btn ${combo1y1ChickenCooking === type.id ? 'active' : ''}`}
                          onClick={() => setCombo1y1ChickenCooking(type.id)}
                        >
                          {type.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="cf-option-group">
                    <div className="cf-option-group-header">
                      <div>
                        <h4 className="cf-option-title">🍾 Sabor del Refresco 1L</h4>
                        <p className="cf-option-subtitle">Incluido en el Combo 1 y 1</p>
                      </div>
                      <span className="cf-badge-required">Obligatorio</span>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {DRINK_FLAVORS.map((flavor) => (
                        <button
                          key={flavor}
                          type="button"
                          className={`cf-chip-btn ${comboDrinkFlavor === flavor ? 'active' : ''}`}
                          onClick={() => setComboDrinkFlavor(flavor)}
                        >
                          {flavor}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* COMBO SIERRA NEVADA */}
              {product.id === 'cb_sierra_nevada' && (
                <div className="cf-option-group">
                  <div className="cf-option-group-header">
                    <div>
                      <h4 className="cf-option-title">🍾 Sabor del Refresco 1.5L</h4>
                      <p className="cf-option-subtitle">Incluido en el Combo Sierra Nevada</p>
                    </div>
                    <span className="cf-badge-required">Obligatorio</span>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {DRINK_FLAVORS.map((flavor) => (
                      <button
                        key={flavor}
                        type="button"
                        className={`cf-chip-btn ${comboDrinkFlavor === flavor ? 'active' : ''}`}
                        onClick={() => setComboDrinkFlavor(flavor)}
                      >
                        {flavor}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* 4. PLATOS: ACOMPAÑANTE, ENSALADA & TIPO DE POLLO */}
          {isPlato && (
            <>
              <div className="cf-option-group">
                <div className="cf-option-group-header">
                  <div>
                    <h4 className="cf-option-title">🥔 Elige tu Acompañante</h4>
                    <p className="cf-option-subtitle">Guarnición principal</p>
                  </div>
                  <span className="cf-badge-required">Obligatorio</span>
                </div>
                <div className="row g-2">
                  {PLATO_SIDES.map((side) => (
                    <div key={side} className="col-12 col-sm-4">
                      <div
                        className={`cf-choice-card ${platoSide === side ? 'selected' : ''}`}
                        onClick={() => setPlatoSide(side)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className="cf-radio-circle">
                            {platoSide === side && <span className="cf-radio-dot" />}
                          </span>
                          <span className="cf-choice-name">{side}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cf-option-group">
                <div className="cf-option-group-header">
                  <div>
                    <h4 className="cf-option-title">🥗 Elige tu Ensalada</h4>
                    <p className="cf-option-subtitle">Frescura para acompañar</p>
                  </div>
                  <span className="cf-badge-required">Obligatorio</span>
                </div>
                <div className="row g-2">
                  {PLATO_SALADS.map((salad) => (
                    <div key={salad} className="col-12 col-sm-6">
                      <div
                        className={`cf-choice-card ${platoSalad === salad ? 'selected' : ''}`}
                        onClick={() => setPlatoSalad(salad)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className="cf-radio-circle">
                            {platoSalad === salad && <span className="cf-radio-dot" />}
                          </span>
                          <span className="cf-choice-name">{salad}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {isPlatoPollo && (
                <div className="cf-option-group">
                  <div className="cf-option-group-header">
                    <div>
                      <h4 className="cf-option-title">🍗 Tipo de Preparación</h4>
                      <p className="cf-option-subtitle">¿Cómo deseas tu pechuga?</p>
                    </div>
                    <span className="cf-badge-required">Obligatorio</span>
                  </div>
                  <div className="d-flex gap-2">
                    {CHICKEN_COOKING_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        className={`cf-chip-btn ${platoChickenCooking === type.id ? 'active' : ''}`}
                        onClick={() => setPlatoChickenCooking(type.id)}
                      >
                        {type.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* 5. BEBIDAS DIRECTAS: SELECCIÓN DE SABOR */}
          {isBebida && (
            <div className="cf-option-group">
              <div className="cf-option-group-header">
                <div>
                  <h4 className="cf-option-title">🥤 Elige el Sabor de tu Refresco</h4>
                  <p className="cf-option-subtitle">Sabor preferido bien frío</p>
                </div>
                <span className="cf-badge-required">Obligatorio</span>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {DRINK_FLAVORS.map((flavor) => (
                  <button
                    key={flavor}
                    type="button"
                    className={`cf-chip-btn ${directDrinkFlavor === flavor ? 'active' : ''}`}
                    onClick={() => setDirectDrinkFlavor(flavor)}
                  >
                    {flavor}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 6. ADICIONALES / EXTRAS (OPCIONALES CON COSTO) */}
          {(isBurger || isCombo || isPlato || product.category === 'entradas') && (
            <div className="cf-option-group">
              <div className="cf-option-group-header">
                <div>
                  <h4 className="cf-option-title">➕ ¿Deseas Agregar Extras?</h4>
                  <p className="cf-option-subtitle">Potencia el sabor de tu plato</p>
                </div>
                <span className="cf-badge-optional">Opcional</span>
              </div>

              <div className="row g-2">
                {BURGER_ADDONS.map((addon) => {
                  const isChecked = selectedAddons.includes(addon.id);
                  return (
                    <div key={addon.id} className="col-12 col-sm-6">
                      <div
                        className={`cf-addon-card ${isChecked ? 'selected' : ''}`}
                        onClick={() => toggleAddon(addon.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className={`cf-checkbox-square ${isChecked ? 'checked' : ''}`}>
                            {isChecked ? '✓' : ''}
                          </span>
                          <span className="cf-addon-icon">{addon.icon}</span>
                          <span className="cf-addon-name">{addon.name}</span>
                        </div>
                        <span className="cf-addon-price">+${addon.price.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 7. VENTA CRUZADA DE BEBIDAS (CROSS-SELLING) */}
          {!isBebida && product.id !== 'cb_lomito' && product.id !== 'cb_chicken' && product.id !== 'cb_1_y_1' && product.id !== 'cb_sierra_nevada' && (
            <div className="cf-option-group">
              <div className="cf-option-group-header">
                <div>
                  <h4 className="cf-option-title">🥤 ¿Deseas Acompañar con una Bebida Fría?</h4>
                  <p className="cf-option-subtitle">Venta cruzada con tu orden</p>
                </div>
                <span className="cf-badge-crosssell">Recomendado</span>
              </div>

              <div className="row g-2 mb-3">
                {CROSS_SELL_DRINKS.map((drink) => {
                  const isSelected = crossSellDrink === drink.id;
                  return (
                    <div key={drink.id} className="col-6 col-sm-4 col-md">
                      <div
                        className={`cf-drink-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setCrossSellDrink(drink.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="cf-drink-icon">{drink.icon}</div>
                        <div className="cf-drink-name">{drink.name}</div>
                        <div className="cf-drink-price">
                          {drink.price === 0 ? 'Sin Bebida' : `+$${drink.price.toFixed(2)}`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Si seleccionó una bebida con costo, desplegar selector de sabor */}
              {crossSellDrink !== 'none' && (
                <div className="cf-flavor-subpanel animate-fade-in">
                  <label className="cf-sublabel mb-2">Selecciona el sabor del refresco:</label>
                  <div className="d-flex flex-wrap gap-2">
                    {DRINK_FLAVORS.map((flavor) => (
                      <button
                        key={flavor}
                        type="button"
                        className={`cf-chip-btn ${drinkFlavor === flavor ? 'active' : ''}`}
                        onClick={() => setDrinkFlavor(flavor)}
                      >
                        {flavor}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 8. NOTAS O INSTRUCCIONES ESPECIALES PARA COCINA */}
          <div className="cf-option-group">
            <div className="cf-option-group-header">
              <div>
                <h4 className="cf-option-title">📝 Notas Especiales para este Plato</h4>
                <p className="cf-option-subtitle">¿Algún ingrediente que prefieras omitir?</p>
              </div>
              <span className="cf-badge-optional">Opcional</span>
            </div>
            <input
              type="text"
              className="cf-modal-notes-input"
              placeholder="Ej. Sin cebolla, salsas aparte, punto de cocción..."
              value={itemNotes}
              onChange={(e) => setItemNotes(e.target.value)}
              maxLength={120}
            />
          </div>
        </div>

        {/* =========================================================================
            PIE DEL MODAL CON SELECTOR DE CANTIDAD Y BOTÓN CTA DINÁMICO
            ========================================================================= */}
        <div className="cf-modal-footer">
          <div className="cf-modal-footer-container">
            {/* Contador de Cantidad */}
            <div className="cf-stepper-wrap">
              <button
                type="button"
                className="cf-stepper-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Disminuir cantidad"
              >
                -
              </button>
              <span className="cf-stepper-val">{quantity}</span>
              <button
                type="button"
                className="cf-stepper-btn"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>

            {/* Botón de Agregar con Precio en Tiempo Real */}
            <button
              type="button"
              className="cf-modal-cta-btn"
              onClick={handleConfirm}
            >
              <span>+ Agregar a la Mochila</span>
              <span className="cf-cta-divider">|</span>
              <span className="cf-cta-price">${totalPrice.toFixed(2)}</span>
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
