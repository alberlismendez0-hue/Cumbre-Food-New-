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

    // 2. Armar lista de productos para el repartidor
    let productsList = '';
    if (orderData.items && orderData.items.length > 0) {
      orderData.items.forEach((item) => {
        const qty = item.quantity || 1;
        productsList += `• ${qty}x ${item.name}\n`;
        if (item.customizationDetails && item.customizationDetails.length > 0) {
          item.customizationDetails.forEach((d) => {
            productsList += `   ↳ ${d.label}: ${d.value}\n`;
          });
        }
      });
    }

    // 3. Dirección y enlace a Google Maps
    const deliveryAddressText = orderData.deliveryAddress || 'Retiro en local / Sin dirección especificada';
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(deliveryAddressText + ', Mérida')}`;

    // 4. Ficha con los datos que se le enviarán al repartidor
    const deliveryMessage = `🛵 *ENTREGA DE PEDIDO - CUMBRE FOOD*\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Cliente:* ${orderData.customerName || 'No indicado'}\n` +
      `📱 *Teléfono:* https://wa.me/${cleanPhone}\n` +
      `📍 *Dirección:* ${deliveryAddressText}\n` +
      `🗺️ *Ubicación Maps:* ${mapsLink}\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `🍔 *PRODUCTOS A ENTREGAR:*\n` +
      productsList +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *Total a Cobrar:* $${orderData.grandTotal ? orderData.grandTotal.toFixed(2) : '0.00'}`;

    const deliveryJulioUrl = `https://wa.me/${DELIVERY_JULIO_PHONE}?text=${encodeURIComponent(deliveryMessage)}`;
    const deliverySpeedyUrl = `https://wa.me/${DELIVERY_SPEEDY_PHONE}?text=${encodeURIComponent(deliveryMessage)}`;

    // 5. Botones interactivos para Telegram
    const buttons = [
      [
        {
          text: '💬 Escribir al Cliente por WhatsApp',
          url: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(rawMessage)}`
        }
      ],
      [
        {
          text: '🛵 Enviar a deliveryJulio',
          url: deliveryJulioUrl
        },
        {
          text: '🛵 Enviar a deliverySpeedy',
          url: deliverySpeedyUrl
        }
      ]
    ];

    // Si el pedido tiene dirección, sumamos el botón directo al mapa
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