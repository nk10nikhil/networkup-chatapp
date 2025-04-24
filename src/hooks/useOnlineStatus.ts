import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export default function useOnlineStatus(userId: string | null | undefined) {
    const [isOnline, setIsOnline] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const { data: session, status } = useSession();

    // Function to check another user's online status
    const checkUserOnlineStatus = useCallback(async (id: string) => {
        try {
            const response = await fetch(`/api/users/online?userId=${id}`);
            if (response.ok) {
                const data = await response.json();
                setIsOnline(data.isOnline);
            } else {
                console.error('Failed to check online status:', await response.text());
                setIsOnline(false);
            }
        } catch (error) {
            console.error('Error checking online status:', error);
            setIsOnline(false);
        } finally {
            setLoading(false);
        }
    }, []);

    // Function to update the current user's online status
    const updateOwnOnlineStatus = useCallback(async () => {
        if (!session?.user) return;

        try {
            await fetch('/api/users/online', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
        } catch (error) {
            console.error('Error updating own online status:', error);
        }
    }, [session?.user]);

    // Handle own online status updates
    useEffect(() => {
        // Skip if not authenticated or no session
        if (status !== 'authenticated' || !session?.user) return;

        // If we're checking the current user's status
        if (userId === session.user.id) {
            // Current user is always online
            setIsOnline(true);
            setLoading(false);

            // Setup heartbeat to keep the user online in the database
            const heartbeatInterval = setInterval(updateOwnOnlineStatus, 60000); // Every minute

            // Initial heartbeat
            updateOwnOnlineStatus();

            return () => {
                clearInterval(heartbeatInterval);
            };
        }
    }, [session?.user, status, userId, updateOwnOnlineStatus]);

    // Handle other users' online status
    useEffect(() => {
        // Skip if not authenticated or no user ID to check
        if (status !== 'authenticated' || !userId || !session?.user) return;

        // Skip if this is the current user (handled by the above effect)
        if (userId === session.user.id) return;

        // Initial check for the other user
        checkUserOnlineStatus(userId);

        // Set up polling to periodically check status
        const statusCheckInterval = setInterval(() => {
            checkUserOnlineStatus(userId);
        }, 10000); // Check every 10 seconds

        return () => {
            clearInterval(statusCheckInterval);
        };
    }, [userId, session?.user, status, checkUserOnlineStatus]);

    // Set up event listeners for page visibility and unload to update status
    useEffect(() => {
        if (!session?.user || status !== 'authenticated') return;

        // Check if this is your own status
        const isOwnStatus = userId === session.user.id;
        if (!isOwnStatus) return;

        // Handle page visibility change
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                updateOwnOnlineStatus();
            }
        };

        // Handle page unload (user leaves or closes tab)
        const handleBeforeUnload = () => {
            // Use navigator.sendBeacon for reliable delivery during page unload
            navigator.sendBeacon('/api/users/offline', JSON.stringify({
                userId: session.user.id
            }));
        };

        // Add event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            // Clean up event listeners
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);

            // When component unmounts, try to mark user as offline
            fetch('/api/users/offline', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Modern browsers support keepalive for fetch
                keepalive: true
            }).catch(err => console.error('Failed to mark as offline on unmount:', err));
        };
    }, [session?.user, status, userId, updateOwnOnlineStatus]);

    return { isOnline, loading };
}