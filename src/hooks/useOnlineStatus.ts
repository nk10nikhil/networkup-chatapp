import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

export default function useOnlineStatus(userId: string | null | undefined) {
    const [isOnline, setIsOnline] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const { data: session, status } = useSession();

    // Use a ref to store the user ID for event handlers
    const userIdRef = useRef<string | null>(null);

    // Track if the component is mounted
    const isMountedRef = useRef<boolean>(true);

    // Update the ref whenever session or userId changes
    useEffect(() => {
        if (session?.user?.id) {
            userIdRef.current = session.user.id;
        }

        return () => {
            isMountedRef.current = false;
        };
    }, [session?.user?.id]);

    // Function to check another user's online status
    const checkUserOnlineStatus = useCallback(async (id: string) => {
        if (!isMountedRef.current) return;

        try {
            // Add cache-busting parameter to prevent browser caching
            const response = await fetch(`/api/users/online?userId=${id}&t=${Date.now()}`);
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
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, []);

    // Function to mark the user as offline - with multiple methods for reliability
    const markUserOffline = useCallback(async (id: string) => {
        try {
            // Try ALL methods simultaneously for fastest response

            // Method 1: Use sendBeacon (most reliable during page unload)
            if (navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify({ userId: id })], { type: 'application/json' });
                navigator.sendBeacon('/api/users/offline', blob);
            }

            // Method 2: Direct fetch with keepalive
            fetch('/api/users/offline', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: id }),
                keepalive: true
            }).catch(() => {/* Ignore errors */ });

            // Method 3: Simple GET request with query params (most compatible)
            fetch(`/api/users/offline?userId=${id}&t=${Date.now()}`, {
                keepalive: true
            }).catch(() => {/* Ignore errors */ });

            // Method 4: Image request as fallback
            const img = new Image();
            img.src = `/api/users/offline?userId=${id}&t=${Date.now()}`;

        } catch (error) {
            // Ignore errors during unload events
        }
    }, []);

    // Function to update the current user's online status
    const updateOwnOnlineStatus = useCallback(async () => {
        if (!session?.user?.id || !isMountedRef.current) return;

        try {
            await fetch('/api/users/online', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Add cache-busting
                body: JSON.stringify({ timestamp: Date.now() })
            });
        } catch (error) {
            console.error('Error updating own online status:', error);
        }
    }, [session?.user?.id]);

    // Handle own online status updates with very frequent heartbeats
    useEffect(() => {
        // Skip if not authenticated or no session
        if (status !== 'authenticated' || !session?.user || !userId) return;

        // If we're checking the current user's status
        if (userId === session.user.id) {
            // Current user is always online to themselves
            setIsOnline(true);
            setLoading(false);

            // Setup very frequent heartbeats (every 5 seconds)
            const heartbeatInterval = setInterval(() => {
                updateOwnOnlineStatus();
            }, 5000);

            // Initial heartbeat
            updateOwnOnlineStatus();

            return () => {
                clearInterval(heartbeatInterval);
                // Try to mark user as offline when component unmounts
                if (session.user?.id) {
                    markUserOffline(session.user.id);
                }
            };
        }
    }, [session?.user, status, userId, updateOwnOnlineStatus, markUserOffline]);

    // Very frequent polling for other users' status
    useEffect(() => {
        // Skip if not authenticated or no user ID to check
        if (status !== 'authenticated' || !userId || !session?.user) return;

        // Skip if this is the current user (handled by the above effect)
        if (userId === session.user.id) return;

        // Initial check for the other user
        checkUserOnlineStatus(userId);

        // Set up very frequent polling (every 2 seconds)
        const statusCheckInterval = setInterval(() => {
            checkUserOnlineStatus(userId);
        }, 2000);

        return () => {
            clearInterval(statusCheckInterval);
        };
    }, [userId, session?.user, status, checkUserOnlineStatus]);

    // Enhanced page visibility & unload handlers for immediate status changes
    useEffect(() => {
        if (!session?.user?.id || status !== 'authenticated') return;
        if (userId !== session.user.id) return; // Only for current user

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // User returned to the tab - immediately update online status
                updateOwnOnlineStatus();
            } else if (document.visibilityState === 'hidden') {
                // Tab is hidden - IMMEDIATELY mark user as offline
                markUserOffline(session.user.id);
            }
        };

        const handleBeforeUnload = () => {
            // IMMEDIATELY mark offline when page is about to be unloaded
            markUserOffline(session.user.id);
        };

        // Add all possible event listeners for maximum reliability
        document.addEventListener('visibilitychange', handleVisibilityChange, { capture: true });
        window.addEventListener('beforeunload', handleBeforeUnload, { capture: true });
        window.addEventListener('unload', handleBeforeUnload, { capture: true });
        window.addEventListener('pagehide', handleBeforeUnload, { capture: true });

        return () => {
            // Clean up event listeners
            document.removeEventListener('visibilitychange', handleVisibilityChange, { capture: true });
            window.removeEventListener('beforeunload', handleBeforeUnload, { capture: true });
            window.removeEventListener('unload', handleBeforeUnload, { capture: true });
            window.removeEventListener('pagehide', handleBeforeUnload, { capture: true });

            // Final attempt to mark user as offline when component unmounts
            if (session?.user?.id) {
                markUserOffline(session.user.id);
            }
        };
    }, [session?.user?.id, status, userId, updateOwnOnlineStatus, markUserOffline]);

    return { isOnline, loading };
}