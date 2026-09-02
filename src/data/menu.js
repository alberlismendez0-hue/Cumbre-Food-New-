export const categories = [
  { id: 'all', name: '🍽️ Todo', rawName: 'Todo', icon: '🍽️' },
  { id: 'entradas', name: '🍟 Entradas', rawName: 'Entradas', icon: '🍟' },
  { id: 'hamburguesas_carne', name: '🍔 Burgers Carne', rawName: 'Burgers Carne', icon: '🍔' },
  { id: 'hamburguesas_pollo', name: '🍗 Burgers Pollo', rawName: 'Burgers Pollo', icon: '🍗' },
  { id: 'hamburguesas_chuleta', name: '🥩 Burgers Chuleta', rawName: 'Burgers Chuleta', icon: '🥩' },
  { id: 'platos', name: '🥘 Platos', rawName: 'Platos', icon: '🥘' },
  { id: 'combos', name: '🔥 Combos', rawName: 'Combos', icon: '🔥' },
  { id: 'bebidas', name: '🥤 Bebidas', rawName: 'Bebidas', icon: '🥤' },
  { id: 'adicionales', name: '➕ Adicionales', rawName: 'Adicionales', icon: '➕' }
];

export const paymentMethods = [
  'Pago Móvil',
  'Efectivo USD / Bs',
  'Zelle',
  'Zinli',
  'Binance',
  'Transferencia Bancaria'
];

export const deliveryZones = [
  {
    id: 'pickup',
    name: 'Pick Up (Feria C.C. Plaza Mayor)',
    price: 0,
    description: 'Retiro en tienda sin costo adicional'
  },
  {
    id: 'zona_1',
    name: 'Zona $1.00',
    price: 1.0,
    description: 'Res. Rosa E, Las Marías 1 y 2, El Viaducto, El Campito, El Llanito, Hula, Sor Juana Inés, Cardenal Quintero.'
  },
  {
    id: 'zona_1_5',
    name: 'Zona $1.50',
    price: 1.5,
    description: 'C.C. Alto Prado, El Rodeo, Mons. Chacón, Los Bucares, Los Samanes, Parque Las Américas, Plaza de Toros, Centro, Belén, Glorias Patrias, Santa Elena, Campo de Oro, Av. 16, Av. Urdaneta, Gonzalo Picón, Paseo La Feria.'
  },
  {
    id: 'zona_2',
    name: 'Zona $2.00',
    price: 2.0,
    description: 'Santa Ana, La Hechicera, Campo Neblina, La Milagrosa, Santa Anita, Hoyada de Milla, Ocre, Santa Juana, Pie del Llano, Las Delias, Humboldt, Santa Bárbara, Pie de Monte, Buganvillas, C.C. Plaza Los Próceres, Pedro Rincón, La Pradera, El Caucho (Baja), El Rincón (Baja).'
  },
  {
    id: 'zona_2_5',
    name: 'Zona $2.50',
    price: 2.5,
    description: 'Lumonty, Urb. Mocotíes, Chorros de Milla, Belenzate, Las Tapias, La Sabana, Carrizal A y B, Pedregosa Baja (Hotel La Pedregosa, Materiales Los Andes, Gran Parada), Res. Sai Sai.'
  },
  {
    id: 'zona_3',
    name: 'Zona $3.00',
    price: 3.0,
    description: 'Pedregosa Media (Hotel Villa Ricardo - 2da Capilla), El Pedregal, Terrazas La Pedregosa, San Isidro, Los Cortijos, El Castor, Las Ardillas, Los Laureles, Casas del Campo, San Rafael, 1ra Capilla, Manuelita Sáenz, La Mata, Los Curos (Baja y Media), La Parroquia.'
  },
  {
    id: 'zona_3_5',
    name: 'Zona $3.50',
    price: 3.5,
    description: 'Zona Ind. Los Curos, Campo Claro, La Mara, Zumba, Pedregosa Alta (después 2da capilla), Los Curos Alta, El Chama (hasta Santa Catalina).'
  },
  {
    id: 'zona_4',
    name: 'Zona $4.00',
    price: 4.0,
    description: 'Estadio Metropolitano, Metroatletik.'
  },
  {
    id: 'zona_5_5',
    name: 'Zona $5.50',
    price: 5.5,
    description: 'Ejido (Casco Central).'
  }
];

// --- MODIFICADORES Y OPCIONES DE PERSONALIZACIÓN ---

export const BURGER_SIDES = [
  { id: 'chips', name: '🥔 Papas Chips', description: 'Crujientes y artesanales' },
  { id: 'francesas', name: '🍟 Papas Francesas', description: 'Doradas y al punto de sal' }
];

export const CHICKEN_COOKING_TYPES = [
  { id: 'crispy', name: '🍗 Pollo Crispy', description: 'Empanizado extra crujiente' },
  { id: 'plancha', name: '🥩 Pollo a la Plancha', description: 'Jugosa pechuga a la parrilla' }
];

export const BURGER_ADDONS = [
  { id: 'ad_queso_kraft', name: 'Queso Kraft', price: 1.0, icon: '🧀', category: 'quesos' },
  { id: 'ad_queso_asado', name: 'Queso Llanero Asado', price: 1.0, icon: '🧀', category: 'quesos' },
  { id: 'ad_cebolla_caram', name: 'Cebolla Caramelizada', price: 1.0, icon: '🧅', category: 'vegetales' },
  { id: 'ad_huevo', name: 'Huevo Frito', price: 1.0, icon: '🍳', category: 'extras' },
  { id: 'ad_aguacate', name: 'Aguacate', price: 1.0, icon: '🥑', category: 'vegetales' },
  { id: 'ad_maiz', name: 'Maíz dulce', price: 1.0, icon: '🌽', category: 'vegetales' },
  { id: 'ad_fondue_mozz', name: 'Fondue Mozzarella', price: 1.0, icon: '🫕', category: 'quesos' },
  { id: 'ad_cebolla_vino', name: 'Cebolla en Vino de Mora', price: 1.5, icon: '🍷', category: 'vegetales' },
  { id: 'ad_tocineta', name: 'Tocineta Crujiente', price: 1.5, icon: '🥓', category: 'carnes' },
  { id: 'ad_champinones', name: 'Champiñones Salteados', price: 1.5, icon: '🍄', category: 'vegetales' },
  { id: 'ad_chorizo', name: 'Chorizo Ahumado', price: 1.5, icon: '🌭', category: 'carnes' },
  { id: 'ad_carne_150', name: 'Carne 150g Extra', price: 2.0, icon: '🥩', category: 'proteinas' },
  { id: 'ad_pollo_plancha', name: 'Pollo Plancha Extra', price: 2.0, icon: '🍗', category: 'proteinas' },
  { id: 'ad_lomito_150', name: 'Lomito 150g Extra', price: 2.5, icon: '🥩', category: 'proteinas' },
  { id: 'ad_chuleta', name: 'Chuleta Ahumada Extra', price: 2.5, icon: '🥩', category: 'proteinas' },
  { id: 'ad_pollo_crispy', name: 'Pollo Crispy Extra', price: 2.5, icon: '🍗', category: 'proteinas' }
];

export const CROSS_SELL_DRINKS = [
  { id: 'none', name: 'Ninguna', price: 0.0, icon: '🚫' },
  { id: 'personal', name: 'Refresco Personal', price: 1.0, icon: '🥤' },
  { id: '1l', name: 'Refresco 1L', price: 2.5, icon: '🍾' },
  { id: '1.5l', name: 'Refresco 1.5L', price: 3.0, icon: '🍾' },
  { id: '2l', name: 'Refresco 2L', price: 3.5, icon: '🍾' }
];

export const DRINK_FLAVORS = [
  'Coca Cola',
  'Pepsi',
  'Chinotto / 7Up',
  'Kolita',
  'Naranja'
];

export const COMBO_1Y1_MEAT_OPTIONS = [
  'Cheeseburger Clásica',
  'Pico León',
  'Pico Toro',
  'Pico Humboldt',
  'Bosque Pino',
  'Double Cheese & Bacon',
  'Pico Codazzi'
];

export const COMBO_1Y1_CHICKEN_OPTIONS = [
  'Pico Bonpland',
  'Pico Águila',
  'Mucubají',
  'Sanguchito de Pollo'
];

export const PLATO_SIDES = [
  '🍟 Papas Francesas',
  '🥔 Papas Chips',
  '🥔 Puré de Papa'
];

export const PLATO_SALADS = [
  '🥗 Ensalada César',
  '🥗 Ensalada Coleslaw'
];

export const menuItems = [
  // --- ENTRADAS ---
  {
    id: 'ent_chips',
    name: 'Servicio de Chips',
    category: 'entradas',
    price: 5.0,
    description: 'Acompañados con 2 salsas a escoger.',
    image: '/chips.jpg'
  },
  {
    id: 'ent_tequenos',
    name: 'Tequeños',
    category: 'entradas',
    price: 6.0,
    description: 'Crujientes tequeños acompañados de salsa tártara de la casa.',
    image: '/tequenos_nevados.jpg'
  },
  {
    id: 'ent_papas_francesas',
    name: 'Servicio de Papas Francesas',
    category: 'entradas',
    price: 6.0,
    description: 'Papas fritas con 2 salsas a escoger.',
    image: '/papas_sierra.jpg'
  },
  {
    id: 'ent_tenders',
    name: 'Tenders de Pollo',
    category: 'entradas',
    price: 7.0,
    description: 'Crujientes tenders de pollo con papas francesas y salsa a escoger.',
    image: '/tenders_pollo.jpg'
  },
  {
    id: 'ent_ensalada_cesar',
    name: 'Ensalada César',
    category: 'entradas',
    price: 9.0,
    description: 'Clásica ensalada césar con pollo crispy o a la plancha.',
    image: '/ensalada_cesar.jpg'
  },
  {
    id: 'ent_papas_culata',
    name: 'Papas La Culata',
    category: 'entradas',
    price: 9.0,
    description: 'Papas francesas bañadas en fondue de queso mozzarella, tocineta y maíz.',
    image: '/papas_culata.jpg'
  },
  {
    id: 'ent_papas_mifafi',
    name: 'Papas Mifafí',
    category: 'entradas',
    price: 11.0,
    description: 'Papas francesas con proteína a escoger (chuleta, lomito o pollo a la plancha), tocineta, maíz, salsas clásicas y queso de año.',
    image: '/papas_mifafi.jpg'
  },

  // --- HAMBURGUESAS CON CARNE ---
  {
    id: 'h_la_torre',
    name: 'Pico La Torre 4.547 m.s.n.m.',
    category: 'hamburguesas_carne',
    price: 13.0,
    description: 'Pan de papa 110g, stick fries, 150g carne de res, 150g pechuga de pollo, 150g chuleta ahumada, queso Kraft, pepinillos, tocineta y salsas de la casa. Incluye papas chips o yuquitas.',
    image: '/burger_latorre.jpg'
  },
  {
    id: 'h_bolivar',
    name: 'Pico Bolívar 4.978 m.s.n.m.',
    category: 'hamburguesas_carne',
    price: 12.0,
    description: 'Pan de papa 110g, 150g lomito marinado en chimichurri, 130g de pollo, pico de gallo, queso llanero asado, aguacate, chorizo de cerdo ahumado y tártara. Incluye papas chips o yuquitas.',
    image: '/burger_bolivar.jpg'
  },
  {
    id: 'h_bosque_pino',
    name: 'Bosque Pino 2.500 m.s.n.m.',
    category: 'hamburguesas_carne',
    price: 9.0,
    description: 'Pan de papa 110g, 150g carne de res con fondue de queso mozzarella, cebollas caramelizadas en vino de mora, tocineta, lechuga, tomate y salsas clásicas. Incluye papas chips o yuquitas.',
    image: '/burger_bosquepino.jpg'
  },
  {
    id: 'h_double_cheese_bacon',
    name: 'Double Cheese & Bacon',
    category: 'hamburguesas_carne',
    price: 9.0,
    description: 'Pan de papa 110g, 200g carne de res con queso Kraft, tocineta crocante, pepinillos, cebolla, salsa de tomate y BBQ de la casa. Incluye papas chips o yuquitas.',
    image: '/burger_double_cheese.jpg'
  },
  {
    id: 'h_codazzi',
    name: 'Pico Codazzi 4.775 m.s.n.m.',
    category: 'hamburguesas_carne',
    price: 9.0,
    description: 'Pan de papa 110g, 150g carne de res, lechuga, queso asado, tocineta, piña asada con miel de papelón, mayomostaza y salsa BBQ. Incluye papas chips o yuquitas.',
    image: '/burger_codazzi.jpg'
  },
  {
    id: 'h_humboldt',
    name: 'Pico Humboldt 4.940 m.s.n.m.',
    category: 'hamburguesas_carne',
    price: 8.5,
    description: 'Pan de papa 110g, 150g carne de res, ensalada rallada, stick fries, huevo frito, aguacate, tocineta y tártara. Incluye papas chips o yuquitas.',
    image: '/burger_humboldt.jpg'
  },
  {
    id: 'h_toro',
    name: 'Pico Toro 4.755 m.s.n.m.',
    category: 'hamburguesas_carne',
    price: 8.0,
    description: 'Pan de papa 80g, 150g lomito al chimichurri, pico de gallo, queso llanero asado, aguacate y tártara. Incluye papas chips o yuquitas.',
    image: '/burger_toro.jpg'
  },
  {
    id: 'h_leon',
    name: 'Pico León 4.720 m.s.n.m.',
    category: 'hamburguesas_carne',
    price: 6.5,
    description: 'Pan de papa 80g, 100g carne de res, fondue de mozzarella, cebollas caramelizadas, lechuga, tomate y tártara. Incluye papas chips o yuquitas.',
    image: '/burger_leon.jpg'
  },
  {
    id: 'h_cheeseburger',
    name: 'Cheeseburger Clásica',
    category: 'hamburguesas_carne',
    price: 6.0,
    description: 'Pan de papa 80g, 100g carne de res, queso Kraft, cebolla, pepinillos, salsa de tomate y BBQ de la casa. Incluye papas chips o yuquitas.',
    image: '/burger_cheeseburger.jpg'
  },

  // --- HAMBURGUESAS CON POLLO ---
  {
    id: 'h_bonpland',
    name: 'Pico Bonpland 4.823 m.s.n.m.',
    category: 'hamburguesas_pollo',
    price: 10.0,
    description: 'Pan de papa 110g, 150g pechuga (crispy o plancha), champiñones salteados con tocineta en crema de leche, stick fries y queso de año. Incluye papas chips o yuquitas.',
    image: '/burger_chicken.jpg'
  },
  {
    id: 'h_aguila',
    name: 'Pico Águila 4.118 m.s.n.m.',
    category: 'hamburguesas_pollo',
    price: 9.0,
    description: 'Pan de papa 110g, 150g pechuga (crispy o plancha), tomate, lechuga, dip de ajoporro, tocineta y salsas clásicas. Incluye papas chips o yuquitas.',
    image: '/burger_aguila.jpg'
  },
  {
    id: 'h_mucubaji',
    name: 'Mucubají 3.628 m.s.n.m.',
    category: 'hamburguesas_pollo',
    price: 9.0,
    description: 'Pan de papa 110g, 150g pechuga (crispy o plancha), ensalada césar, tocineta y queso de año. Incluye papas chips o yuquitas.',
    image: '/burger_mucubaji.jpg'
  },
  {
    id: 'h_sanguchito',
    name: 'Sanguchito de Pollo',
    category: 'hamburguesas_pollo',
    price: 8.0,
    description: 'Pan de papa 80g, 140g pollo crispy, queso Kraft, pepinillos, tocineta ahumada, salsa de tomate y BBQ de la casa. Incluye papas chips o yuquitas.',
    image: '/burger_sanguchito.jpg'
  },

  // --- HAMBURGUESAS CON CHULETA ---
  {
    id: 'h_la_concha',
    name: 'Pico La Concha 4.922 m.s.n.m.',
    category: 'hamburguesas_chuleta',
    price: 9.0,
    description: 'Pan de papa 110g, 150g chuleta ahumada con BBQ, ensalada coleslaw y aros de cebolla crujientes. Incluye papas chips o yuquitas.',
    image: '/burger_laconcha.jpg'
  },

  // --- PLATOS ---
  {
    id: 'pl_pollo',
    name: 'Pollo a la Plancha o Crispy',
    category: 'platos',
    price: 8.0,
    description: 'Acompañante a elegir: papas francesas, chips o puré de papa + ensalada césar o coleslaw.',
    image: '/plato_pollo.jpg'
  },
  {
    id: 'pl_chuleta',
    name: 'Chuleta Ahumada con Salsa BBQ',
    category: 'platos',
    price: 8.0,
    description: 'Acompañante a elegir: papas francesas, chips o puré de papa + ensalada césar o coleslaw.',
    image: '/plato_chuleta.jpg'
  },
  {
    id: 'pl_lomito_salteado',
    name: 'Lomito Salteado',
    category: 'platos',
    price: 9.0,
    description: 'Lomito salteado con cebolla y pimentón en salsa BBQ. Incluye acompañante y ensalada.',
    image: '/plato_lomito_salteado.jpg'
  },
  {
    id: 'pl_lomito_gratinado',
    name: 'Lomito Gratinado',
    category: 'platos',
    price: 9.0,
    description: 'Lomito cubierto con fondue de queso mozzarella. Incluye acompañante y ensalada.',
    image: '/plato_lomito_gratinado.jpg'
  },
  {
    id: 'pl_parmigiana',
    name: 'Pechuga a la Parmigiana',
    category: 'platos',
    price: 9.0,
    description: 'Pechuga gratinada con salsa y queso. Incluye acompañante y ensalada.',
    image: '/plato_parmigiana.jpg'
  },
  {
    id: 'pl_pollo_crema',
    name: 'Pollo Plancha / Crispy en Crema',
    category: 'platos',
    price: 10.0,
    description: 'En crema blanca de champiñones y tocineta. Incluye acompañante y ensalada.',
    image: '/plato_pollo_crema.jpg'
  },

  // --- COMBOS ---
  {
    id: 'cb_cheeseburger_sin_papas',
    name: 'Combo Cheeseburger (Sin Papas)',
    category: 'combos',
    price: 16.0,
    description: '4 cheeseburgers clásicas sin papas chips.',
    image: '/combo_cheeseburger_sinpapas.jpg'
  },
  {
    id: 'cb_cheeseburger_con_papas',
    name: 'Combo Cheeseburger (Con Papas)',
    category: 'combos',
    price: 18.0,
    description: '4 cheeseburgers clásicas con 2 raciones de papas chips.',
    image: '/combo_cheeseburger_conpapas.jpg'
  },
  {
    id: 'cb_lomito',
    name: 'Combo Lomito',
    category: 'combos',
    price: 18.0,
    description: 'Burger Bolívar + Burger Toro + Refresco 1 Ltr.',
    image: '/combo_lomito.jpg'
  },
  {
    id: 'cb_chicken',
    name: 'Combo Chicken',
    category: 'combos',
    price: 18.0,
    description: 'Escoge 2 burgers de pollo (crispy o plancha) + Refresco 1 Ltr.',
    image: '/combo_chicken.jpg'
  },
  {
    id: 'cb_1_y_1',
    name: 'Combo 1 y 1',
    category: 'combos',
    price: 18.0,
    description: 'Una burger de carne y una burger de pollo a escoger + Refresco 1 Ltr (No incluye Bolívar ni La Torre).',
    image: '/combo_1y1.jpg'
  },
  {
    id: 'cb_sierra_nevada',
    name: 'Combo Sierra Nevada',
    category: 'combos',
    price: 28.0,
    description: 'Cheeseburger + León + Bosque Pino + Humboldt + Refresco 1.5 Ltrs.',
    image: '/combo_sierra_nevada.jpg'
  },

  // --- BEBIDAS ---
  {
    id: 'beb_personal',
    name: 'Refresco Personal',
    category: 'bebidas',
    price: 1.0,
    description: 'Refresco presentación individual.',
    image: '/refresco_personal.jpg'
  },
  {
    id: 'beb_1ltr',
    name: 'Refresco 1 Litro',
    category: 'bebidas',
    price: 2.5,
    description: 'Refresco botella de 1 Litro.',
    image: '/refresco_1l.jpg'
  },
  {
    id: 'beb_1_5ltr',
    name: 'Refresco 1.5 Litros',
    category: 'bebidas',
    price: 3.0,
    description: 'Refresco botella de 1.5 Litros.',
    image: '/refresco_1_5l.jpg'
  },
  {
    id: 'beb_2ltr',
    name: 'Refresco 2 Litros',
    category: 'bebidas',
    price: 3.5,
    description: 'Refresco botella de 2 Litros.',
    image: '/refresco_2l.jpg'
  },

  // --- ADICIONALES ---
  { id: 'ad_queso_kraft', name: 'Adicional: Queso Kraft', category: 'adicionales', price: 1.0, description: 'Porción extra de Queso Kraft', image: '/adicional.jpg' },
  { id: 'ad_queso_asado', name: 'Adicional: Queso Asado', category: 'adicionales', price: 1.0, description: 'Porción extra de Queso Llanero Asado', image: '/adicional.jpg' },
  { id: 'ad_cebolla_caram', name: 'Adicional: Cebolla Caramelizada', category: 'adicionales', price: 1.0, description: 'Porción extra de Cebolla Caramelizada', image: '/adicional.jpg' },
  { id: 'ad_huevo', name: 'Adicional: Huevo Frito', category: 'adicionales', price: 1.0, description: '1 Huevo frito adicional', image: '/adicional.jpg' },
  { id: 'ad_aguacate', name: 'Adicional: Aguacate', category: 'adicionales', price: 1.0, description: 'Porción extra de Aguacate', image: '/adicional.jpg' },
  { id: 'ad_maiz', name: 'Adicional: Maíz', category: 'adicionales', price: 1.0, description: 'Porción extra de Maíz dulce', image: '/adicional.jpg' },
  { id: 'ad_fondue_mozz', name: 'Adicional: Fondue Mozzarella', category: 'adicionales', price: 1.0, description: 'Porción extra de Fondue de Mozzarella', image: '/adicional.jpg' },
  { id: 'ad_cebolla_vino', name: 'Adicional: Cebolla en Vino de Mora', category: 'adicionales', price: 1.5, description: 'Cebolla caramelizada en vino de mora', image: '/adicional.jpg' },
  { id: 'ad_tocineta', name: 'Adicional: Tocineta', category: 'adicionales', price: 1.5, description: 'Porción extra de Tocineta crujiente', image: '/adicional.jpg' },
  { id: 'ad_champinones', name: 'Adicional: Champiñones', category: 'adicionales', price: 1.5, description: 'Porción extra de Champiñones salteados', image: '/adicional.jpg' },
  { id: 'ad_chorizo', name: 'Adicional: Chorizo Ahumado', category: 'adicionales', price: 1.5, description: 'Porción extra de Chorizo de cerdo ahumado', image: '/adicional.jpg' },
  { id: 'ad_carne_150', name: 'Adicional: Carne 150g', category: 'adicionales', price: 2.0, description: 'Carne de res 150g extra', image: '/adicional.jpg' },
  { id: 'ad_pollo_plancha', name: 'Adicional: Pollo Plancha 150g', category: 'adicionales', price: 2.0, description: 'Pechuga de pollo a la plancha extra', image: '/adicional.jpg' },
  { id: 'ad_lomito_150', name: 'Adicional: Lomito 150g', category: 'adicionales', price: 2.5, description: 'Lomito marinado extra', image: '/adicional.jpg' },
  { id: 'ad_chuleta', name: 'Adicional: Chuleta Ahumada', category: 'adicionales', price: 2.5, description: 'Chuleta ahumada extra', image: '/adicional.jpg' },
  { id: 'ad_pollo_crispy', name: 'Adicional: Pollo Crispy', category: 'adicionales', price: 2.5, description: 'Pechuga de pollo crispy extra', image: '/adicional.jpg' }
];