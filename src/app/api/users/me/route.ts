import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

// Get current user details
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { db } = await connectToDatabase();

        // Get current user details (excluding password)
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(session.user.id) },
            { projection: { password: 0 } }
        );

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        });
    } catch (error) {
        console.error('Error fetching current user:', error);
        return NextResponse.json(
            { message: 'Something went wrong' },
            { status: 500 }
        );
    }
}

// Update current user details
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { name, avatar } = await request.json();

        // Validate input
        if (!name) {
            return NextResponse.json(
                { message: 'Name is required' },
                { status: 400 }
            );
        }

        const { db } = await connectToDatabase();

        // Update user
        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(session.user.id) },
            {
                $set: {
                    name,
                    avatar: avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(name)}`,
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Profile updated successfully',
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { message: 'Something went wrong' },
            { status: 500 }
        );
    }
}