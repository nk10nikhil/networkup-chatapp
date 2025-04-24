import { connectToDatabase } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { markInactiveUsersAsOffline } from '@/lib/status-manager';

// Define a shorter activity threshold for considering a user online (2 minutes)
const ACTIVITY_THRESHOLD = 2 * 60 * 1000;

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

        // Update the user's lastActive timestamp and set isOnline to true
        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    isOnline: true,
                    lastActive: new Date(),
                    lastUpdated: new Date()
                }
            }
        );

        // Always run the cleanup to ensure inactive users are marked offline quickly
        await markInactiveUsersAsOffline();

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

        // If checking own status, always return online
        if (userId === session.user.id) {
            return NextResponse.json({ isOnline: true });
        }

        const { db } = await connectToDatabase();

        // Get the user's online status directly from the database
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(userId) },
            { projection: { isOnline: 1, lastActive: 1 } }
        );

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        // First, always run cleanup to ensure we're not showing stale online statuses
        await markInactiveUsersAsOffline();

        // A user is considered online ONLY if:
        // 1. They have the isOnline flag set to true AND
        // 2. They have been active within the last 2 minutes
        const isRecentlyActive = user.lastActive &&
            (new Date().getTime() - new Date(user.lastActive).getTime() < ACTIVITY_THRESHOLD);

        const isUserOnline = user.isOnline === true && isRecentlyActive;

        return NextResponse.json({ isOnline: isUserOnline });
    } catch (error) {
        console.error('Error checking online status:', error);
        return NextResponse.json(
            { message: 'Something went wrong' },
            { status: 500 }
        );
    }
}