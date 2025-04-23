import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import MessageInput from './MessageInput';
import ChatList from './ChatList';
import { fetchMessages, sendMessage } from '../lib/db';
import { encryptMessage, decryptMessage } from '../lib/encryption';

const ChatBox = ({ userId }) => {
    const { data: session } = useSession();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMessages = async () => {
            if (session) {
                const fetchedMessages = await fetchMessages(session.user.id, userId);
                const decryptedMessages = fetchedMessages.map(msg => ({
                    ...msg,
                    content: decryptMessage(msg.content),
                }));
                setMessages(decryptedMessages);
                setLoading(false);
            }
        };

        loadMessages();
    }, [session, userId]);

    const handleSendMessage = async (content) => {
        if (session) {
            const encryptedContent = encryptMessage(content);
            const newMessage = {
                senderId: session.user.id,
                receiverId: userId,
                content: encryptedContent,
            };
            await sendMessage(newMessage);
            setMessages(prevMessages => [...prevMessages, newMessage]);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <ChatList messages={messages} />
            <MessageInput onSendMessage={handleSendMessage} />
        </div>
    );
};

export default ChatBox;