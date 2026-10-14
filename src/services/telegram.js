export const sendOrderToTelegram = async (messageText) => {
  try {
    const response = await fetch('/api/telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: messageText }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al enviar a Telegram');
    }

    return true;
  } catch (error) {
    console.error('Error enviando la orden a Telegram:', error);
    throw error;
  }
};