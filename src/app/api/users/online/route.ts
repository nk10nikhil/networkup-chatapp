import { connectToDatabase } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// POST: Update user's online status
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const { db } = await connectToDatabase();

        // Update the user's lastActive timestamp
        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    lastActive: new Date(),
                    isOnline: true
                }
            }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating online status:', error);
        return NextResponse.json(
            { message: 'Something went wrong' },
            { status: 500 }
        );
    }
}

// GET: Check if a user is online
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
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { message: 'User ID is required' },
                { status: 400 }
            );
        }

        const { db } = await connectToDatabase();

        // Get the user's lastActive timestamp
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(userId) },
            { projection: { lastActive: 1 } }
        );

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        // Consider a user online if they've been active in the last 5 minutes
        const isOnline = user.lastActive &&
            new Date().getTime() - new Date(user.lastActive).getTime() < 5 * 60 * 1000;

        return NextResponse.json({ isOnline });
    } catch (error) {
        console.error('Error checking online status:', error);
        return NextResponse.json(
            { message: 'Something went wrong' },
            { status: 500 }
        );
    }
}