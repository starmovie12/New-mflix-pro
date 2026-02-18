import React, { useEffect } from 'react';

export function Toast({
  message,
  onDone
}: {
  message: string | null;
  onDone: () => void;
}) {
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(onDone, 1800);
    return () => window.clearTimeout(t);
  }, [message, onDone]);

  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 18,
        zIndex: 9000,
        padding: '10px 12px',
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(15,15,15,0.92)',
        backdropFilter: 'blur(10px)',
        fontWeight: 900,
        color: 'rgba(255,255,255,0.92)',
        boxShadow: '0 25px 80px rgba(0,0,0,0.6)'
      }}
    >
      {message}
    </div>
  );
}

