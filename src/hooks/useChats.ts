import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { ChatWithParticipant } from '@/utils/types';

export default function useChats() {
    const [chats, setChats] = useState<ChatWithParticipant[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
    const { data: session } = useSession();

    const fetchChats = useCallback(async (isInitialFetch = false) => {
        if (!session?.user) {
            setLoading(false);
            return;
        }

        try {
            if (isInitialFetch) setLoading(true);

            // Build URL with timestamp filter if not initial fetch
            let url = '/api/chats';
            if (lastFetchTime && !isInitialFetch) {
                url += `?since=${lastFetchTime.toISOString()}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch chats');
            }

            const data = await response.json();
            setLastFetchTime(new Date());

            if (isInitialFetch || data.length === 0) {
                setChats(data);
            } else {
                // Merge new/updated chats with existing ones
                const chatMap = new Map(chats.map(chat => [chat._id.toString(), chat]));

                // Update with new data
                data.forEach((chat: ChatWithParticipant) => {
                    chatMap.set(chat._id.toString(), chat);
                });

                // Sort by last activity
                const updatedChats = Array.from(chatMap.values()).sort((a, b) => {
                    const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
                    const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
                    return dateB.getTime() - dateA.getTime();
                });

                setChats(updatedChats);
            }
        } catch (err: any) {
            console.error('Error fetching chats:', err);
            setError(err.message || 'Something went wrong');
        } finally {
            if (isInitialFetch) setLoading(false);
        }
    }, [session, lastFetchTime, chats]);

    const createChat = useCallback(async (participantId: string) => {
        if (!session?.user) return null;

        try {
            // Optimistic update
            const optimisticChat: ChatWithParticipant = {
                _id: `temp-${Date.now()}`,
                participants: [session.user.id, participantId],
                participant: {
                    _id: participantId,
                    name: "Loading...",
                    email: "",
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
                unreadCount: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                isOptimistic: true
            };

            // Add optimistic chat to the list
            setChats(prev => [optimisticChat, ...prev]);

            const response = await fetch('/api/chats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ participantId }),
            });

            if (!response.ok) {
                throw new Error('Failed to create chat');
            }

            const chat = await response.json();

            // Replace optimistic chat with real one
            setChats(prev => [
                chat,
                ...prev.filter(c =>
                    c._id.toString() !== `temp-${Date.now()}` &&
                    c._id.toString() !== chat._id.toString()
                )
            ]);

            return chat;
        } catch (err) {
            // Remove optimistic chat on error
            setChats(prev => prev.filter(chat => !chat.isOptimistic));
            setError('Failed to create chat');
            return null;
        }
    }, [session]);

    // Add a method to update a chat's last message (for optimistic UI when sending messages)
    const updateChatLastMessage = useCallback((chatId: string, message: { content: string }) => {
        setChats(prev => prev.map(chat =>
            chat._id.toString() === chatId
                ? {
                    ...chat,
                    lastMessage: {
                        content: message.content,
                        sender: session?.user?.id || '',
                        createdAt: new Date()
                    },
                    updatedAt: new Date()
                }
                : chat
        ));
    }, [session]);

    useEffect(() => {
        fetchChats(true);

        // Poll for updates with shorter interval for better real-time feeling
        const interval = setInterval(() => fetchChats(), 5000);

        return () => clearInterval(interval);
    }, [fetchChats]);

    return {
        chats,
        loading,
        error,
        refreshChats: () => fetchChats(true),
        createChat,
        updateChatLastMessage
    };
}