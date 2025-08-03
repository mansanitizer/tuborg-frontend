import React, { useState, useEffect, memo } from 'react';

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Slide in animation
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    
    // Auto dismiss
    const dismissTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  };

  const getToastStyle = () => {
    let backgroundColor = '#1a1a1a';
    let borderColor = '#333';
    let icon = 'ℹ️';

    switch (type) {
      case 'success':
        backgroundColor = '#065f46';
        borderColor = '#22c55e';
        icon = '✅';
        break;
      case 'error':
        backgroundColor = '#7f1d1d';
        borderColor = '#dc2626';
        icon = '❌';
        break;
      case 'warning':
        backgroundColor = '#92400e';
        borderColor = '#f59e0b';
        icon = '⚠️';
        break;
      case 'info':
      default:
        backgroundColor = '#1e3a8a';
        borderColor = '#3b82f6';
        icon = 'ℹ️';
        break;
    }

    return {
      backgroundColor,
      borderColor,
      icon,
      transform: isVisible && !isExiting ? 'translateX(0)' : 'translateX(100%)',
      opacity: isVisible && !isExiting ? 1 : 0,
    };
  };

  const style = getToastStyle();

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        backgroundColor: style.backgroundColor,
        border: `1px solid ${style.borderColor}`,
        borderRadius: '8px',
        padding: '12px 16px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '350px',
        minWidth: '200px',
        transform: style.transform,
        opacity: style.opacity,
        transition: 'all 0.3s ease',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <span style={{ fontSize: '16px' }}>{style.icon}</span>
      <span style={{ flex: 1, lineHeight: '1.4' }}>{message}</span>
      <button
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: '2px',
          fontSize: '16px',
          opacity: 0.7,
          lineHeight: 1
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
      >
        ×
      </button>
    </div>
  );
};

export default memo(Toast);