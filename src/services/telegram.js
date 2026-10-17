// src/services/telegram.js

/**
 * Convierte un File a Base64
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Envía la orden y el comprobante de pago al Telegram del restaurante
 * @param {Object} orderData Datos completos de la orden
 * @param {File|null} receiptFile Archivo de imagen del comprobante
 */
export const sendOrderToTelegram = async (orderData, receiptFile) => {
  try {
    // 1. Formateo del número de teléfono del cliente
    const cleanDigits = (orderData.customerPhone || '').replace(/\D/g, '');
    const cleanPhone = cleanDigits.startsWith('0')
      ? '58' + cleanDigits.substring(1)
      : (cleanDigits.startsWith('58') ? cleanDigits : '58' + cleanDigits);

    // 2. Estructuración del texto de la comanda principal para cocina/Telegram
    let caption = `⛰️ *NUEVO PEDIDO - CUMBRE*\n`;
    caption += `🆔 *ORDEN:* \`#${orderData.orderId}\`\n`;
    caption += `━━━━━━━━━━━━━━━━━━━━━\n`;
    caption += `👤 *Cliente:* ${orderData.customerName || 'No indicado'}\n`;
    caption += `🪪 *Cédula:* ${orderData.customerIdCard || 'No indicado'}\n`;
    caption += `📱 *Teléfono:* [${orderData.customerPhone}](https://wa.me/${cleanPhone})\n`;
    caption += `🛵 *Zona de Entrega:* ${orderData.deliveryZone || 'Pick Up'}\n`;
    if (orderData.deliveryAddress) {
      caption += `📍 *Dirección Exacta:* ${orderData.deliveryAddress}\n`;
    }
    caption += `━━━━━━━━━━━━━━━━━━━━━\n`;
    caption += `📋 *PRODUCTOS:*\n`;

    let productsForDelivery = '';
    if (orderData.items && orderData.items.length > 0) {
      orderData.items.forEach((item) => {
        const qty = item.quantity || 1;
        const sub = (Number(item.price || 0) * qty).toFixed(2);
        caption += `• *${qty}x* ${item.name} — $${sub}\n`;
        productsForDelivery += `• ${qty}x ${item.name}\n`;

        if (item.customizationDetails && item.customizationDetails.length > 0) {
          item.customizationDetails.forEach((d) => {
            caption += `   ↳ _${d.label}:_ ${d.value}\n`;
            productsForDelivery += `   ↳ ${d.label}: ${d.value}\n`;
          });
        }
      });
    }

    caption += `━━━━━━━━━━━━━━━━━━━━━\n`;
    caption += `💵 *Subtotal:* $${orderData.subtotal ? orderData.subtotal.toFixed(2) : '0.00'}\n`;
     // 🎟️ Desglose del descuento si fue aplicado:
    if (orderData.couponApplied && orderData.couponApplied !== 'Ninguno' && Number(orderData.discountAmount) > 0) {
      const descUsd = Number(orderData.discountAmount).toFixed(2);
      const descBs = orderData.discountAmountBs ? ` (-${orderData.discountAmountBs} Bs.)` : '';
      caption += `🎟️ *Cupón (${orderData.couponApplied}):* -$${descUsd}${descBs}\n`;
    }
    caption += `🛵 *Delivery (${orderData.deliveryZone || 'Zona'}):* $${orderData.deliveryCost ? orderData.deliveryCost.toFixed(2) : '0.00'}\n`;
    caption += `💰 *TOTAL A PAGAR:* $${orderData.grandTotal ? orderData.grandTotal.toFixed(2) : '0.00'}`;
    if (orderData.grandTotalBs) {
      caption += ` (${orderData.grandTotalBs} Bs.)`;
    }
    caption += `\n━━━━━━━━━━━━━━━━━━━━━\n`;

    // Bloque dinámico de métodos de pago
    if (orderData.paymentMethod === 'Efectivo Divisas ($)') {
      caption += `💵 *PAGO EN EFECTIVO DIVISAS ($):*\n`;
      caption += `💰 *Paga con:* ${orderData.cashAmountPaid || '$0.00'}\n`;
      caption += `🔄 *Vuelto a Entregar:* ${orderData.cashChangeDue || '$0.00'}\n`;
    } else if (orderData.paymentMethod === 'Pago Móvil') {
      caption += `💳 *DATOS DE PAGO MÓVIL:*\n`;
      caption += `🏦 *Banco Origen:* ${orderData.bankOrigin || 'N/A'}\n`;
      caption += `🔢 *Últimos 4 Dígitos:* \`${orderData.paymentReference || 'N/A'}\`\n`;
    } else if (['Zelle', 'Zinli', 'Binance Pay (USDT)'].includes(orderData.paymentMethod)) {
      caption += `💳 *DATOS DE PAGO (${orderData.paymentMethod}):*\n`;
      caption += `👤 *Titular / Nick emisor:* ${orderData.paymentSenderName || 'N/A'}\n`;
    } else {
      caption += `💵 *MÉTODO DE PAGO:* ${orderData.paymentMethod}\n`;
      caption += `ℹ️ Pago presencial al recibir o retirar.\n`;
    }

    if (orderData.notes && orderData.notes.trim()) {
      caption += `━━━━━━━━━━━━━━━━━━━━━\n`;
      caption += `📝 *Notas de Cocina:* ${orderData.notes.trim()}\n`;
    }

    // 3. Mensaje para el cliente
    const clientName = orderData.customerName ? ` ${orderData.customerName}` : '';
    const rawClientMessage = `¡Hola${clientName}! 👋 Gracias por tu compra cumbrelover, su pedido está siendo procesado en cocina... 👨‍🍳🔥 le avisaremos cuando salga.`;

   // 4. Mensaje estructurado para los repartidores (solo datos de despacho)
    const DELIVERY_JULIO_PHONE = '584247441670';
    const DELIVERY_SPEEDY_PHONE = '584242773339';

    const deliveryCostText = orderData.deliveryCost ? `$${orderData.deliveryCost.toFixed(2)}` : '$0.00';
    const deliveryZoneText = orderData.deliveryZone || 'No especificada';
    const exactAddressText = orderData.deliveryAddress || 'Retiro en local / Sin direccion';

    const deliveryTextRaw = `🛵 *ENTREGA DE PEDIDO - CUMBRE FOOD*\n` +
      `📦 Orden: ${orderData.orderId || 'S/N'}\n` +
      `━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Cliente:* ${orderData.customerName || 'No indicado'}\n` +
      `📱 *Telefono:* wa.me/${cleanPhone}\n` +
      `🛵 *Zona:* ${deliveryZoneText} (${deliveryCostText})\n` +
      `📍 *Direccion:* ${exactAddressText}`;

    const deliveryJulioUrl = `https://wa.me/${DELIVERY_JULIO_PHONE}?text=${encodeURIComponent(deliveryTextRaw)}`;
    const deliverySpeedyUrl = `https://wa.me/${DELIVERY_SPEEDY_PHONE}?text=${encodeURIComponent(deliveryTextRaw)}`;
    // 5. Botones interactivos (sin botón de mapa)
    const buttons = [
      [
        {
          text: '💬 Escribir al Cliente por WhatsApp',
          url: `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(rawClientMessage)}`
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

    const replyMarkup = {
      inline_keyboard: buttons
    };

    let photoBase64 = null;
    if (receiptFile) {
      photoBase64 = await fileToBase64(receiptFile);
    }

    // 6. Enviar a través de la API serverless
    const response = await fetch('/api/telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        caption,
        photoBase64,
        replyMarkup,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al comunicarse con Telegram');
    }

    return data;
  } catch (error) {
    console.error('Error enviando la orden a Telegram:', error);
    throw error;
  }
};