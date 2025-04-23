import { User, ChatWithParticipant, Chat } from "./types";

/**
 * Format date to a readable string
 * @param date Date to format
 */
export function formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const day = 24 * 60 * 60 * 1000;

    if (diff < day) {
        // Today, format as time
        return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
        }).format(date);
    } else if (diff < 2 * day) {
        // Yesterday
        return 'Yesterday';
    } else if (diff < 7 * day) {
        // Within the last week, show day name
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
        }).format(date);
    } else {
        // Older, show date
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
        }).format(date);
    }
}

/**
 * Truncate text to specified length
 * @param text Text to truncate
 * @param maxLength Maximum length
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
}

/**
 * Format chats with participant details
 * @param chats List of chats
 * @param currentUserId Current user ID
 * @param users Map of user details
 * @param unreadMessages Map of unread message counts per chat
 */
export function formatChatsWithParticipants(
    chats: Chat[],
    currentUserId: string,
    users: Map<string, User>,
    unreadMessages: Map<string, number>
): ChatWithParticipant[] {
    return chats.map(chat => {
        // Find the other participant (not current user)
        const otherParticipantId = chat.participants.find(id => id !== currentUserId) || '';
        const participant = users.get(otherParticipantId);
        const unreadCount = unreadMessages.get(chat._id) || 0;

        return {
            ...chat,
            participant: participant as User,
            unreadCount,
        };
    });
}

/**
 * Get initials from name
 * @param name Full name
 */
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

/**
 * Generate avatar color based on user ID
 * @param userId User ID
 */
export function getAvatarColor(userId: string): string {
    // Generate a deterministic color based on the user ID
    const colors = [
        'bg-blue-500',
        'bg-green-500',
        'bg-yellow-500',
        'bg-red-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-teal-500',
        'bg-orange-500',
        'bg-cyan-500',
    ];

    // Simple hash function to select a color based on userId
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
}