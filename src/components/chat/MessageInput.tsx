"use client";

import { useState, useRef, FormEvent } from 'react';
import { FiSend, FiPaperclip, FiSmile } from 'react-icons/fi';

type MessageInputProps = {
    onSendMessage: (message: string) => void;
    isLoading?: boolean;
};

export default function MessageInput({ onSendMessage, isLoading = false }: MessageInputProps) {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (message.trim() && !isLoading) {
            onSendMessage(message);
            setMessage('');

            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    // Auto-resize textarea based on content
    const handleInput = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <div className="flex items-end space-x-2">
                <button
                    title='Attach file'
                    type="button"
                    className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    disabled={isLoading}
                >
                    <FiPaperclip className="w-5 h-5" />
                </button>

                <div className="flex-grow relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onInput={handleInput}
                        placeholder="Type a message..."
                        rows={1}
                        className="w-full resize-none py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        style={{ maxHeight: '150px' }}
                        disabled={isLoading}
                    />

                    <button
                        title='Emoji picker'
                        type="button"
                        className="absolute right-3 bottom-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        disabled={isLoading}
                    >
                        <FiSmile className="w-5 h-5" />
                    </button>
                </div>

                <button
                    type="submit"
                    className={`flex-shrink-0 p-3 rounded-full text-white ${message.trim() && !isLoading
                            ? 'bg-primary-600 hover:bg-primary-700'
                            : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                        }`}
                    disabled={!message.trim() || isLoading}
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <FiSend className="w-5 h-5" />
                    )}
                </button>
            </div>
        </form>
    );
}