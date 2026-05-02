import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ children, onClose }) {
  
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      
      <div onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );
}