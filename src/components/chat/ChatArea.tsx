"use client";

import { useEffect, useRef } from "react";
import { FiMoreHorizontal, FiPhone, FiVideo, FiArrowLeft } from "react-icons/fi";
import Message from "./Message";
import MessageInput from "./MessageInput";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useChat from "@/hooks/useChat";
import { ChatHeader } from "./ChatHeader";
import Spinner from "@/components/ui/Spinner";

interface ChatAreaProps {
    chatId: string;
    currentUserId: string;
    participant: {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    isMobile?: boolean;
}

export default function ChatArea({ chatId, currentUserId, participant, isMobile = false }: ChatAreaProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Use our enhanced hook for better real-time messaging
    const {
        messages,
        loading,
        error,
        sendMessage,
        markAsRead
    } = useChat(chatId, participant._id.toString());

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Mark messages as read when viewing the chat
    useEffect(() => {
        if (messages.length > 0) {
            markAsRead();
        }
    }, [messages, markAsRead]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return;
        await sendMessage(content);
        // Scroll happens automatically when messages state updates
    };

    const handleBackClick = () => {
        router.push('/chat');
    };

    return (
        <div className="flex flex-col h-full">
            {/* Chat header */}
            <ChatHeader
                participant={participant}
                isMobile={isMobile}
                onBackClick={handleBackClick}
                isOnline={!loading && messages.length > 0}
            />

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Spinner size="lg" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                            <span className="text-red-500 text-xl">!</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                            Error loading messages
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xs">
                            {error}
                        </p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 bg-primary-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <FiMoreHorizontal className="w-8 h-8 text-primary-500 dark:text-primary-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                            No messages yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xs">
                            Send a message to start the conversation with {participant.name}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {messages.map((message) => (
                            <Message
                                key={message._id.toString()}
                                message={message}
                                isCurrentUserMessage={message.sender === currentUserId}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Message input */}
            <MessageInput
                onSendMessage={handleSendMessage}
                isLoading={false} // The loading state is now handled by the optimistic UI
            />
        </div>
    );
}