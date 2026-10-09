import { Modal } from 'react-bootstrap';

export default function LegalModal({ show, onHide, activeTab = 'privacy' }) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      className="cf-modal-legal"
      backdropClassName="cf-modal-backdrop"
      contentClassName="border-0 bg-transparent"
    >
      <div
        className="text-white p-4 position-relative"
        style={{
          backgroundColor: '#161311',
          borderRadius: '20px',
          border: '1px solid rgba(217, 119, 6, 0.4)',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9)'
        }}
      >
        <button
          type="button"
          className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
          onClick={onHide}
          aria-label="Cerrar"
        />

        <div className="text-center mb-4">
          <h3 className="fw-bold text-warning mb-1">📜 Marco Legal y Privacidad</h3>
          <p className="text-secondary small"> Cumbre • Mérida, Venezuela</p>
        </div>

        {/* Sección: Términos y Condiciones */}
        <div className="mb-4">
          <h5 className="text-warning fw-bold border-bottom border-secondary pb-2">
            1. Términos y Condiciones del Servicio
          </h5>
          <div className="text-light small lh-lg" style={{ color: '#d1d5db' }}>
            <p>
              <strong>1.1. Objeto:</strong> Cumbre ofrece una plataforma web interactiva para la exploración de nuestro menú, personalización de pedidos y generación directa de comandas hacia cocina.
            </p>
            <p>
              <strong>1.2. Precios y Tasas:</strong> Todos los precios base están denominados en Dólares Americanos (USD) y convertidos de manera referencial a Bolívares (Bs.) de acuerdo con la tasa oficial establecida por el Banco Central de Venezuela (BCV).
            </p>
            <p>
              <strong>1.3. Validación de Pagos:</strong> En pagos vía Pago Móvil, el cliente debe ingresar la referencia válida y cargar el comprobante correspondiente. Las operaciones vía Zelle aplican para consumos mínimos de $15.00 USD. Las órdenes pasan a cocina una vez verificado el ingreso en cuenta.
            </p>
            <p>
              <strong>1.4. Despachos:</strong> Las entregas se gestionan bajo modalidad Pick-Up en Feria C.C. Plaza Mayor o Delivery en zonas seleccionadas de Mérida con tarifas calculadas según ubicación geográfica.
            </p>
          </div>
        </div>

        {/* Sección: Política de Privacidad */}
        <div className="mb-4">
          <h5 className="text-warning fw-bold border-bottom border-secondary pb-2">
            2. Política de Privacidad y Tratamiento de Datos
          </h5>
          <div className="text-light small lh-lg" style={{ color: '#d1d5db' }}>
            <p>
              <strong>2.1. Datos Solicitados:</strong> Recopilamos exclusivamente su nombre, número telefónico, cédula de identidad, dirección física (en caso de Delivery) y captura de comprobante bancario para validar su compra.
            </p>
            <p>
              <strong>2.2. Uso Estricto:</strong> Dicha información se emplea únicamente para procesar la orden, emitir la comanda de cocina y contactarle por WhatsApp sobre el estatus de su despacho. No comercializamos ni transferimos información personal a terceros.
            </p>
            <p>
              <strong>2.3. Seguridad:</strong> Las transferencias se realizan bajo conexiones cifradas seguras con protocolo HTTPS.
            </p>
          </div>
        </div>

        {/* Sección: Cookies */}
        <div className="mb-4">
          <h5 className="text-warning fw-bold border-bottom border-secondary pb-2">
            3. Uso de Cookies y Almacenamiento Local
          </h5>
          <div className="text-light small lh-lg" style={{ color: '#d1d5db' }}>
            <p>
              Utilizamos almacenamiento local (LocalStorage) y cookies técnicas únicamente para conservar los artículos de su mochila de compras y recordar sus preferencias de sesión. No utilizamos cookies de rastreo publicitario invasivo.
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            type="button"
            className="btn btn-warning px-4 py-2 fw-bold text-dark rounded-pill"
            onClick={onHide}
          >
            Entendido y Aceptar
          </button>
        </div>
      </div>
    </Modal>
  );
}