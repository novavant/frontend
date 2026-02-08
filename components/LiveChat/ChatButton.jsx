"use client";

import React from 'react';
import { MessageCircle, X } from 'lucide-react';

const ChatButton = ({ isOpen, onClick, notificationCount = 0, className = '' }) => {
    return (
        <button
            onClick={onClick}
            className={`fixed z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-[#2563EB] hover:bg-[#e66e10]'
                } ${className || 'bottom-6 right-6'}`}
            aria-label={isOpen ? "Close chat" : "Open chat"}
        >
            {isOpen ? (
                <X className="h-6 w-6 text-white" />
            ) : (
                <div className="relative">
                    <MessageCircle className="h-6 w-6 text-white" />
                    {notificationCount > 0 && (
                        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm ring-2 ring-white">
                            {notificationCount}
                        </span>
                    )}
                </div>
            )}
        </button>
    );
};

export default ChatButton;
