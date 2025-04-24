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

    // Track the last heartbeat time
    const lastHeartbeatRef = useRef<number>(Date.now());

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
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, []);

    // Function to mark the user as offline
    const markUserOffline = useCallback(async (id: string) => {
        try {
            // Try multiple methods to ensure the request gets through

            // Method 1: Use sendBeacon (most reliable during page unload)
            if (navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify({ userId: id })], { type: 'application/json' });
                navigator.sendBeacon('/api/users/offline', blob);
            }

            // Method 2: Synchronous XMLHttpRequest as fallback (deprecated but still works in some browsers)
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/api/users/offline', false); // false = synchronous
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify({ userId: id }));
            } catch (e) {
                // Ignore errors, as synchronous XHR might be disabled
            }

            // Method 3: Fetch with keepalive (modern approach)
            fetch('/api/users/offline', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: id }),
                keepalive: true
            }).catch(() => {
                // Ignore any errors during page unload
            });

            // Method 4: Try using an image request (old-school but reliable)
            const img = new Image();
            img.src = `/api/users/offline?userId=${id}&t=${Date.now()}`;

        } catch (error) {
            // Ignore errors during unload events
            console.error('Failed to mark user as offline:', error);
        }
    }, []);

    // Function to update the current user's online status
    const updateOwnOnlineStatus = useCallback(async () => {
        if (!session?.user?.id || !isMountedRef.current) return;

        // Update the last heartbeat time
        lastHeartbeatRef.current = Date.now();

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
    }, [session?.user?.id]);

    // Handle own online status updates - more frequent heartbeats
    useEffect(() => {
        // Skip if not authenticated or no session
        if (status !== 'authenticated' || !session?.user || !userId) return;

        // If we're checking the current user's status
        if (userId === session.user.id) {
            // Current user is always online to themselves
            setIsOnline(true);
            setLoading(false);

            // Setup more frequent heartbeats (every 15 seconds)
            const heartbeatInterval = setInterval(() => {
                updateOwnOnlineStatus();
            }, 15000);

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

    // More frequent polling for other users' status
    useEffect(() => {
        // Skip if not authenticated or no user ID to check
        if (status !== 'authenticated' || !userId || !session?.user) return;

        // Skip if this is the current user (handled by the above effect)
        if (userId === session.user.id) return;

        // Initial check for the other user
        checkUserOnlineStatus(userId);

        // Set up more frequent polling (every 5 seconds)
        const statusCheckInterval = setInterval(() => {
            checkUserOnlineStatus(userId);
        }, 5000);

        return () => {
            clearInterval(statusCheckInterval);
        };
    }, [userId, session?.user, status, checkUserOnlineStatus]);

    // Enhanced page visibility & unload handlers
    useEffect(() => {
        if (!session?.user?.id || status !== 'authenticated') return;
        if (userId !== session.user.id) return; // Only for current user

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // User returned to the tab - update online status
                updateOwnOnlineStatus();
            } else if (document.visibilityState === 'hidden') {
                // Tab is hidden - mark user as offline
                markUserOffline(session.user.id);
            }
        };

        const handleBeforeUnload = () => {
            // Mark offline when page is about to be unloaded
            markUserOffline(session.user.id);
        };

        const handleOffline = () => {
            // Browser lost connection - mark user as offline
            markUserOffline(session.user.id);
        };

        // Add event listeners to multiple objects for redundancy
        document.addEventListener('visibilitychange', handleVisibilityChange, { capture: true });
        window.addEventListener('beforeunload', handleBeforeUnload, { capture: true });
        window.addEventListener('unload', handleBeforeUnload, { capture: true });
        window.addEventListener('pagehide', handleBeforeUnload, { capture: true });
        window.addEventListener('offline', handleOffline, { capture: true });

        // Register with body too for extra reliability
        document.body.addEventListener('beforeunload', handleBeforeUnload, { capture: true });

        return () => {
            // Clean up event listeners
            document.removeEventListener('visibilitychange', handleVisibilityChange, { capture: true });
            window.removeEventListener('beforeunload', handleBeforeUnload, { capture: true });
            window.removeEventListener('unload', handleBeforeUnload, { capture: true });
            window.removeEventListener('pagehide', handleBeforeUnload, { capture: true });
            window.removeEventListener('offline', handleOffline, { capture: true });
            document.body.removeEventListener('beforeunload', handleBeforeUnload, { capture: true });

            // Last attempt to mark user as offline when component unmounts
            if (session?.user?.id) {
                markUserOffline(session.user.id);
            }
        };
    }, [session?.user?.id, status, userId, updateOwnOnlineStatus, markUserOffline]);

    return { isOnline, loading };
}