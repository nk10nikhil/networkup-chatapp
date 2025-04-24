"use client";

import { useEffect, useRef, useState } from "react";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { useRouter } from "next/navigation";
import useChat from "@/hooks/useChat";
import { ChatHeader } from "./ChatHeader";
import Spinner from "@/components/ui/Spinner";
import EmptyChatState from "./EmptyChatState";

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

    // Local state to manage UI states
    const [showEmptyState, setShowEmptyState] = useState<boolean>(false);
    const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);
    const hasSetEmptyStateRef = useRef<boolean>(false);

    // Use our enhanced hook for real-time messaging
    const {
        messages,
        loading,
        error,
        sendMessage,
        markAsRead,
        sendingMessage,
        initialFetchCompleted
    } = useChat(chatId, participant._id.toString());

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Mark messages as read when viewing the chat
    useEffect(() => {
        if (messages.length > 0) {
            markAsRead();
        }
    }, [messages, markAsRead]);

    // Manage the initial loading state and empty chat determination
    useEffect(() => {
        // Only run this once when initial fetch completes
        if (initialFetchCompleted && !initialLoadComplete) {
            setInitialLoadComplete(true);

            // If we have no messages after initial load, show empty state permanently
            if (messages.length === 0 && !hasSetEmptyStateRef.current) {
                setShowEmptyState(true);
                hasSetEmptyStateRef.current = true;
            }
        }
    }, [initialFetchCompleted, messages.length, initialLoadComplete]);

    // If messages appear in an empty chat, hide the empty state
    useEffect(() => {
        if (showEmptyState && messages.length > 0) {
            setShowEmptyState(false);
        }
    }, [messages.length, showEmptyState]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return;

        // If this was an empty chat, hide the empty state permanently
        if (showEmptyState) {
            setShowEmptyState(false);
        }

        await sendMessage(content);
        scrollToBottom();
    };

    const handleBackClick = () => {
        router.push('/chat');
    };

    // Show loading spinner only during initial load
    const showLoading = loading && !initialLoadComplete;

    return (
        <div className="flex flex-col h-full">
            {/* Chat header */}
            <ChatHeader
                participant={participant}
                isMobile={isMobile}
                onBackClick={handleBackClick}
                isOnline={initialLoadComplete && messages.length > 0}
            />

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900">
                {showLoading ? (
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
                ) : showEmptyState ? (
                    <EmptyChatState participantName={participant.name} />
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
                isLoading={sendingMessage}
            />
        </div>
    );
}