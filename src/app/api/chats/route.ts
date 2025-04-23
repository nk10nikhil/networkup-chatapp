import { connectToDatabase } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// Get all chats for the current user
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
        const since = url.searchParams.get('since');

        const { db } = await connectToDatabase();

        // Build query with optional timestamp filter
        let query: any = {
            participants: session.user.id
        };

        if (since) {
            try {
                const sinceDate = new Date(since);
                query.updatedAt = { $gt: sinceDate };
            } catch (e) {
                console.error('Invalid date format:', since);
            }
        }

        // Get chats where current user is a participant
        const chats = await db.collection('chats')
            .find(query)
            .sort({ updatedAt: -1 })
            .toArray();

        if (chats.length === 0) {
            return NextResponse.json([]);
        }

        // Get all participant IDs except current user
        const participantIds = new Set<string>();
        chats.forEach(chat => {
            chat.participants.forEach((participant: string) => {
                if (participant !== session.user!.id) {
                    participantIds.add(participant);
                }
            });
        });

        // Get user details for all participants
        const users = await db.collection('users')
            .find({ _id: { $in: Array.from(participantIds).map(id => new ObjectId(id)) } })
            .project({ password: 0 }) // Exclude passwords
            .toArray();

        // Create a map of user details by ID for easy lookup
        const userMap = new Map();
        users.forEach(user => {
            userMap.set(user._id.toString(), {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            });
        });

        // Count unread messages for each chat
        const unreadCounts = await Promise.all(
            chats.map(async chat => {
                const count = await db.collection('messages').countDocuments({
                    chatId: chat._id,
                    sender: { $ne: session.user!.id },
                    read: false
                });
                return { chatId: chat._id.toString(), count };
            })
        );

        const unreadMap = new Map();
        unreadCounts.forEach(item => {
            unreadMap.set(item.chatId, item.count);
        });

        // Format chats with participant details
        const formattedChats = chats.map(chat => {
            const otherParticipantId = chat.participants.find(
                (id: string) => id !== session.user!.id
            );

            const participant = userMap.get(otherParticipantId);
            const unreadCount = unreadMap.get(chat._id.toString()) || 0;

            return {
                ...chat,
                participant,
                unreadCount
            };
        });

        return NextResponse.json(formattedChats);
    } catch (error) {
        console.error('Error fetching chats:', error);
        return NextResponse.json(
            { message: 'Something went wrong' },
            { status: 500 }
        );
    }
}

// Create a new chat
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { participantId } = await request.json();

        if (!participantId) {
            return NextResponse.json(
                { message: 'Participant ID is required' },
                { status: 400 }
            );
        }

        const { db } = await connectToDatabase();

        // Check if participant exists
        const participant = await db.collection('users').findOne({
            _id: new ObjectId(participantId)
        });

        if (!participant) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        // Check if chat already exists between these users
        const existingChat = await db.collection('chats').findOne({
            participants: {
                $all: [session.user.id, participantId]
            }
        });

        if (existingChat) {
            return NextResponse.json(existingChat);
        }

        // Create new chat
        const newChat = {
            participants: [session.user.id, participantId],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('chats').insertOne(newChat);

        // Get participant details
        const participantDetails = {
            _id: participant._id,
            name: participant.name,
            email: participant.email,
            avatar: participant.avatar
        };

        return NextResponse.json({
            ...newChat,
            _id: result.insertedId,
            participant: participantDetails,
            unreadCount: 0
        });
    } catch (error) {
        console.error('Error creating chat:', error);
        return NextResponse.json(
            { message: 'Something went wrong' },
            { status: 500 }
        );
    }
}