import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('cf_cookies_accepted');
    if (!consent) {
      setAccepted(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cf_cookies_accepted', 'true');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div
      className="position-fixed bottom-0 start-0 end-0 p-3 text-white d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 shadow-lg"
      style={{
        backgroundColor: '#1b1613',
        borderTop: '1px solid rgba(217, 119, 6, 0.4)',
        zIndex: 9999
      }}
    >
      <div className="small">
        🍪 Utilizamos almacenamiento local y cookies técnicas esenciales para guardar los productos de tu mochila y procesar tu orden. Al navegar en el sitio, aceptas nuestra <strong>Política de Privacidad y Cookies</strong>.
      </div>
      <button
        type="button"
        className="btn btn-sm px-4 py-2 fw-bold text-dark text-nowrap"
        style={{ backgroundColor: '#f59e0b', borderRadius: '10px' }}
        onClick={handleAccept}
      >
        Aceptar y Continuar
      </button>
    </div>
  );
}