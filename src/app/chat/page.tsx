import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ChatLayout from '@/components/chat/ChatLayout';
import EmptyChatState from '@/components/chat/EmptyChatState';

export default async function ChatHomePage() {
    const session = await getServerSession(authOptions);

    // If not authenticated, redirect to login
    if (!session) {
        redirect('/login');
    }

    return (
        <ChatLayout currentUserId={session.user.id}>
            <EmptyChatState />
        </ChatLayout>
    );
}