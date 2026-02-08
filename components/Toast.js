// components/Toast.js
import { useEffect } from 'react';
import { Icon } from '@iconify/react';

export default function Toast({ open, message, type = 'success', onClose }) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'mdi:check-circle',
          iconColor: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: 'rgba(16, 185, 129, 0.4)',
        };
      case 'error':
        return {
          icon: 'mdi:close-circle',
          iconColor: '#ef4444',
          bgColor: 'rgba(239, 68, 68, 0.2)',
          borderColor: 'rgba(239, 68, 68, 0.4)',
        };
      case 'warning':
        return {
          icon: 'mdi:alert-circle',
          iconColor: '#f59e0b',
          bgColor: 'rgba(245, 158, 11, 0.2)',
          borderColor: 'rgba(245, 158, 11, 0.4)',
        };
      case 'info':
        return {
          icon: 'mdi:information-circle',
          iconColor: '#3b82f6',
          bgColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 0.4)',
        };
      default:
        return {
          icon: 'mdi:check-circle',
          iconColor: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: 'rgba(16, 185, 129, 0.4)',
        };
    }
  };

  const config = getTypeConfig();

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: 100,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#1e293b',
        color: '#f1f5f9',
        padding: '14px 20px',
        borderRadius: 12,
        border: `2px solid ${config.borderColor}`,
        boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
        fontWeight: 600,
        fontSize: 14,
        zIndex: 99999,
        animation: 'toastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        minWidth: 280,
        maxWidth: 400,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: config.bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon icon={config.icon} style={{ width: 24, height: 24, color: config.iconColor }} />
        </div>
        <div style={{ flex: 1 }}>
          {message}
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.5,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
          onMouseLeave={(e) => e.currentTarget.style.opacity = 0.5}
        >
          <Icon icon="mdi:close" style={{ width: 20, height: 20, color: '#94a3b8' }} />
        </button>
      </div>
      <style>{`
                @keyframes toastIn {
                    from {
                        opacity: 0;
                        transform: translateY(40px) translateX(-50%);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) translateX(-50%);
                    }
                }
            `}</style>
    </>
  );
}
