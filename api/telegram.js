// api/telegram.js
export const config = {
  api: {
    bodyParser: false, // Permitir recibir archivos (capturas de pago)
  },
};

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
    // Si la petición viene con FormData (archivo/imagen)
    const contentType = req.headers['content-type'] || '';
    
    if (contentType.includes('multipart/form-data')) {
      const buffer = await req.arrayBuffer ? await req.arrayBuffer() : await getRawBody(req);
      
      // Enviamos el stream/buffer directo a Telegram sendPhoto
      const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto?chat_id=${chatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': contentType,
        },
        body: buffer,
      });

      const data = await response.json();
      if (!data.ok) {
        return res.status(500).json({ error: data.description });
      }
      return res.status(200).json({ success: true });
    } else {
      // Por si se envía solo texto JSON
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: body.text || body.caption,
          parse_mode: 'HTML',
        }),
      });

      const data = await response.json();
      if (!data.ok) {
        return res.status(500).json({ error: data.description });
      }
      return res.status(200).json({ success: true });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Error procesando el pedido en el servidor' });
  }
}

// Helper para leer el stream en Node/Vercel
function getRawBody(readable) {
  return new Promise((resolve, reject) => {
    let chunks = [];
    readable.on('data', (chunk) => chunks.push(chunk));
    readable.on('end', () => resolve(Buffer.concat(chunks)));
    readable.on('error', reject);
  });
}