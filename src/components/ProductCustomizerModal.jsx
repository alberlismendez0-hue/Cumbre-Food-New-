import { useState, useEffect, useMemo, useRef } from 'react';
import { Modal } from 'react-bootstrap';

import {
  BURGER_SIDES,
  CHICKEN_COOKING_TYPES,
  BURGER_ADDONS,
  CROSS_SELL_DRINKS,
  DRINK_FLAVORS,
  COMBO_1Y1_ALL_OPTIONS,
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
  const isPicoEspejo = product?.id === 'h_pico_espejo' || product?.isPicoEspejo;
  const isCompetenciaBurger = product?.id === 'h_bonpland_competencia' || product?.isCompetenciaBurger;
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
  const flavorSectionRef = useRef(null);


  // Estados de opciones
  const [quantity, setQuantity] = useState(1);
  const [burgerSide, setBurgerSide] = useState('chips');
  const [espejoMeatCount, setEspejoMeatCount] = useState(1); // 1, 2 o 3
  const [competenciaMode, setCompetenciaMode] = useState('sola'); // 'sola' ($6,99) o 'combo' ($10)
  const [competenciaDrinkFlavor, setCompetenciaDrinkFlavor] = useState(DRINK_FLAVORS[0]);
  const [chickenCooking, setChickenCooking] = useState('crispy');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedDrinksList, setSelectedDrinksList] = useState([]);
  const [currentDrinkType, setCurrentDrinkType] = useState('personal');
  const [currentDrinkFlavor, setCurrentDrinkFlavor] = useState(DRINK_FLAVORS[0]);

  const [comboDrinkFlavor, setComboDrinkFlavor] = useState('Coca Cola');
  const [chicken1Burger, setChicken1Burger] = useState(COMBO_1Y1_CHICKEN_OPTIONS[0]);
  const [chicken2Burger, setChicken2Burger] = useState(COMBO_1Y1_CHICKEN_OPTIONS[0]);
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

  const handleSelectDrinkType = (drinkId) => {
  setCurrentDrinkType(drinkId);

  // Si no es agua mineral, hace scroll automático suave hacia los sabores
  if (drinkId !== 'agua') {
    setTimeout(() => {
      flavorSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 120);
  }
};

  // Generador dinámico de pasos según producto
  const steps = useMemo(() => {
    if (!product) return [];
    const list = [];

    if (sauceConfig) list.push('sauces');
    if (proteinCookingConfig) list.push('salad_chicken');
    if (baseProteinConfig) list.push('mifafi_protein');
    if (extraProteinsConfig) list.push('extra_proteins');

    if (isBurger) {
      if (isCompetenciaBurger) {
        list.push('competencia_mode');
      }
      if (isPicoEspejo) {
        list.push('espejo_meats');
      }
      // Si es competencia sola ($6.00), no pide papas; si es en combo ($10.00) o cualquier otra burger, sí va
      if (!isCompetenciaBurger || competenciaMode === 'combo') {
        list.push('burger_side');
      }
      if (isChickenBurger) list.push('chicken_cooking');
      if (isCompetenciaBurger && competenciaMode === 'combo') {
        list.push('competencia_drink');
      }
    }

    if (isCombo) {
      if (product.id === 'cb_lomito') list.push('combo_lomito_drink');
      if (product.id === 'cb_chicken') {
        list.push('combo_chicken_prep');
        list.push('combo_chicken_drink');
      }
      if (product.id === 'cb_1_y_1') {
        list.push('combo_1y1_selection');
        list.push('combo_1y1_drink');
      }
      if (product.id === 'cb_sierra_nevada') list.push('combo_sierra_drink');
    }

    if (isPlato) {
      list.push('plato_sides');
      list.push('plato_salad');
      if (isPlatoPollo) list.push('plato_chicken');
    }

    if (isBebida) list.push('direct_drink');

    if (isBurger || isPlato || isEntrada) {
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
      setEspejoMeatCount(1);
      setCompetenciaMode('sola');
      setCompetenciaDrinkFlavor(DRINK_FLAVORS[0]);
      if (isPicoEspejo) {
        setBurgerSide('francesas');
      } else {
        setBurgerSide('chips');
      }
      setChickenCooking('crispy');
      setSelectedAddons([]);
      setSelectedDrinksList([]);
      setCurrentDrinkType('personal');
      setCurrentDrinkFlavor(DRINK_FLAVORS[0]);
      setComboDrinkFlavor('Coca Cola');
      setChicken1Burger(COMBO_1Y1_CHICKEN_OPTIONS[0]);
      setChicken2Burger(COMBO_1Y1_CHICKEN_OPTIONS[0]);
      setChicken1Cooking('crispy');
      setChicken2Cooking('crispy');
      setCombo1y1Meat(COMBO_1Y1_ALL_OPTIONS[0]);
      setCombo1y1Chicken(COMBO_1Y1_ALL_OPTIONS[1]);
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

 const handleAddDrinkDirectly = (drinkTypeId, flavorName = null) => {
    const drinkObj = CROSS_SELL_DRINKS.find((d) => d.id === drinkTypeId);
    if (!drinkObj || drinkObj.id === 'none') return;

    const isWater = drinkObj.id === 'agua';

    setSelectedDrinksList((prev) => [
      ...prev,
      {
        uid: `${drinkObj.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        id: drinkObj.id,
        name: drinkObj.name,
        price: drinkObj.price,
        flavor: isWater ? null : flavorName
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

 // Extra de competencia: Sola = $0 (total $6), Combo = +$4.00 (total $10)
  const competenciaExtra = (isCompetenciaBurger && competenciaMode === 'combo') ? 4.0 : 0;

  // Extra de carnes para Pico Espejo
  const espejoExtra = isPicoEspejo ? (espejoMeatCount === 2 ? 1.5 : espejoMeatCount === 3 ? 3.0 : 0) : 0;

  // Papas gratis en Pico Espejo o en el Combo de Competencia ($10)
  const isFreeFrenchFries = isPicoEspejo || (isCompetenciaBurger && competenciaMode === 'combo');
  const sidePrice = isFreeFrenchFries ? 0 : (selectedBurgerSideObj?.price || 0);

  const unitPrice = (product?.price || 0) + competenciaExtra + espejoExtra + sidePrice + addonsTotal + extraProteinsTotal + drinksTotal;
  const totalPrice = unitPrice * quantity;

  const buildCustomizationDetails = () => {
    const details = [];

    if (isBurger) {
      if (isCompetenciaBurger) {
        details.push({
          label: 'Modalidad',
          value: competenciaMode === 'combo' ? 'Combo Competencia ($10.00)' : 'Solo Burger ($6.00)'
        });
        if (competenciaMode === 'combo') {
          details.push({ label: 'Acompañante', value: 'Papas Francesas (Incluidas en Combo)' });
          details.push({ label: 'Refresco Combo', value: competenciaDrinkFlavor });
        } else {
          details.push({ label: 'Acompañante', value: 'Sin papas (Solo Burger)' });
        }
      } else if (isPicoEspejo) {
        const meatLabels = { 1: '1 Carne (Sencilla)', 2: '2 Carnes (Doble)', 3: '3 Carnes (Triple)' };
        details.push({ label: 'Cantidad de Carnes', value: meatLabels[espejoMeatCount] || '1 Carne' });
        details.push({ label: 'Acompañante', value: 'Papas Francesas (Gratis)' });
      } else {
        const sideObj = BURGER_SIDES.find((s) => s.id === burgerSide);
        if (sideObj) {
          const sideLabel = sideObj.price > 0 ? `${sideObj.name} (+$${sideObj.price.toFixed(2)})` : sideObj.name;
          details.push({ label: 'Acompañante', value: sideLabel });
        }
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
        details.push({ label: 'Burger 1', value: `${chicken1Burger} (${c1})` });
        details.push({ label: 'Burger 2', value: `${chicken2Burger} (${c2})` });
        details.push({ label: 'Refresco 1L', value: comboDrinkFlavor });
      }
      if (product.id === 'cb_1_y_1') {
        const cCook = CHICKEN_COOKING_TYPES.find((c) => c.id === combo1y1ChickenCooking)?.name;
        const hasChicken = combo1y1Meat.includes('(Pollo)') || combo1y1Meat.includes('Sanguchito') ||
                          combo1y1Chicken.includes('(Pollo)') || combo1y1Chicken.includes('Sanguchito');

        details.push({ label: 'Burger 1', value: combo1y1Meat });
        details.push({ label: 'Burger 2', value: combo1y1Chicken });
        if (hasChicken && cCook) {
          details.push({ label: 'Cocción Pollo', value: cCook });
        }
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
         {/* PASO: MODALIDAD COMPETENCIA */}
          {currentStep === 'competencia_mode' && (
            <div>
              <div className="mb-3">
                <span className="badge bg-warning text-dark fw-bold px-3 py-1 mb-2">🏆 EDICIÓN COMPETENCIA</span>
                <h4 className="fw-bold text-warning mb-1">Elige tu Presentación</h4>
                <p className="text-secondary small">Selecciona cómo deseas disfrutar tu Pico Bonpland participante</p>
              </div>
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <div
                    className={`cf-choice-card p-3 ${competenciaMode === 'sola' ? 'selected' : ''}`}
                    onClick={() => {
                      setCompetenciaMode('sola');
                      setTimeout(nextStep, 200);
                    }}
                    role="button"
                  >
                    <div className="d-flex align-items-center gap-3">
                      <span className="cf-radio-circle">{competenciaMode === 'sola' && <span className="cf-radio-dot" />}</span>
                      <div>
                        <div className="cf-choice-name fs-6">🍔 Solo la Burger</div>
                        <div className="cf-choice-desc">Hamburguesa sola (sin papas ni bebida)</div>
                      </div>
                    </div>
                    <span className="fw-bold fs-6 text-warning">$6.00</span>
                  </div>
                </div>

                <div className="col-12 col-sm-6">
                  <div
                    className={`cf-choice-card p-3 ${competenciaMode === 'combo' ? 'selected' : ''}`}
                    onClick={() => {
                      setCompetenciaMode('combo');
                      setBurgerSide('francesas');
                      setTimeout(nextStep, 200);
                    }}
                    role="button"
                  >
                    <div className="d-flex align-items-center gap-3">
                      <span className="cf-radio-circle">{competenciaMode === 'combo' && <span className="cf-radio-dot" />}</span>
                      <div>
                        <div className="cf-choice-name fs-6">🥤🍟 En Combo</div>
                        <div className="cf-choice-desc">Burger + Papas Francesas + Refresco</div>
                      </div>
                    </div>
                    <span className="fw-bold fs-6 text-warning">$10.00</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO: SABOR DE REFRESCO COMBO COMPETENCIA */}
          {currentStep === 'competencia_drink' && (
            <div>
              <div className="mb-3">
                <h4 className="fw-bold text-warning mb-1">🥤 Sabor de tu Refresco</h4>
                <p className="text-secondary small">Incluido en el combo de competencia</p>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {DRINK_FLAVORS.map((flavor) => (
                  <button
                    key={flavor}
                    type="button"
                    className={`cf-chip-btn ${competenciaDrinkFlavor === flavor ? 'active' : ''}`}
                    onClick={() => {
                      setCompetenciaDrinkFlavor(flavor);
                      setTimeout(nextStep, 200);
                    }}
                  >
                    {flavor}
                  </button>
                ))}
              </div>
            </div>
          )}
         {/* PASO: CANTIDAD DE CARNES PICO ESPEJO */}
          {currentStep === 'espejo_meats' && (
            <div>
              <div className="mb-3">
                <h4 className="fw-bold text-warning mb-1">🥩 Cantidad de Carnes</h4>
                <p className="text-secondary small">Selecciona la cantidad de carnes para tu Pico Espejo</p>
              </div>
              <div className="row g-2">
                {[
                  { count: 1, label: '1 Carne (Sencilla)', price: '$8.00', extra: 'Incluido' },
                  { count: 2, label: '2 Carnes (Doble)', price: '$9.50', extra: '+$1.50' },
                  { count: 3, label: '3 Carnes (Triple)', price: '$11.00', extra: '+$3.00' }
                ].map((opt) => {
                  const isSelected = espejoMeatCount === opt.count;
                  return (
                    <div key={opt.count} className="col-12 col-sm-4">
                      <div
                        className={`cf-choice-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          setEspejoMeatCount(opt.count);
                          setTimeout(nextStep, 200);
                        }}
                        role="button"
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className="cf-radio-circle">
                            {isSelected && <span className="cf-radio-dot" />}
                          </span>
                          <div>
                            <div className="cf-choice-name">{opt.label}</div>
                            <div className="text-warning fw-bold small">{opt.price}</div>
                          </div>
                        </div>
                        <span className="cf-choice-free" style={{ color: opt.count > 1 ? '#f59e0b' : undefined }}>
                          {opt.extra}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {currentStep === 'burger_side' && (() => {
            if (isPicoEspejo || (isCompetenciaBurger && competenciaMode === 'combo')) {
              return (
                <div>
                  <div className="mb-3">
                    <h4 className="fw-bold text-warning mb-1">🍟 Elige tu Acompañante</h4>
                    <p className="text-secondary small">Este producto ya incluye su acompañante sin costo extra</p>
                  </div>
                  <div className="row g-2">
                    <div className="col-12">
                      <div className="cf-choice-card selected" style={{ cursor: 'default' }}>
                        <div className="d-flex align-items-center gap-3">
                          <span className="cf-radio-circle">
                            <span className="cf-radio-dot" />
                          </span>

                          <div className="d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🍟</span>
                          </div>

                          <div>
                            <div className="cf-choice-name">Papas Francesas</div>
                            <div className="cf-choice-desc">Doradas y al punto de sal</div>
                          </div>
                        </div>

                        <span className="cf-choice-free">Gratis</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            // Detecta si la hamburguesa actual es Toro o Bolívar
            const isToroOrBolivar = 
              product?.id === 'h_toro' || 
              product?.id === 'h_bolivar' ||
              product?.name?.toLowerCase().includes('toro') ||
              product?.name?.toLowerCase().includes('bolívar') ||
              product?.name?.toLowerCase().includes('bolivar');

            // Filtra: si no es Toro ni Bolívar, oculta las yuquitas
            const availableBurgerSides = BURGER_SIDES.filter(side => {
              if (side.id === 'yuquitas') return isToroOrBolivar;
              return true;
            });

            return (
              <div>
                <div className="mb-3">
                  <h4 className="fw-bold text-warning mb-1">🥔 Elige tu Acompañante</h4>
                  <p className="text-secondary small">Haz clic en una opción para avanzar automáticamente</p>
                </div>
                <div className="row g-2">
                  {availableBurgerSides.map((side) => {
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
                            
                            {/* ÍCONO / IMAGEN */}
                            {side.icon && (
                              <div className="d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                                {side.icon.startsWith('/') || side.icon.endsWith('.png') || side.icon.endsWith('.svg') ? (
                                  <img
                                    src={side.icon}
                                    alt={side.name}
                                    style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                                  />
                                ) : (
                                  <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{side.icon}</span>
                                )}
                              </div>
                            )}

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
            );
          })()}

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
          {/* PASO: PROTEÍNAS EXTRA (MIFAFÍ Y LA CULATA) */}
          {currentStep === 'extra_proteins' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h4 className="fw-bold text-warning mb-1">🍗 ¿Deseas Proteína Extra?</h4>
                  <p className="text-secondary small m-0">Opcional. Si no deseas, pulsa Siguiente</p>
                </div>
                <span className="badge bg-secondary bg-opacity-25 text-warning border border-warning border-opacity-25">Opcional</span>
              </div>
              <div className="row g-2">
                {extraProteinsConfig?.map((item) => {
                  const isChecked = selectedExtraProteins.includes(item.id);
                  return (
                    <div key={item.id} className="col-12 col-sm-6">
                      <div
                        className={`cf-addon-card ${isChecked ? 'selected' : ''}`}
                        onClick={() => toggleExtraProtein(item.id)}
                        role="button"
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className={`cf-checkbox-square ${isChecked ? 'checked' : ''}`}>
                            {isChecked ? '✓' : ''}
                          </span>
                          <span className="cf-addon-icon">{item.icon}</span>
                          <span className="cf-addon-name">{item.name}</span>
                        </div>
                        <span className="cf-addon-price">+${item.price.toFixed(2)}</span>
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
                {PLATO_SIDES.map((side) => {
                  // Soporta tanto si platoSide guarda el objeto completo, el id o el nombre
                  const isSelected = platoSide === side.id || platoSide === side.name;

                  return (
                    <div key={side.id || side} className="col-12 col-sm-4">
                      <div
                        className={`cf-choice-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          setPlatoSide(side.name); // Guarda el nombre limpio para el pedido
                          setTimeout(nextStep, 200);
                        }}
                        role="button"
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className="cf-radio-circle">{isSelected && <span className="cf-radio-dot" />}</span>

                          {/* Renderizado de ícono (PNG o Emoji) */}
                          {side.icon && (
                            <div className="d-flex align-items-center justify-content-center" style={{ width: '22px', height: '22px', flexShrink: 0 }}>
                              {side.icon.startsWith('/') || side.icon.endsWith('.png') || side.icon.endsWith('.svg') ? (
                                <img
                                  src={side.icon}
                                  alt={side.name}
                                  style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                                />
                              ) : (
                                <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{side.icon}</span>
                              )}
                            </div>
                          )}

                          <span className="cf-choice-name">{side.name}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
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

          {/* PASOS DE COMBOS */}
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

          {/* PASO 1: SELECCIÓN COMBO 1 Y 1 */}
          {currentStep === 'combo_1y1_selection' && (
            <div>
              <div className="mb-3">
                <h4 className="fw-bold text-warning mb-1">🍔 Elige tus Hamburguesas</h4>
                <p className="text-secondary small">
                  Escoge tus 2 burgers favoritas a tu gusto (Carne o Pollo)
                </p>
              </div>

              {/* 1. Primera Burger */}
              <div className="mb-3">
                <label className="fw-bold text-light small mb-2 d-block">
                  1. Primera Burger (Carne o Pollo):
                </label>
                <div className="row g-2">
                  {COMBO_1Y1_ALL_OPTIONS.map((burger) => (
                    <div key={`b1-${burger}`} className="col-12 col-sm-6">
                      <div
                        className={`cf-choice-card ${combo1y1Meat === burger ? 'selected' : ''}`}
                        onClick={() => setCombo1y1Meat(burger)}
                        role="button"
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className="cf-radio-circle">
                            {combo1y1Meat === burger && <span className="cf-radio-dot" />}
                          </span>
                          <span className="cf-choice-name">{burger}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Segunda Burger */}
              <div className="mb-3">
                <label className="fw-bold text-light small mb-2 d-block">
                  2. Segunda Burger (Carne o Pollo):
                </label>
                <div className="row g-2">
                  {COMBO_1Y1_ALL_OPTIONS.map((burger) => (
                    <div key={`b2-${burger}`} className="col-12 col-sm-6">
                      <div
                        className={`cf-choice-card ${combo1y1Chicken === burger ? 'selected' : ''}`}
                        onClick={() => setCombo1y1Chicken(burger)}
                        role="button"
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className="cf-radio-circle">
                            {combo1y1Chicken === burger && <span className="cf-radio-dot" />}
                          </span>
                          <span className="cf-choice-name">{burger}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Cocción del Pollo (Aparece únicamente si al menos una burger seleccionada es de pollo) */}
              {(combo1y1Meat?.includes('(Pollo)') ||
                combo1y1Meat?.includes('Sanguchito') ||
                combo1y1Chicken?.includes('(Pollo)') ||
                combo1y1Chicken?.includes('Sanguchito')) && (
                <div>
                  <label className="fw-bold text-light small mb-2 d-block">
                    3. Cocción del Pollo:
                  </label>
                  <div className="row g-2">
                    {CHICKEN_COOKING_TYPES.map((type) => (
                      <div key={type.id} className="col-6">
                        <div
                          className={`cf-choice-card ${combo1y1ChickenCooking === type.id ? 'selected' : ''}`}
                          onClick={() => setCombo1y1ChickenCooking(type.id)}
                          role="button"
                        >
                          <div className="d-flex align-items-center gap-2">
                            <span className="cf-radio-circle">
                              {combo1y1ChickenCooking === type.id && (
                                <span className="cf-radio-dot" />
                              )}
                            </span>
                            <span className="cf-choice-name">{type.name}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PASO 2: REFRESCO COMBO 1 Y 1 */}
          {currentStep === 'combo_1y1_drink' && (
            <div>
              <div className="mb-3">
                <h4 className="fw-bold text-warning mb-1">🥤 Sabor del Refresco 1 Ltr</h4>
                <p className="text-secondary small">Selecciona una opción para avanzar</p>
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

          {/* PASO 1: PREPARACIÓN COMBO CHICKEN */}
          {currentStep === 'combo_chicken_prep' && (
            <div>
              <div className="mb-3">
                <h4 className="fw-bold text-warning mb-1">🍗 Personaliza tus 2 Burgers de Pollo</h4>
                <p className="text-secondary small">Selecciona el tipo de burger y la cocción para cada una</p>
              </div>

              {/* PRIMERA BURGER */}
              <div className="p-3 mb-3 rounded-3" style={{ backgroundColor: '#1b1613', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <label className="fw-bold text-warning small mb-2 d-block">1. Primera Burger de Pollo:</label>
                
                {/* Selección del tipo de hamburguesa */}
                <div className="row g-2 mb-3">
                  {COMBO_1Y1_CHICKEN_OPTIONS.map((chk) => (
                    <div key={`c1-burger-${chk}`} className="col-12 col-sm-6">
                      <div
                        className={`cf-choice-card ${chicken1Burger === chk ? 'selected' : ''}`}
                        onClick={() => setChicken1Burger(chk)}
                        role="button"
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className="cf-radio-circle">{chicken1Burger === chk && <span className="cf-radio-dot" />}</span>
                          <span className="cf-choice-name">{chk}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cocción */}
                <label className="small text-secondary mb-2 d-block">Cocción:</label>
                <div className="row g-2">
                  {CHICKEN_COOKING_TYPES.map((type) => (
                    <div key={`c1-cook-${type.id}`} className="col-6">
                      <div
                        className={`cf-choice-card ${chicken1Cooking === type.id ? 'selected' : ''}`}
                        onClick={() => setChicken1Cooking(type.id)}
                        role="button"
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className="cf-radio-circle">{chicken1Cooking === type.id && <span className="cf-radio-dot" />}</span>
                          <span className="cf-choice-name">{type.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SEGUNDA BURGER */}
              <div className="p-3 rounded-3" style={{ backgroundColor: '#1b1613', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <label className="fw-bold text-warning small mb-2 d-block">2. Segunda Burger de Pollo:</label>
                
                {/* Selección del tipo de hamburguesa */}
                <div className="row g-2 mb-3">
                  {COMBO_1Y1_CHICKEN_OPTIONS.map((chk) => (
                    <div key={`c2-burger-${chk}`} className="col-12 col-sm-6">
                      <div
                        className={`cf-choice-card ${chicken2Burger === chk ? 'selected' : ''}`}
                        onClick={() => setChicken2Burger(chk)}
                        role="button"
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className="cf-radio-circle">{chicken2Burger === chk && <span className="cf-radio-dot" />}</span>
                          <span className="cf-choice-name">{chk}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cocción */}
                <label className="small text-secondary mb-2 d-block">Cocción:</label>
                <div className="row g-2">
                  {CHICKEN_COOKING_TYPES.map((type) => (
                    <div key={`c2-cook-${type.id}`} className="col-6">
                      <div
                        className={`cf-choice-card ${chicken2Cooking === type.id ? 'selected' : ''}`}
                        onClick={() => setChicken2Cooking(type.id)}
                        role="button"
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className="cf-radio-circle">{chicken2Cooking === type.id && <span className="cf-radio-dot" />}</span>
                          <span className="cf-choice-name">{type.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: REFRESCO COMBO CHICKEN */}
          {currentStep === 'combo_chicken_drink' && (
            <div>
              <div className="mb-3">
                <h4 className="fw-bold text-warning mb-1">🥤 Sabor del Refresco 1 Ltr</h4>
                <p className="text-secondary small">Selecciona una opción para avanzar</p>
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

             {/* GRILLA DE TARJETAS DE BEBIDAS RESPONSIVA */}
              <div 
                className="d-grid gap-2 mb-3" 
                style={{ 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))' 
                }}
              >
                {CROSS_SELL_DRINKS.filter(d => d.id !== 'none').map((drink) => {
                  const isSelected = currentDrinkType === drink.id;
                  return (
                    <div
                      key={drink.id}
                      onClick={() => handleSelectDrinkType(drink.id)}
                      role="button"
                      className="p-2 rounded-3 text-center d-flex flex-column align-items-center justify-content-center"
                      style={{
                        backgroundColor: isSelected ? 'rgba(217, 119, 6, 0.15)' : '#1b1613',
                        border: isSelected ? '2px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: 'pointer',
                        minHeight: '85px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* ÍCONO O IMAGEN */}
                      <div className="mb-1 d-flex align-items-center justify-content-center" style={{ height: '28px' }}>
                        {drink.icon && (drink.icon.startsWith('/') || drink.icon.endsWith('.png') || drink.icon.endsWith('.svg')) ? (
                          <img
                            src={drink.icon}
                            alt={drink.name}
                            style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                          />
                        ) : (
                          <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{drink.icon}</span>
                        )}
                      </div>

                      {/* NOMBRE */}
                      <div className="text-white fw-bold" style={{ fontSize: '0.72rem', lineHeight: 1.15 }}>
                        {drink.name}
                      </div>

                      {/* PRECIO */}
                      <div className="text-warning fw-bold mt-1" style={{ fontSize: '0.75rem' }}>
                        +${drink.price.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>

             {/* SELECTOR DE SABOR DIRECTO (SIN BOTÓN MANUAL) */}
              <div 
                ref={flavorSectionRef} 
                className="p-3 rounded-3 mb-3" 
                style={{ 
                  backgroundColor: '#1b1613', 
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  scrollMarginTop: '16px' 
                }}
              >
                {currentDrinkType !== 'agua' ? (
                  <>
                    <label className="small text-secondary mb-2 d-block">
                      Toca un sabor para añadirlo:
                    </label>
                    <div className="d-flex flex-wrap gap-2">
                      {DRINK_FLAVORS.map((flavor) => (
                        <button
                          key={flavor}
                          type="button"
                          className="cf-chip-btn"
                          onClick={() => {
                            setCurrentDrinkFlavor(flavor);
                            // Ejecutamos la adición directa
                            const drinkData = CROSS_SELL_DRINKS.find(d => d.id === currentDrinkType);
                            if (drinkData) {
                              setSelectedDrinksList((prev) => [
                                ...prev,
                                {
                                  uid: `${drinkData.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                                  id: drinkData.id,
                                  name: drinkData.name,
                                  price: drinkData.price,
                                  flavor: flavor
                                }
                              ]);
                            }
                          }}
                        >
                          + {flavor}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  /* Vista para Agua Mineral directa */
                  <div className="text-center">
                    <button
                      type="button"
                      className="cf-chip-btn px-4 py-2 text-warning fw-bold"
                      onClick={() => {
                        const drinkData = CROSS_SELL_DRINKS.find(d => d.id === 'agua');
                        if (drinkData) {
                          setSelectedDrinksList((prev) => [
                            ...prev,
                            {
                              uid: `agua-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                              id: 'agua',
                              name: drinkData.name,
                              price: drinkData.price,
                              flavor: null
                            }
                          ]);
                        }
                      }}
                    >
                      💧 + Añadir Agua Mineral (${CROSS_SELL_DRINKS.find(d => d.id === 'agua')?.price.toFixed(2)})
                    </button>
                  </div>
                )}
              </div>

              {/* LISTA DE BEBIDAS AGREGADAS CON PAPELERA */}
              {selectedDrinksList.length > 0 && (
                <div className="d-flex flex-column gap-2 mb-2">
                  <span className="small text-secondary fw-semibold">Bebidas añadidas:</span>
                  {selectedDrinksList.map((item) => (
                    <div
                      key={item.uid}
                      className="d-flex justify-content-between align-items-center p-2 px-3 rounded-3"
                      style={{ backgroundColor: '#211a15', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                    >
                      <div className="small">
                        <span className="text-white fw-bold">
                          {item.id === 'agua' ? '💧' : '🥤'} {item.name}
                        </span>
                        {item.flavor && (
                          <span className="text-secondary ms-2">({item.flavor})</span>
                        )}
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <span className="text-warning fw-bold small">+${item.price.toFixed(2)}</span>
                        <button
                          type="button"
                          className="btn p-0 border-0 text-secondary"
                          onClick={() => handleRemoveDrink(item.uid)}
                          title="Eliminar"
                          style={{ cursor: 'pointer' }}
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
                <span> Agregar a la Mochila</span>
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