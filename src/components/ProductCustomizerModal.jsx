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
  PLATO_SALADS,
  ENTRADAS_SAUCE_OPTIONS
} from '../data/menu';

const getSauceIcon = (sauceName) => {
  switch (sauceName.toLowerCase()) {
    case 'kétchup':
    case 'ketchup':
      return '🍅';
    case 'mayonesa':
      return '🥣';
    case 'bbq':
      return '🍖';
    case 'mostaza':
      return '🟡';
    case 'salsa tártara':
    case 'tártara':
      return '🧄';
    case 'salsa de maíz':
    case 'maíz':
      return '🌽';
    default:
      return '🥫';
  }
};

export default function ProductCustomizerModal({
  show,
  onHide,
  product,
  onAddToCart,
  getFallbackImage
}) {
  const isBurger =
    product?.category === 'hamburguesas_carne' ||
    product?.category === 'hamburguesas_pollo' ||
    product?.category === 'hamburguesas_chuleta';
  const isChickenBurger = product?.category === 'hamburguesas_pollo';
  const isPlato = product?.category === 'platos';
  const isPlatoPollo =
    isPlato && (product?.id === 'pl_pollo' || product?.id === 'pl_pollo_crema');
  const isCombo = product?.category === 'combos';
  const isBebida = product?.category === 'bebidas';
  const isEntrada = product?.category === 'entradas';

  const sauceConfig =
    product?.customization?.sauces ||
    (isEntrada &&
    (product?.id === 'ent_chips' ||
      product?.id === 'serv_chips' ||
      product?.id === 'ent_tequenos' ||
      product?.id === 'tequenos_nevados' ||
      product?.id === 'ent_papas_francesas' ||
      product?.id === 'papas_sierra' ||
      product?.id === 'ent_tenders' ||
      product?.id === 'tenders_pollo')
      ? {
          required: true,
          max: 2,
          options: ENTRADAS_SAUCE_OPTIONS
        }
      : null);

  const proteinCookingConfig =
    product?.customization?.proteinCooking ||
    (isEntrada &&
    (product?.id === 'ent_ensalada_cesar' || product?.id === 'ensalada_cesar')
      ? {
          required: true,
          options: ['Pollo Crispy', 'Pollo a la Plancha']
        }
      : null);

  const baseProteinConfig =
    product?.customization?.baseProtein ||
    (isEntrada &&
    (product?.id === 'ent_papas_mifafi' || product?.id === 'papas_mifafi')
      ? {
          required: true,
          options: ['Chuleta Ahumada', 'Lomito', 'Pollo a la Plancha']
        }
      : null);

  const extraProteinsConfig =
    product?.customization?.extraProteins ||
    (isEntrada &&
    (product?.id === 'ent_papas_mifafi' ||
      product?.id === 'papas_mifafi' ||
      product?.id === 'ent_papas_culata')
      ? [
          { id: 'extra_pollo', name: 'Extra Pollo', price: 2.0, icon: '🍗' },
          { id: 'extra_lomito', name: 'Extra Carne / Lomito', price: 2.5, icon: '🥩' },
          { id: 'extra_crispy', name: 'Extra Tiras Crispy', price: 2.5, icon: '🍗' }
        ]
      : null);

  // Control de pasos
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Estados de opciones
  const [quantity, setQuantity] = useState(1);
  const [burgerSide, setBurgerSide] = useState('chips');
  const [chickenCooking, setChickenCooking] = useState('crispy');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedDrinksList, setSelectedDrinksList] = useState([]);
  const [currentDrinkType, setCurrentDrinkType] = useState('personal');
  const [currentDrinkFlavor, setCurrentDrinkFlavor] = useState(DRINK_FLAVORS[0]);

  const [comboDrinkFlavor, setComboDrinkFlavor] = useState('Coca Cola');
  const [chicken1Cooking, setChicken1Cooking] = useState('crispy');
  const [chicken2Cooking, setChicken2Cooking] = useState('crispy');
  const [combo1y1Meat, setCombo1y1Meat] = useState(COMBO_1Y1_MEAT_OPTIONS[0]);
  const [combo1y1Chicken, setCombo1y1Chicken] = useState(COMBO_1Y1_CHICKEN_OPTIONS[0]);
  const [combo1y1ChickenCooking, setCombo1y1ChickenCooking] = useState('crispy');

  const [platoSide, setPlatoSide] = useState(PLATO_SIDES[0]);
  const [platoSalad, setPlatoSalad] = useState(PLATO_SALADS[0]);
  const [platoChickenCooking, setPlatoChickenCooking] = useState('crispy');

  const [selectedSauces, setSelectedSauces] = useState([]);
  const [saladProteinCooking, setSaladProteinCooking] = useState('Pollo Crispy');
  const [mifafiBaseProtein, setMifafiBaseProtein] = useState('Lomito');
  const [selectedExtraProteins, setSelectedExtraProteins] = useState([]);

  const [directDrinkFlavor, setDirectDrinkFlavor] = useState('Coca Cola');
  const [itemNotes, setItemNotes] = useState('');

  // Generador dinámico de pasos según producto
  const steps = useMemo(() => {
    if (!product) return [];
    const list = [];

    if (sauceConfig) list.push('sauces');
    if (proteinCookingConfig) list.push('salad_chicken');
    if (baseProteinConfig) list.push('mifafi_protein');
    if (extraProteinsConfig) list.push('extra_proteins');

    if (isBurger) {
      list.push('burger_side');
      if (isChickenBurger) list.push('chicken_cooking');
    }

    if (isCombo) {
      if (product.id === 'cb_lomito') list.push('combo_lomito_drink');
      if (product.id === 'cb_chicken') list.push('combo_chicken_prep');
      if (product.id === 'cb_1_y_1') list.push('combo_1y1_selection');
      if (product.id === 'cb_sierra_nevada') list.push('combo_sierra_drink');
    }

    if (isPlato) {
      list.push('plato_sides');
      list.push('plato_salad');
      if (isPlatoPollo) list.push('plato_chicken');
    }

    if (isBebida) list.push('direct_drink');

    if (isBurger || isCombo || isPlato || isEntrada) {
      list.push('addons');
    }

    if (!isBebida && product.id !== 'cb_lomito' && product.id !== 'cb_chicken' && product.id !== 'cb_1_y_1' && product.id !== 'cb_sierra_nevada') {
      list.push('drinks');
    }

    list.push('notes');
    return list;
  }, [product, sauceConfig, proteinCookingConfig, baseProteinConfig, extraProteinsConfig, isBurger, isChickenBurger, isCombo, isPlato, isPlatoPollo, isBebida, isEntrada]);

  useEffect(() => {
    if (show) {
      setCurrentStepIndex(0);
      setQuantity(1);
      setBurgerSide('chips');
      setChickenCooking('crispy');
      setSelectedAddons([]);
      setSelectedDrinksList([]);
      setCurrentDrinkType('personal');
      setCurrentDrinkFlavor(DRINK_FLAVORS[0]);
      setComboDrinkFlavor('Coca Cola');
      setChicken1Cooking('crispy');
      setChicken2Cooking('crispy');
      setCombo1y1Meat(COMBO_1Y1_MEAT_OPTIONS[0]);
      setCombo1y1Chicken(COMBO_1Y1_CHICKEN_OPTIONS[0]);
      setCombo1y1ChickenCooking('crispy');
      setPlatoSide(PLATO_SIDES[0]);
      setPlatoSalad(PLATO_SALADS[0]);
      setPlatoChickenCooking('crispy');

      if (sauceConfig?.options) setSelectedSauces([]);
      if (proteinCookingConfig?.options) setSaladProteinCooking(proteinCookingConfig.options[0] || 'Pollo Crispy');
      if (baseProteinConfig?.options) setMifafiBaseProtein(baseProteinConfig.options[0] || 'Chuleta Ahumada');

      setSelectedExtraProteins([]);
      setDirectDrinkFlavor('Coca Cola');
      setItemNotes('');
    }
  }, [show, product]);

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const maxSaucesAllowed = sauceConfig?.max || 2;
  const toggleSauce = (sauce) => {
    setSelectedSauces((prev) => {
      let updated;
      if (prev.includes(sauce)) {
        updated = prev.filter((s) => s !== sauce);
      } else if (prev.length < maxSaucesAllowed) {
        updated = [...prev, sauce];
      } else {
        updated = prev;
      }

      if (updated.length === maxSaucesAllowed) {
        setTimeout(nextStep, 220);
      }
      return updated;
    });
  };

  const toggleAddon = (addonId) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId) ? prev.filter((id) => id !== addonId) : [...prev, addonId]
    );
  };

  const toggleExtraProtein = (proteinId) => {
    setSelectedExtraProteins((prev) =>
      prev.includes(proteinId) ? prev.filter((id) => id !== proteinId) : [...prev, proteinId]
    );
  };

  const handleAddDrink = () => {
    const drinkObj = CROSS_SELL_DRINKS.find((d) => d.id === currentDrinkType);
    if (!drinkObj || drinkObj.id === 'none') return;

    setSelectedDrinksList((prev) => [
      ...prev,
      {
        uid: `${drinkObj.id}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        id: drinkObj.id,
        name: drinkObj.name,
        price: drinkObj.price,
        flavor: currentDrinkFlavor
      }
    ]);
  };

  const handleRemoveDrink = (uid) => {
    setSelectedDrinksList((prev) => prev.filter((d) => d.uid !== uid));
  };

  const addonsTotal = useMemo(() => {
    return selectedAddons.reduce((sum, addonId) => {
      const addon = BURGER_ADDONS.find((a) => a.id === addonId);
      return sum + (addon ? addon.price : 0);
    }, 0);
  }, [selectedAddons]);

  const extraProteinsTotal = useMemo(() => {
    if (!extraProteinsConfig) return 0;
    return selectedExtraProteins.reduce((sum, proteinId) => {
      const p = extraProteinsConfig.find((item) => item.id === proteinId || item.name === proteinId);
      return sum + (p ? p.price : 0);
    }, 0);
  }, [selectedExtraProteins, extraProteinsConfig]);

  const drinksTotal = useMemo(() => {
    return selectedDrinksList.reduce((sum, drink) => sum + (drink.price || 0), 0);
  }, [selectedDrinksList]);

  const selectedBurgerSideObj = useMemo(() => {
    return isBurger ? (BURGER_SIDES.find((s) => s.id === burgerSide) || BURGER_SIDES[0]) : null;
  }, [isBurger, burgerSide]);

  const sidePrice = selectedBurgerSideObj?.price || 0;
  const unitPrice = (product?.price || 0) + sidePrice + addonsTotal + extraProteinsTotal + drinksTotal;
  const totalPrice = unitPrice * quantity;

  const buildCustomizationDetails = () => {
    const details = [];

    if (isBurger) {
      const sideObj = BURGER_SIDES.find((s) => s.id === burgerSide);
      if (sideObj) {
        const sideLabel = sideObj.price > 0 ? `${sideObj.name} (+$${sideObj.price.toFixed(2)})` : sideObj.name;
        details.push({ label: 'Acompañante', value: sideLabel });
      }
      if (isChickenBurger) {
        const cookObj = CHICKEN_COOKING_TYPES.find((c) => c.id === chickenCooking);
        if (cookObj) details.push({ label: 'Preparación', value: cookObj.name });
      }
    }

    if (isCombo) {
      if (product.id === 'cb_lomito') details.push({ label: 'Refresco 1L', value: comboDrinkFlavor });
      if (product.id === 'cb_chicken') {
        const c1 = CHICKEN_COOKING_TYPES.find((c) => c.id === chicken1Cooking)?.name;
        const c2 = CHICKEN_COOKING_TYPES.find((c) => c.id === chicken2Cooking)?.name;
        details.push({ label: 'Burger 1', value: c1 });
        details.push({ label: 'Burger 2', value: c2 });
        details.push({ label: 'Refresco 1L', value: comboDrinkFlavor });
      }
      if (product.id === 'cb_1_y_1') {
        const cCook = CHICKEN_COOKING_TYPES.find((c) => c.id === combo1y1ChickenCooking)?.name;
        details.push({ label: 'Burger Carne', value: combo1y1Meat });
        details.push({ label: 'Burger Pollo', value: `${combo1y1Chicken} (${cCook})` });
        details.push({ label: 'Refresco 1L', value: comboDrinkFlavor });
      }
      if (product.id === 'cb_sierra_nevada') details.push({ label: 'Refresco 1.5L', value: comboDrinkFlavor });
    }

    if (isPlato) {
      details.push({ label: 'Acompañante', value: platoSide });
      details.push({ label: 'Ensalada', value: platoSalad });
      if (isPlatoPollo) {
        const cookObj = CHICKEN_COOKING_TYPES.find((c) => c.id === platoChickenCooking);
        if (cookObj) details.push({ label: 'Tipo Pollo', value: cookObj.name });
      }
    }

    if (isEntrada) {
      if (sauceConfig && selectedSauces.length > 0) details.push({ label: 'Salsas', value: selectedSauces.join(', ') });
      if (proteinCookingConfig) details.push({ label: 'Preparación', value: saladProteinCooking });
      if (baseProteinConfig) details.push({ label: 'Proteína Base', value: mifafiBaseProtein });
      if (extraProteinsConfig && selectedExtraProteins.length > 0) {
        const extraNames = selectedExtraProteins.map((pId) => {
          const found = extraProteinsConfig.find((x) => x.id === pId || x.name === pId);
          return found ? `+${found.name} ($${found.price.toFixed(2)})` : pId;
        });
        details.push({ label: 'Proteínas Extra', value: extraNames.join(', ') });
      }
    }

    if (selectedAddons.length > 0) {
      const addonNames = selectedAddons
        .map((id) => BURGER_ADDONS.find((item) => item.id === id)?.name)
        .filter(Boolean);
      details.push({ label: 'Adicionales', value: addonNames.join(', ') });
    }

    if (isBebida) details.push({ label: 'Sabor', value: directDrinkFlavor });

    if (selectedDrinksList.length > 0) {
      const drinksSummary = selectedDrinksList.map((d) => `${d.name} (${d.flavor})`).join(', ');
      details.push({ label: 'Bebidas Extra', value: drinksSummary });
    }

    if (itemNotes.trim()) details.push({ label: 'Nota', value: itemNotes.trim() });
    return details;
  };

  const handleConfirm = () => {
    if (sauceConfig && selectedSauces.length < maxSaucesAllowed) {
      alert(`Por favor selecciona las ${maxSaucesAllowed} salsas.`);
      setCurrentStepIndex(steps.indexOf('sauces'));
      return;
    }

    const details = buildCustomizationDetails();
    const signature = JSON.stringify({ id: product.id, details, unitPrice });

    const customizedItem = {
      ...product,
      cartItemId: `${product.id}-${btoa(encodeURIComponent(signature)).slice(0, 16)}`,
      quantity,
      price: unitPrice,
      basePrice: product.price,
      customizationDetails: details,
      customizationSummary: details.map((d) => `${d.label}: ${d.value}`).join(' | ')
    };

    onAddToCart(customizedItem);
    onHide();
  };

  if (!product) return null;

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      className="cf-modal-customizer"
      backdropClassName="cf-modal-backdrop"
      contentClassName="border-0 bg-transparent"
    >
      <div
        className="d-flex flex-column position-relative text-white"
        style={{
          backgroundColor: '#14110f',
          borderRadius: '24px',
          border: '1px solid rgba(217, 119, 6, 0.35)',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)'
        }}
      >
        <button
          type="button"
          className="cf-modal-close-btn"
          onClick={onHide}
          aria-label="Cerrar"
          style={{ zIndex: 20 }}
        >
          ✕
        </button>

        {/* Encabezado fijo con foto y paso actual */}
        <div
          className="p-3 border-bottom d-flex align-items-center justify-content-between"
          style={{ backgroundColor: '#1b1613', borderColor: 'rgba(255, 255, 255, 0.08)' }}
        >
          <div className="d-flex align-items-center gap-3">
            <img
              src={product.image}
              alt={product.name}
              style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '12px' }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                if (getFallbackImage) e.currentTarget.src = getFallbackImage(product.category);
              }}
            />
            <div>
              <h5 className="m-0 fw-bold text-white fs-6">{product.name}</h5>
              <small className="text-warning">Paso {currentStepIndex + 1} de {steps.length}</small>
            </div>
          </div>
        </div>

        {/* CUERPO DEL PASO ACTUAL */}
        <div className="p-3 p-md-4 flex-grow-1" style={{ overflowY: 'auto' }}>
          {/* PASO: SALSAS */}
          {currentStep === 'sauces' && (
            <div>
              <div className="mb-3">
                <h4 className="fw-bold text-warning mb-1">🥫 Elige tus Salsas</h4>
                <p className="text-secondary small">Selecciona exactamente {maxSaucesAllowed} salsas ({selectedSauces.length}/{maxSaucesAllowed})</p>
              </div>
              <div className="row g-2">
                {sauceConfig.options.map((sauce) => {
                  const isChecked = selectedSauces.includes(sauce);
                  const isDisabled = !isChecked && selectedSauces.length >= maxSaucesAllowed;
                  return (
                    <div key={sauce} className="col-12 col-sm-6">
                      <div
                        className={`cf-addon-card cf-sauce-chip ${isChecked ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                        onClick={() => !isDisabled && toggleSauce(sauce)}
                        role="button"
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className={`cf-checkbox-square ${isChecked ? 'checked' : ''}`}>{isChecked ? '✓' : ''}</span>
                          <span className="cf-addon-icon">{getSauceIcon(sauce)}</span>
                          <span className="cf-addon-name">{sauce}</span>
                        </div>
                        <span className="cf-choice-free">Gratis</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASO: ACOMPAÑANTE HAMBURGUESA */}
          {currentStep === 'burger_side' && (
            <div>
              <div className="mb-3">
                <h4 className="fw-bold text-warning mb-1">🥔 Elige tu Acompañante</h4>
                <p className="text-secondary small">Haz clic en una opción para avanzar automáticamente</p>
              </div>
              <div className="row g-2">
                {BURGER_SIDES.map((side) => {
                  const isSelected = burgerSide === side.id;
                  const hasExtraPrice = side.price && side.price > 0;
                  return (
                    <div key={side.id} className="col-12 col-sm-6">
                      <div
                        className={`cf-choice-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          setBurgerSide(side.id);
                          setTimeout(nextStep, 200);
                        }}
                        role="button"
                      >
                        <div className="d-flex align-items-center gap-3">
                          <span className="cf-radio-circle">{isSelected && <span className="cf-radio-dot" />}</span>
                          <div>
                            <div className="cf-choice-name">{side.name}</div>
                            <div className="cf-choice-desc">{side.description}</div>
                          </div>
                        </div>
                        <span className={hasExtraPrice ? "cf-addon-price fw-bold" : "cf-choice-free"} style={{ color: hasExtraPrice ? '#f59e0b' : undefined }}>
                          {hasExtraPrice ? `+$${side.price.toFixed(2)}` : 'Gratis'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASO: COCCIÓN POLLO */}
          {(currentStep === 'chicken_cooking' || currentStep === 'salad_chicken' || currentStep === 'plato_chicken') && (
            <div>
              <div className="mb-3">
                <h4 className="fw-bold text-warning mb-1">🍗 Preparación del Pollo</h4>
                <p className="text-secondary small">Selecciona una opción para avanzar</p>
              </div>
              <div className="row g-2">
                {CHICKEN_COOKING_TYPES.map((type) => {
                  const isSelected =
                    currentStep === 'chicken_cooking' ? chickenCooking === type.id :
                    currentStep === 'salad_chicken' ? saladProteinCooking === type.name :
                    platoChickenCooking === type.id;
                  return (
                    <div key={type.id} className="col-12 col-sm-6">
                      <div
                        className={`cf-choice-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          if (currentStep === 'chicken_cooking') setChickenCooking(type.id);
                          if (currentStep === 'salad_chicken') setSaladProteinCooking(type.name);
                          if (currentStep === 'plato_chicken') setPlatoChickenCooking(type.id);
                          setTimeout(nextStep, 200);
                        }}
                        role="button"
                      >
                        <div className="d-flex align-items-center gap-3">
                          <span className="cf-radio-circle">{isSelected && <span className="cf-radio-dot" />}</span>
                          <span className="cf-choice-name">{type.name}</span>
                        </div>
                        <span className="cf-choice-free">Incluido</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASO: PROTEÍNA BASE MIFAFÍ */}
          {currentStep === 'mifafi_protein' && (
            <div>
              <div className="mb-3">
                <h4 className="fw-bold text-warning mb-1">🥩 Proteína Principal</h4>
                <p className="text-secondary small">Selecciona una opción para avanzar</p>
              </div>
              <div className="row g-2">
                {baseProteinConfig.options.map((prot) => {
                  const isSelected = mifafiBaseProtein === prot;
                  return (
                    <div key={prot} className="col-12 col-sm-4">
                      <div
                        className={`cf-choice-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          setMifafiBaseProtein(prot);
                          setTimeout(nextStep, 200);
                        }}
                        role="button"
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className="cf-radio-circle">{isSelected && <span className="cf-radio-dot" />}</span>
                          <span className="cf-choice-name">{prot}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASO: GUARNICIÓN PLATO */}
          {currentStep === 'plato_sides' && (
            <div>
              <div className="mb-3">
                <h4 className="fw-bold text-warning mb-1">🥔 Elige tu Acompañante</h4>
                <p className="text-secondary small">Selecciona una opción para avanzar</p>
              </div>
              <div className="row g-2">
                {PLATO_SIDES.map((side) => (
                  <div key={side} className="col-12 col-sm-4">
                    <div
                      className={`cf-choice-card ${platoSide === side ? 'selected' : ''}`}
                      onClick={() => {
                        setPlatoSide(side);
                        setTimeout(nextStep, 200);
                      }}
                      role="button"
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span className="cf-radio-circle">{platoSide === side && <span className="cf-radio-dot" />}</span>
                        <span className="cf-choice-name">{side}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PASO: ENSALADA PLATO */}
          {currentStep === 'plato_salad' && (
            <div>
              <div className="mb-3">
                <h4 className="fw-bold text-warning mb-1">🥗 Elige tu Ensalada</h4>
                <p className="text-secondary small">Selecciona una opción para avanzar</p>
              </div>
              <div className="row g-2">
                {PLATO_SALADS.map((salad) => (
                  <div key={salad} className="col-12 col-sm-6">
                    <div
                      className={`cf-choice-card ${platoSalad === salad ? 'selected' : ''}`}
                      onClick={() => {
                        setPlatoSalad(salad);
                        setTimeout(nextStep, 200);
                      }}
                      role="button"
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span className="cf-radio-circle">{platoSalad === salad && <span className="cf-radio-dot" />}</span>
                        <span className="cf-choice-name">{salad}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PASO: BEBIDA DIRECTA */}
          {currentStep === 'direct_drink' && (
            <div>
              <div className="mb-3">
                <h4 className="fw-bold text-warning mb-1">🥤 Sabor de tu Refresco</h4>
                <p className="text-secondary small">Selecciona una opción para avanzar</p>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {DRINK_FLAVORS.map((flavor) => (
                  <button
                    key={flavor}
                    type="button"
                    className={`cf-chip-btn ${directDrinkFlavor === flavor ? 'active' : ''}`}
                    onClick={() => {
                      setDirectDrinkFlavor(flavor);
                      setTimeout(nextStep, 200);
                    }}
                  >
                    {flavor}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PASO: COMBOS */}
          {currentStep === 'combo_lomito_drink' && (
            <div>
              <div className="mb-3">
                <h4 className="fw-bold text-warning mb-1">🥤 Sabor del Refresco 1L</h4>
                <p className="text-secondary small">Incluido en el combo</p>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {DRINK_FLAVORS.map((flavor) => (
                  <button
                    key={flavor}
                    type="button"
                    className={`cf-chip-btn ${comboDrinkFlavor === flavor ? 'active' : ''}`}
                    onClick={() => {
                      setComboDrinkFlavor(flavor);
                      setTimeout(nextStep, 200);
                    }}
                  >
                    {flavor}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'combo_sierra_drink' && (
            <div>
              <div className="mb-3">
                <h4 className="fw-bold text-warning mb-1">🥤 Sabor del Refresco 1.5L</h4>
                <p className="text-secondary small">Incluido en el combo</p>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {DRINK_FLAVORS.map((flavor) => (
                  <button
                    key={flavor}
                    type="button"
                    className={`cf-chip-btn ${comboDrinkFlavor === flavor ? 'active' : ''}`}
                    onClick={() => {
                      setComboDrinkFlavor(flavor);
                      setTimeout(nextStep, 200);
                    }}
                  >
                    {flavor}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PASO: ADICIONALES (EXTRAS) */}
          {currentStep === 'addons' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4 className="fw-bold text-warning mb-1">➕ ¿Deseas Agregar Extras?</h4>
                  <p className="text-secondary small m-0">Opcional. Si no deseas, pulsa Siguiente</p>
                </div>
                <span className="badge bg-secondary bg-opacity-25 text-warning border border-warning border-opacity-25">Opcional</span>
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
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className={`cf-checkbox-square ${isChecked ? 'checked' : ''}`}>{isChecked ? '✓' : ''}</span>
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

          {/* PASO: VENTA CRUZADA DE BEBIDAS */}
          {currentStep === 'drinks' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4 className="fw-bold text-warning mb-1">🥤 ¿Deseas Bebidas Frías?</h4>
                  <p className="text-secondary small m-0">Opcional. Puedes agregar o pulsar Siguiente</p>
                </div>
                <span className="badge bg-secondary bg-opacity-25 text-warning border border-warning border-opacity-25">Opcional</span>
              </div>

              <div className="row g-2 mb-3">
                {CROSS_SELL_DRINKS.filter((d) => d.id !== 'none').map((drink) => (
                  <div key={drink.id} className="col-6 col-sm-3">
                    <div
                      className={`cf-drink-card ${currentDrinkType === drink.id ? 'selected' : ''}`}
                      onClick={() => setCurrentDrinkType(drink.id)}
                      role="button"
                    >
                      <div className="cf-drink-icon">{drink.icon}</div>
                      <div className="cf-drink-name">{drink.name}</div>
                      <div className="cf-drink-price">+${drink.price.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-3 mb-3" style={{ backgroundColor: '#1b1613', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <label className="small text-secondary mb-2 d-block">Sabor:</label>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {DRINK_FLAVORS.map((flavor) => (
                    <button
                      key={flavor}
                      type="button"
                      className={`cf-chip-btn ${currentDrinkFlavor === flavor ? 'active' : ''}`}
                      onClick={() => setCurrentDrinkFlavor(flavor)}
                    >
                      {flavor}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn-sm w-100 py-2 fw-bold text-white"
                  style={{ backgroundColor: '#d97706', borderRadius: '10px', border: 'none' }}
                  onClick={handleAddDrink}
                >
                  + Añadir {CROSS_SELL_DRINKS.find(d => d.id === currentDrinkType)?.name} ({currentDrinkFlavor})
                </button>
              </div>

              {selectedDrinksList.length > 0 && (
                <div className="d-flex flex-column gap-2 mb-2">
                  {selectedDrinksList.map((item) => (
                    <div
                      key={item.uid}
                      className="d-flex justify-content-between align-items-center p-2 px-3 rounded-3"
                      style={{ backgroundColor: '#211a15', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                    >
                      <div className="small">
                        <span className="text-white fw-bold">🥤 {item.name}</span>
                        <span className="text-secondary ms-2">({item.flavor})</span>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <span className="text-warning fw-bold small">+${item.price.toFixed(2)}</span>
                        <button
                          type="button"
                          className="btn p-0 border-0 text-secondary"
                          onClick={() => handleRemoveDrink(item.uid)}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PASO: NOTAS */}
          {currentStep === 'notes' && (
            <div>
              <div className="mb-3">
                <h4 className="fw-bold text-warning mb-1">📝 Notas para la Cocina</h4>
                <p className="text-secondary small">¿Alguna indicación especial o ingrediente que prefieras omitir?</p>
              </div>
              <textarea
                className="form-control bg-dark text-white border-secondary"
                rows={3}
                placeholder="Ej. Sin cebolla, salsas aparte, carne bien cocida..."
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
                maxLength={120}
              />
            </div>
          )}
        </div>

        {/* PIE DE NAVEGACIÓN Y AGREGAR (MÓVIL OPTIMIZADO) */}
        <div
          className="p-3 border-top"
          style={{ backgroundColor: '#120f0d', borderColor: 'rgba(255, 255, 255, 0.08)', zIndex: 15 }}
        >
          {/* Fila 1: Controles secundarios (Atrás y Cantidad) */}
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div>
              {currentStepIndex > 0 ? (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary px-3 py-1 rounded-pill fw-bold text-light"
                  onClick={prevStep}
                  style={{ fontSize: '0.8rem' }}
                >
                  ← Paso anterior
                </button>
              ) : (
                <span className="small text-secondary" style={{ fontSize: '0.75rem' }}>Personaliza tu orden</span>
              )}
            </div>

            {/* Stepper de cantidad */}
            <div
              className="d-flex align-items-center rounded-pill px-2 py-1"
              style={{ backgroundColor: '#1f1a16', border: '1px solid rgba(255, 255, 255, 0.12)' }}
            >
              <button
                type="button"
                className="btn btn-sm text-white fw-bold px-2 py-0 border-0"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                style={{ fontSize: '1rem', lineHeight: 1 }}
              >
                −
              </button>
              <span className="fw-bold px-2 text-warning" style={{ fontSize: '0.9rem' }}>
                {quantity}
              </span>
              <button
                type="button"
                className="btn btn-sm text-white fw-bold px-2 py-0 border-0"
                onClick={() => setQuantity((q) => q + 1)}
                style={{ fontSize: '1rem', lineHeight: 1 }}
              >
                +
              </button>
            </div>
          </div>

          {/* Fila 2: Botón principal de ancho completo */}
          <div>
            {!isLastStep ? (
              <button
                type="button"
                className="btn w-100 py-3 fw-bold text-white d-flex align-items-center justify-content-between px-3"
                style={{
                  backgroundColor: '#d97706',
                  borderRadius: '14px',
                  border: 'none',
                  boxShadow: '0 4px 15px rgba(217, 119, 6, 0.4)',
                  fontSize: '0.95rem'
                }}
                onClick={nextStep}
              >
                <span>Siguiente Paso →</span>
                <span className="badge bg-black bg-opacity-30 px-2 py-1 fs-6">
                  ${totalPrice.toFixed(2)}
                </span>
              </button>
            ) : (
              <button
                type="button"
                className="btn w-100 py-3 fw-bold text-dark d-flex align-items-center justify-content-between px-3"
                style={{
                  backgroundColor: '#22c55e',
                  borderRadius: '14px',
                  border: 'none',
                  boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
                  fontSize: '0.95rem'
                }}
                onClick={handleConfirm}
              >
                <span>🚀 Agregar a la Mochila</span>
                <span className="badge bg-black bg-opacity-25 text-white px-2 py-1 fs-6">
                  ${totalPrice.toFixed(2)}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}