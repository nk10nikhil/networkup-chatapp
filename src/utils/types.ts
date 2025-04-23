export interface User {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Message {
    _id: string;
    chatId: string;
    sender: string;
    content: string; // This will store encrypted content
    createdAt: Date;
    read: boolean;
}

export interface Chat {
    _id: string;
    participants: string[]; // User IDs
    lastMessage?: {
        content: string;
        sender: string;
        createdAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
    isOptimistic?: boolean; // Flag for optimistic UI updates
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

export type MessageWithSender = Message & {
    senderDetails?: {
        name: string;
        avatar?: string;
    };
    pending?: boolean;      // Indicates an optimistic update that's still sending
    isOptimistic?: boolean; // Flag to identify optimistic (temporary) messages
}

export type ChatWithParticipant = Chat & {
    participant: User;
    unreadCount: number;
}