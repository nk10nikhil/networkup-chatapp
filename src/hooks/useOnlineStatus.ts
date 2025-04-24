import { useState, useEffect, useCallback } from 'react';

export default function useOnlineStatus(userId: string | null | undefined) {
    const [isOnline, setIsOnline] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    // Function to check if a user is online
    const checkOnlineStatus = useCallback(async (id: string) => {
        try {
            const response = await fetch(`/api/users/online?userId=${id}`);
            if (response.ok) {
                const data = await response.json();
                setIsOnline(data.isOnline);
            }
        } catch (error) {
            console.error('Error checking online status:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Update current user's online status
    const updateOnlineStatus = useCallback(async () => {
        try {
            await fetch('/api/users/online', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        } catch (error) {
            console.error('Error updating online status:', error);
        }
    }, []);

    // Periodically update current user's online status
    useEffect(() => {
        // This interval updates the current user's status to show they're online
        const updateInterval = setInterval(() => {
            updateOnlineStatus();
        }, 60000); // Every minute

        // Initial update on mount
        updateOnlineStatus();

        return () => clearInterval(updateInterval);
    }, [updateOnlineStatus]);

    // Check other user's online status
    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        // Initial check
        checkOnlineStatus(userId);

        // Set up polling to check status periodically
        const checkInterval = setInterval(() => {
            checkOnlineStatus(userId);
        }, 30000); // Every 30 seconds

        return () => clearInterval(checkInterval);
    }, [userId, checkOnlineStatus]);

    // Mark as offline when user leaves the page
    useEffect(() => {
        // Add beforeunload event listener to mark user as offline when closing tab/browser
        const handleBeforeUnload = () => {
            // Attempt to make a synchronous request to mark user as offline
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/users/offline', false); // Synchronous request
            xhr.setRequestHeader('Content-Type', 'application/json');
            try {
                xhr.send();
            } catch (e) {
                // Ignore errors, as the browser may not allow synchronous XHR
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    return { isOnline, loading };
}