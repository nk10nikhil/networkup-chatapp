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
                        ? 'bg-primary-600 text-white rounded-br-none'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none'
                    }`}
            >
                <div className="message-content">
                    {message.content}
                </div>
                <div
                    className={`text-xs mt-1 ${isCurrentUserMessage ? 'text-primary-200' : 'text-gray-500 dark:text-gray-400'
                        }`}
                >
                    {timestamp}
                    {isCurrentUserMessage && (
                        <span className="ml-1">
                            {message.read ? '• Read' : ''}
                        </span>
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