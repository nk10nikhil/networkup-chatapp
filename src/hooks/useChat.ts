import { useState, useEffect, useCallback } from 'react';
import { MessageWithSender } from '@/utils/types';
import { useSession } from 'next-auth/react';
import { encryptMessage, decryptMessage, generateChatKey } from '@/lib/encryption';

export default function useChat(chatId: string | null, participantId: string | null) {
    const [messages, setMessages] = useState<MessageWithSender[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
    const [sendingMessage, setSendingMessage] = useState<boolean>(false);
    const { data: session } = useSession();

    // Generate chat encryption key
    const chatKey = session?.user?.id && participantId
        ? generateChatKey(session.user.id, participantId)
        : null;

    // Fetch messages with time filtering to only get new ones
    const fetchMessages = useCallback(async (isInitialFetch = false) => {
        if (!chatId || !chatKey) {
            setLoading(false);
            return;
        }

        try {
            if (isInitialFetch) setLoading(true);

            // Build URL with timestamp filter if not initial fetch
            let url = `/api/messages?chatId=${chatId}`;
            if (lastFetchTime && !isInitialFetch) {
                url += `&since=${lastFetchTime.toISOString()}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }

            const data = await response.json();

            // Decrypt messages
            const decryptedMessages = data.map((msg: MessageWithSender) => ({
                ...msg,
                content: decryptMessage(msg.content, chatKey)
            }));

            setLastFetchTime(new Date());

            if (isInitialFetch) {
                setMessages(decryptedMessages);
            } else if (decryptedMessages.length > 0) {
                // Only append new messages (avoid duplicates)
                const existingIds = new Set(messages.map(m => m._id.toString()));
                const newMessages = decryptedMessages.filter(
                    m => !existingIds.has(m._id.toString())
                );

                if (newMessages.length > 0) {
                    setMessages(prev => [...prev, ...newMessages]);
                }
            }
        } catch (err: any) {
            console.error('Error fetching messages:', err);
            setError(err.message || 'Something went wrong');
        } finally {
            if (isInitialFetch) setLoading(false);
        }
    }, [chatId, chatKey, lastFetchTime, messages]);

    // Send message with optimistic UI updates
    const sendMessage = useCallback(async (content: string) => {
        if (!chatId || !content.trim() || !chatKey || !session?.user) {
            return false;
        }

        const optimisticId = `temp-${Date.now()}`;
        setSendingMessage(true);

        try {
            // Encrypt message
            const encryptedContent = encryptMessage(content, chatKey);

            // Add optimistic message to UI immediately
            const optimisticMessage: MessageWithSender = {
                _id: optimisticId,
                chatId,
                sender: session.user.id,
                content, // Use decrypted content for display
                read: false,
                createdAt: new Date().toISOString(),
                pending: true,
                isOptimistic: true // Flag to identify optimistic updates
            };

            setMessages(prev => [...prev, optimisticMessage]);

            // Send to server
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

            const savedMessage = await response.json();

            // Replace optimistic message with the real one
            setMessages(prev =>
                prev.map(msg =>
                    msg._id === optimisticId
                        ? { ...savedMessage, content, pending: false } // Use decrypted content
                        : msg
                )
            );

            // Trigger a refresh to ensure we have the latest messages
            setTimeout(() => fetchMessages(), 300);

            return true;
        } catch (err) {
            console.error('Error sending message:', err);
            // Remove optimistic message on error - fixed ID comparison
            setMessages(prev => prev.filter(msg => msg._id !== optimisticId));
            setError('Failed to send message');
            return false;
        } finally {
            setSendingMessage(false);
        }
    }, [chatId, chatKey, session, fetchMessages]);

    // Initial fetch and polling setup
    useEffect(() => {
        if (chatId && chatKey) {
            fetchMessages(true);

            // Set up polling for new messages - adjust interval as needed
            const interval = setInterval(() => fetchMessages(), 3000);

            return () => clearInterval(interval);
        }
    }, [chatId, chatKey, fetchMessages]);

    // Mark messages as read
    const markAsRead = useCallback(async () => {
        if (!chatId || !session?.user) return;

        try {
            const response = await fetch('/api/messages/read', {
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

    return {
        messages,
        loading,
        error,
        sendMessage,
        markAsRead,
        refreshMessages: () => fetchMessages(true),
        sendingMessage
    };
}