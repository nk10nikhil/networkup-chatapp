import { connectToDatabase } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// Mark messages as read
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { chatId } = await request.json();

        if (!chatId) {
            return NextResponse.json(
                { message: 'Chat ID is required' },
                { status: 400 }
            );
        }

        const { db } = await connectToDatabase();

        // Verify user is part of this chat
        const chat = await db.collection('chats').findOne({
            _id: new ObjectId(chatId),
            participants: session.user.id
        });

        if (!chat) {
            return NextResponse.json(
                { message: 'Chat not found or access denied' },
                { status: 404 }
            );
        }

        // Mark all messages from other participants as read
        const result = await db.collection('messages').updateMany(
            {
                chatId: new ObjectId(chatId),
                sender: { $ne: session.user.id },
                read: false
            },
            { $set: { read: true } }
        );

        return NextResponse.json({
            markedAsRead: result.modifiedCount,
        });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        return NextResponse.json(
            { message: 'Something went wrong' },
            { status: 500 }
        );
    }
}