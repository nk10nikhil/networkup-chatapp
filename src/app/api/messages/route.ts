import { connectToDatabase } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// Get messages for a specific chat
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const url = new URL(request.url);
        const chatId = url.searchParams.get('chatId');
        const since = url.searchParams.get('since');

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

        // Build query with optional timestamp filter
        let query: any = {
            chatId: new ObjectId(chatId)
        };

        if (since) {
            try {
                const sinceDate = new Date(since);
                query.createdAt = { $gt: sinceDate };
            } catch (e) {
                console.error('Invalid date format:', since);
            }
        }

        // Get messages for this chat
        const messages = await db.collection('messages')
            .find(query)
            .sort({ createdAt: 1 })
            .toArray();

        // Mark unread messages as read
        await db.collection('messages').updateMany(
            {
                chatId: new ObjectId(chatId),
                sender: { $ne: session.user.id },
                read: false
            },
            { $set: { read: true } }
        );

        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error getting messages:', error);
        return NextResponse.json(
            { message: 'Something went wrong' },
            { status: 500 }
        );
    }
}

// Send a new message
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { chatId, content } = await request.json();

        if (!chatId || !content) {
            return NextResponse.json(
                { message: 'Chat ID and content are required' },
                { status: 400 }
            );
        }

        const { db } = await connectToDatabase();

        // Verify the chat exists and user is a participant
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

        // Create new message
        const newMessage = {
            chatId: new ObjectId(chatId),
            sender: session.user.id,
            content,
            read: false,
            createdAt: new Date()
        };

        const result = await db.collection('messages').insertOne(newMessage);

        // Update last message in chat
        await db.collection('chats').updateOne(
            { _id: new ObjectId(chatId) },
            {
                $set: {
                    lastMessage: {
                        content,
                        sender: session.user.id,
                        createdAt: new Date()
                    },
                    updatedAt: new Date()
                }
            }
        );

        return NextResponse.json({
            ...newMessage,
            _id: result.insertedId
        });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            { message: 'Something went wrong' },
            { status: 500 }
        );
    }
}