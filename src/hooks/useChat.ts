import { useState, useEffect, useCallback, useRef } from 'react';
import { MessageWithSender } from '@/utils/types';
import { useSession } from 'next-auth/react';
import { encryptMessage, decryptMessage, generateChatKey } from '@/lib/encryption';

export default function useChat(chatId: string | null, participantId: string | null) {
    const [messages, setMessages] = useState<MessageWithSender[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
    const [sendingMessage, setSendingMessage] = useState<boolean>(false);
    const [initialFetchCompleted, setInitialFetchCompleted] = useState<boolean>(false);
    const { data: session } = useSession();

    // Keep a reference of message IDs to prevent duplicates
    const messageIdsRef = useRef<Set<string>>(new Set());
    // Add a ref to track background polling
    const isBackgroundPollingRef = useRef<boolean>(false);
    // Use a ref to store the empty state status to prevent re-renders
    const isEmptyChatRef = useRef<boolean>(false);

    // Generate chat encryption key
    const chatKey = session?.user?.id && participantId
        ? generateChatKey(session.user.id, participantId)
        : null;

    // Fetch messages with time filtering to only get new ones
    const fetchMessages = useCallback(async (isInitialFetch = false) => {
        if (!chatId || !chatKey) {
            setLoading(false);
            setInitialFetchCompleted(true);
            return;
        }

        // Prevent concurrent background polling
        if (!isInitialFetch && isBackgroundPollingRef.current) {
            return; // Skip if already polling
        }

        try {
            // Only set loading true for initial fetch, not for background polling
            if (isInitialFetch) {
                setLoading(true);
                // Reset message IDs cache when doing a full refresh
                messageIdsRef.current = new Set();
            } else {
                // Set the background polling flag
                isBackgroundPollingRef.current = true;
            }

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

            if (isInitialFetch) {
                // For initial fetch, replace all messages and update ID cache
                const newMessageIds = new Set(decryptedMessages.map((m: MessageWithSender) => m._id.toString()));
                messageIdsRef.current = newMessageIds;

                // Set empty chat status for initial fetch
                isEmptyChatRef.current = decryptedMessages.length === 0;

                setMessages(decryptedMessages);
                setInitialFetchCompleted(true);
                setLastFetchTime(new Date());
            } else if (decryptedMessages.length > 0) {
                // Filter out any messages we already have in state
                const newMessages = decryptedMessages.filter(
                    (m: MessageWithSender) => !messageIdsRef.current.has(m._id.toString())
                );

                if (newMessages.length > 0) {
                    // Add new message IDs to our tracking set
                    newMessages.forEach((m: MessageWithSender) => {
                        messageIdsRef.current.add(m._id.toString());
                    });

                    // If we were previously empty, we're not anymore
                    if (isEmptyChatRef.current) {
                        isEmptyChatRef.current = false;
                    }

                    setMessages(prev => [...prev, ...newMessages]);
                    setLastFetchTime(new Date());
                }
            }
        } catch (err: any) {
            console.error('Error fetching messages:', err);
            if (isInitialFetch) {
                setError(err.message || 'Something went wrong');
            }
            // Still mark initial fetch as completed even on error
            if (isInitialFetch) {
                setInitialFetchCompleted(true);
            }
        } finally {
            if (isInitialFetch) {
                setLoading(false);
            } else {
                isBackgroundPollingRef.current = false;
            }
        }
    }, [chatId, chatKey, lastFetchTime]);

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
                createdAt: new Date(), // Using Date object instead of string
                pending: true,
                isOptimistic: true // Flag to identify optimistic updates
            };

            // If this was an empty chat, it's not anymore
            if (isEmptyChatRef.current) {
                isEmptyChatRef.current = false;
            }

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

            // Add the real message ID to our tracking set to prevent duplicates
            messageIdsRef.current.add(savedMessage._id.toString());

            // Replace optimistic message with the real one
            setMessages(prev =>
                prev.map(msg =>
                    msg._id === optimisticId
                        ? { ...savedMessage, content, pending: false } // Use decrypted content
                        : msg
                )
            );

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
    }, [chatId, chatKey, session]);

    // Initial fetch and polling setup
    useEffect(() => {
        let isMounted = true;

        if (chatId && chatKey) {
            // Initial fetch
            fetchMessages(true);

            // Set up polling for new messages
            const interval = setInterval(() => {
                // Only poll if the component is mounted, initial fetch is completed,
                // and no background polling is already in progress
                if (isMounted && initialFetchCompleted && !isBackgroundPollingRef.current) {
                    fetchMessages(false);
                }
            }, 3000);

            return () => {
                isMounted = false;
                clearInterval(interval);
            };
        } else {
            // Make sure we mark initialFetchCompleted even if we don't have a chat yet
            setInitialFetchCompleted(true);
            setLoading(false);
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

    // Check if the chat is currently empty
    const isEmpty = messages.length === 0 && initialFetchCompleted && !loading;

    return {
        messages,
        loading,
        error,
        sendMessage,
        markAsRead,
        refreshMessages: () => fetchMessages(true),
        sendingMessage,
        initialFetchCompleted,
        isEmpty
    };
}