import { connectToDatabase } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { forceMarkUserOffline, markInactiveUsersAsOffline } from '@/lib/status-manager';

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
            // Try to parse JSON body
            try {
                const body = await request.json().catch(() => ({}));
                userId = body?.userId;
            } catch (err) {
                // If parsing fails, check if userId is in URL
                const url = new URL(request.url);
                userId = url.searchParams.get('userId');
            }
        }

        // If we still don't have a userId, return bad request
        if (!userId) {
            return NextResponse.json(
                { message: 'User ID is required' },
                { status: 400 }
            );
        }

        // Use our status manager to mark the user as offline
        const result = await forceMarkUserOffline(userId);

        // While we're at it, clean up any other stale online statuses
        // This helps catch users whose browser didn't fire the beforeunload event
        await markInactiveUsersAsOffline();

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { message: result.error || 'Failed to update status' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error marking user as offline:', error);
        return NextResponse.json(
            { message: 'Something went wrong' },
            { status: 500 }
        );
    }
}