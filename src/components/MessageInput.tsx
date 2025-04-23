import { useState } from 'react';
import { sendMessage } from '../lib/db'; // Assuming sendMessage is a function to handle message sending

const MessageInput = ({ recipientId }) => {
    const [message, setMessage] = useState('');

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message) return;

        try {
            await sendMessage(recipientId, message);
            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <form onSubmit={handleSendMessage} className="message-input">
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                required
            />
            <button type="submit">Send</button>
        </form>
    );
};

export default MessageInput;