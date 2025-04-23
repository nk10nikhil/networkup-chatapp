import React from 'react';
import { useEffect, useState } from 'react';
import { Message } from '../utils/types';

interface ChatListProps {
    messages?: any[]; // Use a more flexible type to accommodate differences
}

const ChatList: React.FC<ChatListProps> = ({ messages = [] }) => {
    const [chats, setChats] = useState<any[]>(messages);

    // If messages are passed as props, use them instead of fetching
    useEffect(() => {
        setChats(messages);
    }, [messages]);

    return (
        <div className="chat-list">
            {chats.length === 0 ? (
                <div className="no-messages">No messages yet</div>
            ) : (
                chats.map((chat, index) => (
                    <div key={chat._id || index} className="chat-item">
                        <span className="chat-user">
                            {chat.senderName || chat.sender || 'User'}
                        </span>
                        <span className="chat-message">{chat.content}</span>
                    </div>
                ))
            )}
        </div>
    );
};

export default ChatList;