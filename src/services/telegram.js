// src/services/telegram.js
export const sendOrderToTelegram = async (orderData, receiptFile) => {
  try {
    let caption = `🍔 <b>NUEVO PEDIDO - CUMBRE FOOD</b>\n`;
    caption += `━━━━━━━━━━━━━━━━━━━━\n`;
    caption += `👤 <b>Cliente:</b> ${orderData.customerName || 'No indicado'}\n`;
    caption += `🪪 <b>Cédula:</b> ${orderData.customerIdCard || 'No indicado'}\n`;
    caption += `📱 <b>Teléfono:</b> ${orderData.customerPhone || 'No indicado'}\n`;
    caption += `🛵 <b>Entrega:</b> ${orderData.deliveryZone || 'Pick Up'}\n`;
    if (orderData.deliveryAddress) {
      caption += `📍 <b>Dirección:</b> ${orderData.deliveryAddress}\n`;
    }
    caption += `━━━━━━━━━━━━━━━━━━━━\n`;
    caption += `📋 <b>PRODUCTOS:</b>\n`;

    if (orderData.items && orderData.items.length > 0) {
      orderData.items.forEach((item) => {
        const qty = item.quantity || 1;
        const sub = (Number(item.price || 0) * qty).toFixed(2);
        caption += `• ${qty}x ${item.name} — $${sub}\n`;
        if (item.customizationDetails && item.customizationDetails.length > 0) {
          item.customizationDetails.forEach((d) => {
            caption += `  └ <i>${d.label}:</i> ${d.value}\n`;
          });
        }
      });
    }

    caption += `━━━━━━━━━━━━━━━━━━━━\n`;
    caption += `💰 <b>Total a Pagar:</b> $${Number(orderData.total || 0).toFixed(2)}\n`;
    caption += `💳 <b>Método:</b> ${orderData.paymentMethod || 'Pago Móvil'}\n`;
    if (orderData.reference) {
      caption += `🔢 <b>Referencia:</b> ${orderData.reference}\n`;
    }

    const formData = new FormData();
    if (receiptFile) {
      formData.append('photo', receiptFile);
    }
    formData.append('caption', caption);
    formData.append('parse_mode', 'HTML');

    const response = await fetch('/api/telegram', {
      method: 'POST',
      body: receiptFile ? formData : JSON.stringify({ text: caption }),
      headers: receiptFile ? {} : { 'Content-Type': 'application/json' },
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Error enviando orden');
    }

    return true;
  } catch (error) {
    console.error('Error enviando comanda:', error);
    throw error;
  }
};