import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageWithSender } from '@/utils/types';
import { useSession } from 'next-auth/react';
import { encryptMessage, decryptMessage, generateChatKey } from '@/lib/encryption';

export default function useChat(chatId: string | null, participantId: string | null) {
    const [messages, setMessages] = useState<MessageWithSender[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { data: session } = useSession();
    const [socket, setSocket] = useState<Socket | null>(null);

    // Generate chat encryption key
    const chatKey = session?.user?.id && participantId
        ? generateChatKey(session.user.id, participantId)
        : null;

    // Connect to socket
    useEffect(() => {
        if (!session?.user) return;

        const socketInstance = io({
            path: '/api/socket',
            auth: {
                token: session.user.id,
            },
        });

        socketInstance.on('connect', () => {
            console.log('Socket connected');
        });

        socketInstance.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
            setError('Failed to connect to real-time service');
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [session]);

    // Join chat room when chatId changes
    useEffect(() => {
        if (!socket || !chatId) return;

        // Join the chat room
        socket.emit('join_chat', chatId);

        return () => {
            // Leave the chat room
            socket.emit('leave_chat', chatId);
        };
    }, [socket, chatId]);

    // Listen for new messages
    useEffect(() => {
        if (!socket || !chatKey) return;

        const handleNewMessage = (message: MessageWithSender) => {
            // Decrypt the message
            const decryptedMessage = {
                ...message,
                content: decryptMessage(message.content, chatKey)
            };

            setMessages(prev => [...prev, decryptedMessage]);
        };

        socket.on('new_message', handleNewMessage);

        return () => {
            socket.off('new_message', handleNewMessage);
        };
    }, [socket, chatKey]);

    // Fetch messages
    const fetchMessages = useCallback(async () => {
        if (!chatId || !chatKey) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`/api/messages?chatId=${chatId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }

            const data = await response.json();

            // Decrypt messages
            const decryptedMessages = data.map((msg: MessageWithSender) => ({
                ...msg,
                content: decryptMessage(msg.content, chatKey)
            }));

            setMessages(decryptedMessages);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }, [chatId, chatKey]);

    // Send message
    const sendMessage = useCallback(async (content: string) => {
        if (!chatId || !content.trim() || !chatKey || !session?.user) {
            return false;
        }

        try {
            // Encrypt message
            const encryptedContent = encryptMessage(content, chatKey);

            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chatId,
                    content: encryptedContent,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            // Message will be added via socket
            return true;
        } catch (err) {
            setError('Failed to send message');
            return false;
        }
    }, [chatId, chatKey, session?.user]);

    // Mark messages as read
    const markAsRead = useCallback(async () => {
        if (!chatId || !session?.user) return;

        try {
            const response = await fetch(`/api/messages/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ chatId }),
            });

            if (!response.ok) {
                console.error('Failed to mark messages as read');
            }
        } catch (err) {
            console.error('Error marking messages as read:', err);
        }
    }, [chatId, session?.user]);

    // Initial fetch
    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    return {
        messages,
        loading,
        error,
        sendMessage,
        markAsRead,
        refreshMessages: fetchMessages,
    };
}