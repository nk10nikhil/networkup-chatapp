import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ObjectId } from 'mongodb';

type MongoDBFilter = {
    [key: string]: any;
};

// Get all users (except current user)
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

        // Get search query if present
        const url = new URL(request.url);
        const searchQuery = url.searchParams.get('search');

        let filter: MongoDBFilter = { _id: { $ne: session.user.id } };

        // Add search query if present
        if (searchQuery) {
            filter = {
                ...filter,
                $or: [
                    { name: { $regex: searchQuery, $options: 'i' } },
                    { email: { $regex: searchQuery, $options: 'i' } }
                ]
            };
        }

        // Get users (excluding current user and passwords)
        const users = await db.collection('users')
            .find(filter)
            .project({ password: 0 })
            .limit(20)
            .toArray();

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { message: 'Something went wrong' },
            { status: 500 }
        );
    }
}