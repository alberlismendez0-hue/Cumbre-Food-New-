// Credenciales de Telegram (reemplaza con tus valores reales)
const TELEGRAM_BOT_TOKEN = '8096550202:AAEv1JDqvajKqXksA6aaPsoPxy-nR5M9MnU';
const TELEGRAM_CHAT_ID = '501773007';

/**
 * Envía la orden y el comprobante de Pago Móvil al Telegram del restaurante
 * @param {Object} orderData Datos completos de la orden
 * @param {File|null} receiptFile Archivo de imagen del comprobante
 */
export const sendOrderToTelegram = async (orderData, receiptFile) => {
  try {
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);

    // Estructurar el texto de la comanda
    let caption = `🏔️ *NUEVO PEDIDO - CUMBRE FOOD*\n`;
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
    caption += `💰 *TOTAL A PAGAR:* $${orderData.grandTotal.toFixed(2)}\n`;
    caption += `━━━━━━━━━━━━━━━━━━━━━\n`;
    caption += `💳 *DATOS DE PAGO MÓVIL:*\n`;
    caption += `🏦 *Banco Origen:* ${orderData.bankOrigin}\n`;
    caption += `🔢 *Últimos 4 Dígitos:* \`${orderData.paymentReference}\`\n`;

    if (orderData.notes && orderData.notes.trim()) {
      caption += `📝 *Notas de Cocina:* ${orderData.notes.trim()}\n`;
    }

    // Botón para que el encargado le escriba al cliente por WhatsApp con un solo clic
    const cleanPhone = orderData.customerPhone.replace(/\D/g, '').replace(/^0/, '58');
    const replyMarkup = {
      inline_keyboard: [
        [
          {
            text: '💬 Escribir al Cliente por WhatsApp',
            url: `https://wa.me/${cleanPhone}?text=¡Hola%20${encodeURIComponent(orderData.customerName)}!%20Confirmamos%20tu%20pago%20para%20el%20pedido%20%23${orderData.orderId}%20en%20Cumbre%20Food.%20¡Ya%20está%20en%20cocina!`
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