import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import ChatLayout from '@/components/chat/ChatLayout';
import ChatArea from '@/components/chat/ChatArea';
import { ObjectId } from 'mongodb';
import { notFound } from 'next/navigation';

interface ChatPageProps {
    params: {
        userId: string;
    };
}

export default async function ChatPage({ params }: ChatPageProps) {
    const session = await getServerSession(authOptions);

    // If not authenticated, redirect to login
    if (!session) {
        redirect('/login');
    }

    const { userId } = params;

    // Validate userId format
    if (!ObjectId.isValid(userId)) {
        notFound();
    }

    try {
        const { db } = await connectToDatabase();

        // Get participant details
        const participant = await db.collection('users').findOne(
            { _id: new ObjectId(userId) },
            { projection: { password: 0 } }  // Exclude password
        );

        if (!participant) {
            notFound();
        }

        // Find existing chat or create a new one
        let chat = await db.collection('chats').findOne({
            participants: { $all: [session.user.id, userId] }
        });

        if (!chat) {
            // Create new chat
            const result = await db.collection('chats').insertOne({
                participants: [session.user.id, userId],
                createdAt: new Date(),
                updatedAt: new Date()
            });

            chat = {
                _id: result.insertedId,
                participants: [session.user.id, userId],
                createdAt: new Date(),
                updatedAt: new Date()
            };
        }

        return (
            <ChatLayout currentUserId={session.user.id}>
                <ChatArea
                    chatId={chat._id.toString()}
                    currentUserId={session.user.id}
                    participant={{
                        _id: participant._id.toString(),
                        name: participant.name,
                        email: participant.email,
                        avatar: participant.avatar
                    }}
                />
            </ChatLayout>
        );
    } catch (error) {
        console.error("Error getting chat details:", error);
        return <div>Something went wrong</div>;
    }
}