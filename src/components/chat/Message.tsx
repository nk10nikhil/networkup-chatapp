import { useEffect, useRef } from 'react';
import { formatDate, getInitials, getAvatarColor } from '@/utils/helpers';
import Image from 'next/image';
import { MessageWithSender } from '@/utils/types';

type MessageProps = {
    message: MessageWithSender;
    isCurrentUserMessage: boolean;
};

export default function Message({ message, isCurrentUserMessage }: MessageProps) {
    const messageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Add animation class after component mounts
        if (messageRef.current) {
            messageRef.current.classList.add('message-animation');
        }
    }, []);

    // Format timestamp
    const timestamp = message.createdAt ? formatDate(new Date(message.createdAt)) : '';

    // Check if message is pending (optimistic update)
    const isPending = message.pending === true;

    return (
        <div
            ref={messageRef}
            className={`flex mb-4 opacity-0 ${isCurrentUserMessage ? 'justify-end' : 'justify-start'}`}
        >
            {!isCurrentUserMessage && message.senderDetails && (
                <div className="flex-shrink-0 mr-2">
                    {message.senderDetails.avatar ? (
                        <Image
                            src={message.senderDetails.avatar}
                            alt={message.senderDetails.name}
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-full object-cover"
                        />
                    ) : (
                        <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center ${getAvatarColor(message.sender)}`}
                        >
                            <span className="text-white text-xs font-medium">
                                {getInitials(message.senderDetails.name)}
                            </span>
                        </div>
                    )}
                </div>
            )}

            <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-message ${isCurrentUserMessage
                        ? isPending
                            ? 'bg-primary-400 text-white rounded-br-none'
                            : 'bg-primary-600 text-white rounded-br-none'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none'
                    } ${isPending ? 'opacity-80' : ''}`}
            >
                <div className="message-content">
                    {message.content}
                </div>
                <div
                    className={`text-xs mt-1 flex items-center ${isCurrentUserMessage ? 'text-primary-200' : 'text-gray-500 dark:text-gray-400'
                        }`}
                >
                    <span>{timestamp}</span>
                    {isCurrentUserMessage && (
                        <>
                            {isPending ? (
                                <span className="ml-1 flex items-center">
                                    <svg className="animate-spin -ml-0.5 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending
                                </span>
                            ) : (
                                <span className="ml-1">
                                    {message.read ? '• Read' : ''}
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>

            {isCurrentUserMessage && (
                <div className="flex-shrink-0 ml-2">
                    {/* Could add user avatar here for current user if desired */}
                </div>
            )}
        </div>
    );
}