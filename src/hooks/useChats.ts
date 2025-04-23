import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { ChatWithParticipant } from '@/utils/types';

export default function useChats() {
    const [chats, setChats] = useState<ChatWithParticipant[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { data: session } = useSession();

    const fetchChats = useCallback(async () => {
        if (!session?.user) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/chats');

            if (!response.ok) {
                throw new Error('Failed to fetch chats');
            }

            const data = await response.json();
            setChats(data);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }, [session]);

    const createChat = useCallback(async (participantId: string) => {
        if (!session?.user) return null;

        try {
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

            // Update chat list
            setChats(prev => [chat, ...prev.filter(c => c._id.toString() !== chat._id.toString())]);

            return chat;
        } catch (err) {
            setError('Failed to create chat');
            return null;
        }
    }, [session]);

    useEffect(() => {
        fetchChats();

        // Poll for updates
        const interval = setInterval(fetchChats, 10000);

        return () => clearInterval(interval);
    }, [fetchChats]);

    return {
        chats,
        loading,
        error,
        refreshChats: fetchChats,
        createChat,
    };
}