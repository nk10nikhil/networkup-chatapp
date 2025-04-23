import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import MessageInput from './MessageInput';
import ChatList from './ChatList';
import { fetchMessages, sendMessage } from '../lib/db';
import { encryptMessage, decryptMessage, generateChatKey } from '../lib/encryption';
import { ObjectId } from 'mongodb';

interface ChatBoxProps {
    userId: string;
}

interface Message {
    _id?: string | ObjectId;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt?: Date;
    read?: boolean;
}

const ChatBox = ({ userId }: ChatBoxProps) => {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [chatKey, setChatKey] = useState<string>('');

    useEffect(() => {
        // Set the encryption key for this chat
        if (session?.user?.id) {
            const key = generateChatKey(session.user.id, userId);
            setChatKey(key);
        }
    }, [session?.user?.id, userId]);

    useEffect(() => {
        const loadMessages = async () => {
            if (session?.user?.id && chatKey) {
                const fetchedMessages = await fetchMessages(session.user.id, userId);
                const decryptedMessages = fetchedMessages.map(msg => ({
                    ...msg,
                    senderId: msg.senderId || '',
                    receiverId: msg.receiverId || '',
                    content: decryptMessage(msg.content, chatKey),
                })) as Message[];

                setMessages(decryptedMessages);
                setLoading(false);
            }
        };

        if (chatKey) {
            loadMessages();
        }
    }, [session, userId, chatKey]);

    const handleSendMessage = async (content: string) => {
        if (session?.user?.id && chatKey) {
            const encryptedContent = encryptMessage(content, chatKey);
            const newMessage: Message = {
                senderId: session.user.id,
                receiverId: userId,
                content: encryptedContent,
            };
            await sendMessage(newMessage);

            // Add the message with decrypted content to the UI
            setMessages(prevMessages => [
                ...prevMessages,
                { ...newMessage, content }
            ]);
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