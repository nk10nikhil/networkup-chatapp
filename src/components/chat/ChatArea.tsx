"use client";

import { useState, useEffect, useRef } from "react";
import { FiMoreHorizontal, FiPhone, FiVideo, FiArrowLeft } from "react-icons/fi";
import { MessageWithSender } from "@/utils/types";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { getInitials, getAvatarColor } from "@/utils/helpers";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { encryptMessage, decryptMessage, generateChatKey } from "@/lib/encryption";

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
    const [messages, setMessages] = useState<MessageWithSender[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Generate encryption key for this chat
    const chatKey = generateChatKey(currentUserId, participant._id.toString());

    const fetchMessages = async () => {
        try {
            const response = await fetch(`/api/messages?chatId=${chatId}`);

            if (response.ok) {
                const fetchedMessages = await response.json();

                // Decrypt messages
                const decryptedMessages = fetchedMessages.map((msg: MessageWithSender) => ({
                    ...msg,
                    content: decryptMessage(msg.content, chatKey),
                    senderDetails: msg.sender === participant._id.toString() ? {
                        name: participant.name,
                        avatar: participant.avatar
                    } : undefined
                }));

                setMessages(decryptedMessages);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (chatId) {
            setLoading(true);
            fetchMessages();

            // Poll for new messages
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [chatId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return;

        setSending(true);

        try {
            // Encrypt message before sending
            const encryptedContent = encryptMessage(content, chatKey);

            const response = await fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chatId,
                    content: encryptedContent,
                }),
            });

            if (response.ok) {
                const newMessage = await response.json();
                // Add the decrypted message to the UI
                setMessages(prevMessages => [
                    ...prevMessages,
                    {
                        ...newMessage,
                        content, // Use the original content for display
                        createdAt: new Date(),
                    }
                ]);
                scrollToBottom();
            }
        } catch (error) {
            console.error("Error sending message:", error);
            // Handle error (show toast, etc.)
        } finally {
            setSending(false);
        }
    };

    const handleBackClick = () => {
        router.push('/chat');
    };

    return (
        <div className="flex flex-col h-full">
            {/* Chat header */}
            <div className="flex items-center px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                {isMobile && (
                    <button
                        onClick={handleBackClick}
                        className="mr-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                )}

                <div className="flex items-center flex-1">
                    {participant.avatar ? (
                        <Image
                            src={participant.avatar}
                            alt={participant.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor(participant._id.toString())}`}>
                            <span className="text-white font-medium">
                                {getInitials(participant.name)}
                            </span>
                        </div>
                    )}

                    <div className="ml-3">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                            {participant.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {loading ? "Loading..." : messages.length > 0 ? "Online" : "Start a conversation"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <FiPhone className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <FiVideo className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <FiMoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="loader">Loading messages...</div>
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
            <MessageInput onSendMessage={handleSendMessage} isLoading={sending} />
        </div>
    );
}