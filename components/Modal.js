import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'max-w-sm',
    showCloseButton = true,
    icon,
    iconColor = 'text-blue-400',
    iconBgColor = 'bg-blue-600/20'
}) {
    const modalRef = useRef(null);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Click outside to close
    const handleOverlayClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                        className={`relative w-full ${maxWidth} bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        {(title || showCloseButton) && (
                            <div className="flex-shrink-0 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {icon && (
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgColor}`}>
                                            <Icon icon={icon} className={`w-5 h-5 ${iconColor}`} />
                                        </div>
                                    )}
                                    {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
                                </div>

                                {showCloseButton && (
                                    <button
                                        onClick={onClose}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700/50 hover:bg-slate-700 border border-white/5 transition-colors"
                                    >
                                        <Icon icon="mdi:close" className="w-5 h-5 text-slate-300" />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
