import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

export default function useOnlineStatus(userId: string | null | undefined) {
    const [isOnline, setIsOnline] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const { data: session } = useSession();

    // Use a ref to track if this is the current user
    const isCurrentUser = useRef<boolean>(false);

    // Set isCurrentUser ref on component mount and when session/userId changes
    useEffect(() => {
        if (session?.user?.id && userId) {
            isCurrentUser.current = session.user.id === userId;
        }
    }, [session, userId]);

    // Function to check if a user is online
    const checkOnlineStatus = useCallback(async (id: string) => {
        if (!id) return;

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

    // Update current user's online status
    const updateOnlineStatus = useCallback(async () => {
        if (!session?.user?.id) return;

        try {
            const response = await fetch('/api/users/online', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                console.error('Failed to update online status:', await response.text());
            }
        } catch (error) {
            console.error('Error updating online status:', error);
        }
    }, [session]);

    // Mark the user as offline
    const markAsOffline = useCallback(async () => {
        if (!session?.user?.id) return;

        try {
            const response = await fetch('/api/users/offline', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Use keepalive to ensure the request completes even if the page is closed
                keepalive: true
            });

            if (!response.ok) {
                console.error('Failed to mark as offline:', await response.text());
            }
        } catch (error) {
            console.error('Error marking as offline:', error);
        }
    }, [session]);

    // Periodically update current user's online status
    useEffect(() => {
        // Only update if this is the current user
        if (!isCurrentUser.current || !session?.user?.id) return;

        // Initial update on mount
        updateOnlineStatus();

        // Set up interval to keep updating the online status
        const updateInterval = setInterval(() => {
            updateOnlineStatus();
        }, 30000); // Every 30 seconds

        return () => {
            clearInterval(updateInterval);
            // When component unmounts, mark user as offline if this is the current user
            markAsOffline();
        };
    }, [updateOnlineStatus, markAsOffline, session, isCurrentUser]);

    // Check other user's online status
    useEffect(() => {
        if (!userId || !session?.user?.id) {
            setLoading(false);
            return;
        }

        // Check if this is someone else (not the current user)
        if (!isCurrentUser.current) {
            // Initial check
            checkOnlineStatus(userId);

            // Set up polling to check status periodically
            const checkInterval = setInterval(() => {
                checkOnlineStatus(userId);
            }, 15000); // Every 15 seconds

            return () => clearInterval(checkInterval);
        }
    }, [userId, checkOnlineStatus, session, isCurrentUser]);

    // Handle page visibility changes to update online status
    useEffect(() => {
        // Only handle for current user
        if (!isCurrentUser.current || !session?.user?.id) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // User is back, mark as online
                updateOnlineStatus();
            } else {
                // Tab is hidden, consider updating status less frequently
                // or potentially marking as "away" in a more sophisticated system
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [updateOnlineStatus, session, isCurrentUser]);

    // Use the Page Visibility API and beforeunload to detect when the user leaves
    useEffect(() => {
        // Only handle for current user
        if (!isCurrentUser.current || !session?.user?.id) return;

        const handleBeforeUnload = () => {
            // Try to mark the user as offline before the page closes
            // Use the navigator.sendBeacon API which is designed for this purpose
            navigator.sendBeacon('/api/users/offline', '');
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [session, isCurrentUser]);

    // If this is the current user, we know they're online
    if (isCurrentUser.current) {
        return { isOnline: true, loading: false };
    }

    return { isOnline, loading };
}