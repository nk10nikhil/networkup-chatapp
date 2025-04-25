"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FiSearch, FiEdit2, FiMoreVertical, FiUser } from "react-icons/fi";
import { formatDate, truncateText, getInitials, getAvatarColor } from "@/utils/helpers";
import { ChatWithParticipant } from "@/utils/types";
import Image from "next/image";
import { decryptMessage, generateChatKey } from "@/lib/encryption";
import { useSession } from "next-auth/react";
import { RiContactsFill } from "react-icons/ri";

type ChatListProps = {
    currentUserId: string;
    onStartNewChat: () => void;
};

export default function ChatList({ currentUserId, onStartNewChat }: ChatListProps) {
    const [chats, setChats] = useState<ChatWithParticipant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();

    const fetchChats = useCallback(async () => {
        try {
            const response = await fetch("/api/chats");
            if (response.ok) {
                const data = await response.json();

                // Process and decrypt last messages if they exist
                const processedChats = data.map((chat: ChatWithParticipant) => {
                    if (chat.lastMessage && chat.lastMessage.content && session?.user?.id) {
                        // Try to decrypt the last message content
                        try {
                            const chatKey = generateChatKey(
                                session.user.id,
                                chat.participant._id.toString()
                            );

                            // Check if the content looks encrypted before trying to decrypt
                            if (chat.lastMessage.content.length > 20) {
                                chat.lastMessage.content = decryptMessage(
                                    chat.lastMessage.content,
                                    chatKey
                                );
                            }
                        } catch (error) {
                            console.error("Error decrypting message:", error);
                            // If decryption fails, show a placeholder
                            chat.lastMessage.content = "Encrypted message";
                        }
                    }
                    return chat;
                });

                setChats(processedChats);
            }
        } catch (error) {
            console.error("Failed to fetch chats:", error);
        } finally {
            setLoading(false);
        }
    }, [session?.user?.id]);

    useEffect(() => {
        fetchChats();

        // Setup polling to check for new messages
        const interval = setInterval(fetchChats, 5000);

        return () => clearInterval(interval);
    }, [fetchChats]);

    const filteredChats = chats.filter(chat => {
        if (!searchQuery) return true;

        const participant = chat.participant;
        return participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            participant.email.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleChatSelect = (chatId: string, userId: string) => {
        router.push(`/chat/${userId}`);
    };

    const isActive = (userId: string) => {
        return pathname === `/chat/${userId}`;
    };

    // Helper function to get the last message preview
    const getLastMessagePreview = (chat: ChatWithParticipant) => {
        if (!chat.lastMessage) return 'Start a conversation';

        // Determine if the last message was sent by the current user
        const isSentByCurrentUser = chat.lastMessage.sender === currentUserId;

        // Format the message with prefix based on sender
        const prefix = isSentByCurrentUser ? 'You: ' : '';
        return prefix + truncateText(chat.lastMessage.content, 30);
    };

    return (
        <div className="flex flex-col h-full border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        Conversations
                    </h2>
                    <button
                        onClick={onStartNewChat}
                        className="p-2 rounded-full bg-primary-100 dark:bg-gray-700 hover:bg-primary-200 dark:hover:bg-gray-600 transition-colors"
                        aria-label="Start new chat"
                    >
                        <RiContactsFill className="w-5 h-5 text-primary-700 dark:text-primary-300" />
                    </button>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white"
                    />
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="">Loading...</div>
                    </div>
                ) : filteredChats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 px-6 text-center">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2">
                            <FiUser className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                        </div>
                        {searchQuery ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No conversations match your search</p>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                No conversations yet. <br />
                                Start a new chat to begin messaging
                            </p>
                        )}
                    </div>
                ) : (
                    <ul>
                        {filteredChats.map((chat) => {
                            const participant = chat.participant;

                            return (
                                <li key={chat._id.toString()}>
                                    <button
                                        onClick={() => handleChatSelect(chat._id.toString(), participant._id.toString())}
                                        className={`w-full flex items-center p-3 text-left transition-colors ${isActive(participant._id.toString())
                                            ? 'bg-primary-50 dark:bg-gray-700'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            {participant.avatar ? (
                                                <Image
                                                    src={participant.avatar}
                                                    alt={participant.name}
                                                    width={48}
                                                    height={48}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getAvatarColor(participant._id.toString())}`}>
                                                    <span className="text-white font-medium">
                                                        {getInitials(participant.name)}
                                                    </span>
                                                </div>
                                            )}
                                            {chat.unreadCount > 0 && (
                                                <div className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                    {chat.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-3 flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline">
                                                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {participant.name}
                                                </h3>
                                                {chat.lastMessage?.createdAt && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatDate(new Date(chat.lastMessage.createdAt))}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-sm truncate ${chat.unreadCount > 0
                                                ? 'font-medium text-gray-900 dark:text-white'
                                                : 'text-gray-500 dark:text-gray-400'
                                                }`}>
                                                {getLastMessagePreview(chat)}
                                            </p>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}