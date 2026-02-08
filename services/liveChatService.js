const BASE_URL = 'https://api.novavant.com/v3';

const getHeaders = (token) => {
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const liveChatService = {
    startChat: async (name, token) => {
        try {
            const response = await fetch(`${BASE_URL}/livechat/start`, {
                method: 'POST',
                headers: getHeaders(token),
                body: JSON.stringify({ name }),
            });
            return await response.json();
        } catch (error) {
            console.error('Error starting chat:', error);
            throw error;
        }
    },

    sendMessage: async (sessionId, message, token) => {
        try {
            const response = await fetch(`${BASE_URL}/livechat/${sessionId}/message`, {
                method: 'POST',
                headers: getHeaders(token),
                body: JSON.stringify({ message }),
            });
            return await response.json();
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    getHistory: async (sessionId, token) => {
        try {
            const response = await fetch(`${BASE_URL}/livechat/${sessionId}/history`, {
                method: 'GET',
                headers: getHeaders(token),
            });
            return await response.json();
        } catch (error) {
            console.error('Error getting history:', error);
            throw error;
        }
    },

    endChat: async (sessionId, token) => {
        try {
            const response = await fetch(`${BASE_URL}/livechat/${sessionId}/end`, {
                method: 'POST',
                headers: getHeaders(token),
            });
            return await response.json();
        } catch (error) {
            console.error('Error ending chat:', error);
            throw error;
        }
    }
};
