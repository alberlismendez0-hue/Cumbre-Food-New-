import React, { useState } from 'react';

export default function ExpandableText({ text, maxChars = 85 }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  // Si el texto es más corto que el límite, se muestra normal
  if (text.length <= maxChars) {
    return (
      <p 
        className="text-secondary small mb-2" 
        style={{ fontSize: '0.82rem', lineHeight: '1.35' }}
      >
        {text}
      </p>
    );
  }

  return (
    <p
      className="text-secondary small mb-2"
      style={{
        fontSize: '0.82rem',
        lineHeight: '1.35',
        overflow: 'visible',
        display: 'block', // Anula el display: -webkit-box que causa el corte
        WebkitLineClamp: 'unset' // Anula el line-clamp
      }}
    >
      {isExpanded ? text : `${text.slice(0, maxChars).trim()}... `}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // Evita abrir el modal al presionar ver más
          setIsExpanded(!isExpanded);
        }}
        className="btn btn-link p-0 text-warning text-decoration-none fw-bold shadow-none"
        style={{
          fontSize: '0.78rem',
          verticalAlign: 'baseline',
          marginLeft: '4px',
          cursor: 'pointer'
        }}
      >
        {isExpanded ? 'ver menos' : 'ver más'}
      </button>
    </p>
  );
}