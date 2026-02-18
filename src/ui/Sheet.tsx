import React, { useEffect } from 'react';

export function Sheet({
  open,
  title,
  onClose,
  children
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 6000,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 680,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'rgba(12,12,12,0.95)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.7)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <div style={{ fontWeight: 900 }}>{title}</div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <i className="fas fa-times" />
          </button>
        </div>
        <div style={{ padding: 12 }}>{children}</div>
      </div>
    </div>
  );
}

