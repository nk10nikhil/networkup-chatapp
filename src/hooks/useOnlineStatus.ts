import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

export default function useOnlineStatus(userId: string | null | undefined) {
    const [isOnline, setIsOnline] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const { data: session, status } = useSession();

    // Use a ref to store the user ID to prevent closure issues in event handlers
    const userIdRef = useRef<string | null>(null);

    // Update the ref whenever session or userId changes
    useEffect(() => {
        if (session?.user?.id) {
            userIdRef.current = session.user.id;
        }
    }, [session?.user?.id]);

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

    // Function to mark the user as offline
    const markUserOffline = useCallback(async (id: string) => {
        try {
            // Use sendBeacon for reliable delivery during page unload
            if (navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify({ userId: id })], { type: 'application/json' });
                const success = navigator.sendBeacon('/api/users/offline', blob);

                if (!success) {
                    // Fallback to fetch with keepalive if sendBeacon fails
                    await fetch('/api/users/offline', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: id }),
                        keepalive: true
                    });
                }
            } else {
                // Fallback for browsers that don't support sendBeacon
                await fetch('/api/users/offline', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: id }),
                    keepalive: true
                });
            }
        } catch (error) {
            console.error('Failed to mark user as offline:', error);
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
            const heartbeatInterval = setInterval(updateOwnOnlineStatus, 30000); // Every 30 seconds

            // Initial heartbeat
            updateOwnOnlineStatus();

            return () => {
                clearInterval(heartbeatInterval);
                // Also mark user as offline when component unmounts (e.g., logout)
                markUserOffline(session.user.id);
            };
        }
    }, [session?.user, status, userId, updateOwnOnlineStatus, markUserOffline]);

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

    // Set up global event listeners for application closure
    useEffect(() => {
        if (!session?.user || status !== 'authenticated') return;

        // Only handle for current user
        if (userId !== session.user.id) return;

        // Register these events at the window level
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                updateOwnOnlineStatus();
            } else if (document.visibilityState === 'hidden' && userIdRef.current) {
                // Optional: You could mark user as "away" status when tab is hidden
                // For now, we'll just update the lastActive timestamp
                updateOwnOnlineStatus();
            }
        };

        const handleBeforeUnload = () => {
            // This function runs when the user closes the tab/browser
            if (userIdRef.current) {
                markUserOffline(userIdRef.current);
            }
        };

        const handleOffline = () => {
            // When browser detects network is offline, mark user as offline
            if (userIdRef.current) {
                markUserOffline(userIdRef.current);
            }
        };

        // Add event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('offline', handleOffline);

        // This is crucial! Also register with the document body for more reliable capture
        document.body.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            // Clean up event listeners
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('offline', handleOffline);
            document.body.removeEventListener('beforeunload', handleBeforeUnload);

            // Final attempt to mark user as offline when component unmounts
            if (userIdRef.current) {
                markUserOffline(userIdRef.current);
            }
        };
    }, [session?.user, status, userId, updateOwnOnlineStatus, markUserOffline]);

    return { isOnline, loading };
}