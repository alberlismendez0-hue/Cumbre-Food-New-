// Credenciales de Telegram (reemplaza con tus valores reales)
const TELEGRAM_BOT_TOKEN = '8805678614:AAGPkRYa1hCtaPJosBm6EwiMWmz3AQ00SKU';
const TELEGRAM_CHAT_ID = '8637184646';

/**
 * Envía la orden y el comprobante de pago al Telegram del restaurante
 * @param {Object} orderData Datos completos de la orden
 * @param {File|null} receiptFile Archivo de imagen del comprobante / billetes
 */
export const sendOrderToTelegram = async (orderData, receiptFile) => {
  try {
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);

    // Estructurar el texto de la comanda
    let caption = `⛰️ *NUEVO PEDIDO - CUMBRE*\n`;
    caption += `🆔 *ORDEN:* \`#${orderData.orderId}\`\n`;
    caption += `━━━━━━━━━━━━━━━━━━━━━\n`;
    caption += `👤 *Cliente:* ${orderData.customerName}\n`;
    caption += `🪪 *Cédula:* ${orderData.customerIdCard}\n`;
    caption += `📱 *Teléfono:* [${orderData.customerPhone}](https://wa.me/58${orderData.customerPhone.replace(/\D/g, '').replace(/^0/, '')})\n`;
    caption += `🛵 *Tipo de Entrega:* ${orderData.deliveryZone}\n`;
    if (orderData.deliveryAddress) {
      caption += `📍 *Dirección:* ${orderData.deliveryAddress}\n`;
    }
    caption += `━━━━━━━━━━━━━━━━━━━━━\n`;
    caption += `📋 *PRODUCTOS:*\n`;

    orderData.items.forEach((item) => {
      const qty = item.quantity || 1;
      const sub = (Number(item.price || 0) * qty).toFixed(2);
      caption += `• *${qty}x* ${item.name} — $${sub}\n`;
      if (item.customizationDetails && item.customizationDetails.length > 0) {
        item.customizationDetails.forEach((d) => {
          caption += `   ↳ _${d.label}:_ ${d.value}\n`;
        });
      }
    });

    caption += `━━━━━━━━━━━━━━━━━━━━━\n`;
    caption += `💵 *Subtotal:* $${orderData.subtotal.toFixed(2)}\n`;
    caption += `🛵 *Delivery:* $${orderData.deliveryCost.toFixed(2)}\n`;
    caption += `💰 *TOTAL A PAGAR:* $${orderData.grandTotal.toFixed(2)}`;
    if (orderData.grandTotalBs) {
      caption += ` (${orderData.grandTotalBs} Bs.)`;
    }
    caption += `\n━━━━━━━━━━━━━━━━━━━━━\n`;

    // Bloque dinámico según el método de pago
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

    // Formateo del número de teléfono para el botón de WhatsApp
    const cleanDigits = (orderData.customerPhone || '').replace(/\D/g, '');
    const cleanPhone = cleanDigits.startsWith('0')
      ? '58' + cleanDigits.substring(1)
      : (cleanDigits.startsWith('58') ? cleanDigits : '58' + cleanDigits);

    // Mensaje para el cliente
    const clientName = orderData.customerName ? ` ${orderData.customerName}` : '';
    const rawMessage = `¡Hola${clientName}! 👋 Gracias por tu compra cumbrelover, su pedido está siendo procesado en cocina... 👨‍🍳🔥 le avisaremos cuando salga.`;

    const replyMarkup = {
      inline_keyboard: [
        [
          {
            text: '💬 Escribir al Cliente por WhatsApp',
            url: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(rawMessage)}`
          }
        ]
      ]
    };

    formData.append('reply_markup', JSON.stringify(replyMarkup));
    formData.append('parse_mode', 'Markdown');

    let endpoint = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;

    if (receiptFile) {
      formData.append('photo', receiptFile);
      formData.append('caption', caption);
    } else {
      endpoint = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      formData.append('text', caption);
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.description || 'Error al comunicarse con Telegram');
    }

    return data;
  } catch (error) {
    console.error('Error enviando la orden a Telegram:', error);
    throw error;
  }
};