import React, { useState } from 'react';

export default function ExpandableText({ text, maxChars = 80 }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  if (text.length <= maxChars) {
    return <p className="product-card-desc mb-2">{text}</p>;
  }

  return (
    <p className="product-card-desc mb-2" style={{ lineHeight: '1.4' }}>
      {isExpanded ? text : `${text.slice(0, maxChars)}... `}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="btn btn-link p-0 text-warning text-decoration-none fw-bold"
        style={{ fontSize: '0.8rem', verticalAlign: 'baseline', marginLeft: '4px' }}
      >
        {isExpanded ? 'ver menos' : 'ver más'}
      </button>
    </p>
  );
}