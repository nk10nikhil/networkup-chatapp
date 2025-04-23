import React from 'react';
import { useEffect, useState } from 'react';
import { fetchChatList } from '../lib/db';
import { Message } from '../utils/types';

const ChatList: React.FC = () => {
    const [chats, setChats] = useState<Message[]>([]);
    
    useEffect(() => {
        const getChats = async () => {
            const chatData = await fetchChatList();
            setChats(chatData);
        };

        getChats();
    }, []);

    return (
        <div className="chat-list">
            {chats.map(chat => (
                <div key={chat._id} className="chat-item">
                    <span className="chat-user">{chat.senderName}</span>
                    <span className="chat-message">{chat.message}</span>
                </div>
            ))}
        </div>
    );
};

export default ChatList;