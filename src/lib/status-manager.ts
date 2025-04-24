import { connectToDatabase } from './db';
import { ObjectId } from 'mongodb';

// Reduce the time threshold for considering a user inactive (2 minutes in milliseconds)
// This ensures faster detection when someone closes the app
const INACTIVE_THRESHOLD = 2 * 60 * 1000;

/**
 * Mark users as offline if they haven't been active for the specified threshold
 * This function can be called from API routes or scheduled tasks
 */
export async function markInactiveUsersAsOffline() {
    try {
        const { db } = await connectToDatabase();

        // Calculate the cutoff time for inactivity
        const cutoffTime = new Date(Date.now() - INACTIVE_THRESHOLD);

        // Find all users who are marked as online but haven't been active recently
        const result = await db.collection('users').updateMany(
            {
                isOnline: true,
                lastActive: { $lt: cutoffTime }
            },
            {
                $set: {
                    isOnline: false,
                    lastUpdated: new Date()
                }
            }
        );

        return {
            success: true,
            markedOffline: result.modifiedCount
        };
    } catch (error) {
        console.error('Failed to mark inactive users as offline:', error);
        return {
            success: false,
            error: 'Failed to update user statuses'
        };
    }
}

/**
 * Force mark a specific user as offline
 * Useful for logout flows or admin actions
 */
export async function forceMarkUserOffline(userId: string) {
    try {
        if (!userId) return { success: false, error: 'No user ID provided' };

        const { db } = await connectToDatabase();

        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    isOnline: false,
                    lastActive: new Date(),
                    lastUpdated: new Date()
                }
            }
        );

        return { success: true };
    } catch (error) {
        console.error(`Failed to force mark user ${userId} as offline:`, error);
        return {
            success: false,
            error: 'Failed to update user status'
        };
    }
}