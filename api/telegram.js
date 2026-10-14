// api/telegram.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ error: 'Variables de Telegram no configuradas en Vercel' });
  }

  try {
    const { caption, photoBase64, replyMarkup } = req.body;

    if (photoBase64) {
      // Extraer y decodificar el Base64
      const base64Data = photoBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const blob = new Blob([buffer], { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('photo', blob, 'comprobante.jpg');
      formData.append('caption', caption || '');
      formData.append('parse_mode', 'Markdown');

      if (replyMarkup) {
        formData.append('reply_markup', JSON.stringify(replyMarkup));
      }

      const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        body: formData,
      });

      const data = await tgRes.json();
      if (!data.ok) {
        return res.status(500).json({ error: data.description });
      }
      return res.status(200).json(data);
    } else {
      // Envío de texto con botón si no adjuntaron comprobante
      const payload = {
        chat_id: chatId,
        text: caption,
        parse_mode: 'Markdown',
      };

      if (replyMarkup) {
        payload.reply_markup = replyMarkup;
      }

      const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await tgRes.json();
      if (!data.ok) {
        return res.status(500).json({ error: data.description });
      }
      return res.status(200).json(data);
    }
  } catch (err) {
    return res.status(500).json({ error: 'Error procesando el pedido en el servidor' });
  }
}