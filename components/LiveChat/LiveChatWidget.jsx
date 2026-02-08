"use client";

import React, { useState, useEffect, useCallback } from 'react';
import ChatButton from './ChatButton';
import ChatWindow from './ChatWindow';
import { liveChatService } from '@/services/liveChatService';

const POLL_INTERVAL = 3000; // Poll every 3 seconds for new messages

const LiveChatWidget = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEnded, setIsEnded] = useState(false);
    const [token, setToken] = useState(null); // Managed state for token

    // Initialize auth token
    useEffect(() => {
        // Check both localStorage and sessionStorage for token
        const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    // Check for existing session on mount
    useEffect(() => {
        const storedSessionId = localStorage.getItem('chat_session_id');
        if (storedSessionId) {
            setSessionId(storedSessionId);
            // Fetch history if session exists
            fetchHistory(storedSessionId);
        }
    }, [token]);

    const fetchHistory = useCallback(async (sid) => {
        try {
            const history = await liveChatService.getHistory(sid, token);
            if (history.success) {
                setMessages(history.data.messages || []);
                if (history.data.status === 'ended') {
                    setIsEnded(true);
                }
            } else {
                // If session not found or error, clear local storage
                if (history.message === 'Chat session not found') {
                    clearSession();
                }
            }
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    }, [token]);

    // Poll for messages if chat is active and open
    useEffect(() => {
        let interval;
        if (isOpen && sessionId && !isEnded) {
            interval = setInterval(() => {
                fetchHistory(sessionId);
            }, POLL_INTERVAL);
        }
        return () => clearInterval(interval);
    }, [isOpen, sessionId, isEnded, fetchHistory]);

    const clearSession = () => {
        setSessionId(null);
        setMessages([]);
        setIsEnded(false);
        localStorage.removeItem('chat_session_id');
    };

    const startChat = async () => {
        setIsLoading(true);
        try {
            // For guest, name is optional. For auth, token handles it.
            // We can pass a generic name or nothing for guests.
            const name = token ? undefined : "Guest";
            const response = await liveChatService.startChat(name, token);

            if (response.success) {
                const newSessionId = response.data.session_id;
                setSessionId(newSessionId);
                localStorage.setItem('chat_session_id', newSessionId);
                setMessages([{
                    role: 'assistant',
                    content: response.data.message,
                    created_at: new Date().toISOString()
                }]);
                setIsEnded(false);
            }
        } catch (error) {
            console.error("Failed to start chat", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (message) => {
        if (!sessionId) {
            await startChat(); // Auto-start if no session
            // Note: In a real scenario, we'd need to wait for startChat to finish 
            // and then send the message. This requires refactoring or chaining.
            // For simplicity, let's assume the user has to click start or we handle it inside startChat flow.
            // A better UX is to start chat immediately upon opening or first message.
            // Let's rely on the user clicking the button, but if they type first, we handle it:
        }

        // Optimistic update
        const tempMessage = {
            role: 'user',
            content: message,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMessage]);
        setIsLoading(true);

        try {
            // If we didn't have a session, we start one now.
            let activeSessionId = sessionId;
            if (!activeSessionId) {
                const startRes = await liveChatService.startChat(token ? undefined : "Guest", token);
                if (startRes.success) {
                    activeSessionId = startRes.data.session_id;
                    setSessionId(activeSessionId);
                    localStorage.setItem('chat_session_id', activeSessionId);
                    // Add initial greeting if not present
                    if (startRes.data.message) {
                        setMessages(prev => [{
                            role: 'assistant',
                            content: startRes.data.message,
                            created_at: new Date().toISOString()
                        }, ...prev]);
                    }
                } else {
                    throw new Error("Failed to start session");
                }
            }

            const response = await liveChatService.sendMessage(activeSessionId, message, token);
            if (response.success) {
                // We can either append the response message or rely on polling/history refresh
                // The API returns the specific response message, so let's append it
                if (response.data.message) {
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: response.data.message,
                        created_at: new Date().toISOString()
                    }]);
                }

                if (response.data.ended) {
                    setIsEnded(true);
                }
            }
        } catch (error) {
            console.error("Failed to send message", error);
            // Remove optimistic message or show error
        } finally {
            setIsLoading(false);
        }
    };

    const handleEndChat = async () => {
        if (sessionId) {
            try {
                await liveChatService.endChat(sessionId, token);
                setIsEnded(true);
                // Optional: clear session locally immediately or keep it for history view
                // For now, keep it visible as "Chat Ended"
            } catch (error) {
                console.error("Failed to end chat", error);
            }
        }
    };

    const toggleChat = () => {
        if (!isOpen && !sessionId && !isEnded) {
            // Auto-start chat on first open if no previous session
            startChat();
        }
        setIsOpen(!isOpen);
    };

    const handleNewChat = () => {
        clearSession();
        // Optionally immediate start or wait for user input
        startChat();
    };

    return (
        <>
            {isOpen && (
                <ChatWindow
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onEndChat={handleEndChat}
                    onClose={() => setIsOpen(false)}
                    onNewChat={handleNewChat}
                    isLoading={isLoading}
                    isEnded={isEnded}
                />
            )}
            {!isOpen && (
                <ChatButton
                    isOpen={isOpen}
                    onClick={toggleChat}
                    notificationCount={0} // Can be wired up to unread count logic later
                    className={props.customPosition}
                />
            )}
        </>
    );
};

export default LiveChatWidget;
