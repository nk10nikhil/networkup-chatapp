import { connectToDatabase } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';

// POST: Mark user as offline
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

        // Mark the user as offline
        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    lastActive: new Date(),
                    isOnline: false
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