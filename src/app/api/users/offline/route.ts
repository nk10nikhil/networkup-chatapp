import { connectToDatabase } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// POST: Mark user as offline
export async function POST(request: NextRequest) {
    try {
        // Try to get the session
        const session = await getServerSession(authOptions);
        let userId;

        // If session exists, use that user ID
        if (session?.user) {
            userId = session.user.id;
        } else {
            // For beacon API or other cases where session might not be available
            // Check if request body contains userId
            try {
                const body = await request.json().catch(() => ({}));
                userId = body?.userId;
            } catch (err) {
                // If no body, check if userId is in URL
                const url = new URL(request.url);
                userId = url.searchParams.get('userId');
            }
        }

        // If we still don't have a userId, return unauthorized
        if (!userId) {
            return NextResponse.json(
                { message: 'User ID is required' },
                { status: 400 }
            );
        }

        // Connect to database and update user status
        const { db } = await connectToDatabase();

        // Mark the user as offline
        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    isOnline: false,
                    lastActive: new Date()
                }
            }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking user as offline:', error);
        return NextResponse.json(
            { message: 'Something went wrong' },
            { status: 500 }
        );
    }
}