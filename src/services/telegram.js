// Formateo del número de teléfono para el botón de WhatsApp
    const cleanDigits = (orderData.customerPhone || '').replace(/\D/g, '');
    const cleanPhone = cleanDigits.startsWith('0')
      ? '58' + cleanDigits.substring(1)
      : (cleanDigits.startsWith('58') ? cleanDigits : '58' + cleanDigits);

    // 1. Mensaje para el cliente
    const clientName = orderData.customerName ? ` ${orderData.customerName}` : '';
    const rawMessage = `¡Hola${clientName}! 👋 Gracias por tu compra cumbrelover, su pedido está siendo procesado en cocina... 👨‍🍳🔥 le avisaremos cuando salga.`;

   // ==============================================================
    // CONFIGURACIÓN DE LOS DOS REPARTIDORES
    // ==============================================================
    const DELIVERY_JULIO_PHONE = '584247441670';
    const DELIVERY_SPEEDY_PHONE = '584242773339';

    // 1. Mensaje limpio para los repartidores (formato seguro sin saltos rotos)
    const deliveryAddressText = orderData.deliveryAddress || 'Retiro en local';
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(deliveryAddressText + ', Merida')}`;

    let simpleProducts = '';
    if (orderData.items && orderData.items.length > 0) {
      simpleProducts = orderData.items.map(it => `${it.quantity || 1}x ${it.name}`).join(', ');
    }

    const deliveryTextRaw = `🛵 *PEDIDO CUMBRE FOOD* #${orderData.orderId}\n` +
      `👤 Cliente: ${orderData.customerName || 'N/A'}\n` +
      `📱 Tel: ${cleanPhone}\n` +
      `📍 Dir: ${deliveryAddressText}\n` +
      `🍔 Prod: ${simpleProducts}\n` +
      `🗺️ Maps: ${mapsLink}`;

    const deliveryJulioUrl = `https://api.whatsapp.com/send?phone=${DELIVERY_JULIO_PHONE}&text=${encodeURIComponent(deliveryTextRaw)}`;
    const deliverySpeedyUrl = `https://api.whatsapp.com/send?phone=${DELIVERY_SPEEDY_PHONE}&text=${encodeURIComponent(deliveryTextRaw)}`;

    // 2. Armar botones garantizados
    const buttons = [
      [
        {
          text: '💬 Escribir al Cliente',
          url: `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(rawMessage)}`
        }
      ],
      [
        {
          text: '🛵 deliveryJulio',
          url: deliveryJulioUrl
        },
        {
          text: '🛵 deliverySpeedy',
          url: deliverySpeedyUrl
        }
      ]
    ];

    // Botón de mapa si hay dirección
    if (orderData.deliveryAddress && orderData.deliveryAddress.trim()) {
      buttons.push([
        {
          text: '📍 Ver Ubicación en Maps',
          url: mapsLink
        }
      ]);
    }

    const replyMarkup = {
      inline_keyboard: buttons
    };