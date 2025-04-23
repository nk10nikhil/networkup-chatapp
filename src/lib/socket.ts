import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest } from 'next';
import { getSession } from 'next-auth/react';

export type ServerIO = SocketIOServer & {
    _nextAuthSession?: Map<string, any>;
}

export const initSocketServer = (server: NetServer): ServerIO => {
    const io = new SocketIOServer(server, {
        path: '/api/socket',
        addTrailingSlash: false,
    }) as ServerIO;

    io._nextAuthSession = new Map();

    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            // Get session token from handshake auth
            const { token } = socket.handshake.auth;

            if (!token) {
                return next(new Error('Authentication failed: Missing token'));
            }

            // Create a mock request to pass to getSession
            const req = {
                headers: {
                    cookie: `next-auth.session-token=${token}`,
                },
            } as NextApiRequest;

            const session = await getSession({ req });

            if (!session) {
                return next(new Error('Authentication failed: Invalid session'));
            }

            // Store session in socket
            socket.data.session = session;
            socket.data.userId = session.user.id;

            // Store in server cache for quick lookup
            io._nextAuthSession?.set(socket.id, session);

            next();
        } catch (error) {
            console.error('Socket authentication error:', error);
            next(new Error('Authentication failed'));
        }
    });

    // Handle connections
    io.on('connection', (socket) => {
        // Join user's own room for private messages
        if (socket.data.userId) {
            socket.join(socket.data.userId);
        }

        // Handle disconnection
        socket.on('disconnect', () => {
            // Clean up session cache
            io._nextAuthSession?.delete(socket.id);
        });

        // Join chat room
        socket.on('join_chat', (chatId) => {
            socket.join(`chat:${chatId}`);
        });

        // Leave chat room
        socket.on('leave_chat', (chatId) => {
            socket.leave(`chat:${chatId}`);
        });
    });

    return io;
};

export const getSocketIO = (res: any): ServerIO | null => {
    if (!res.socket?.server.io) {
        // No socket server initialized yet
        return null;
    }

    return res.socket.server.io as ServerIO;
};

export const ensureSocketIO = (res: any): ServerIO => {
    if (!res.socket?.server.io) {
        // Initialize socket server
        res.socket.server.io = initSocketServer(res.socket.server);
    }

    return res.socket.server.io as ServerIO;
};