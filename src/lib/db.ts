import { MongoClient, Db, ObjectId } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    if (!process.env.MONGODB_URI) {
        console.error('MONGODB_URI environment variable is not defined');
        throw new Error('Please define the MONGODB_URI environment variable');
    }

    const uri = process.env.MONGODB_URI;

    try {
        console.log('Attempting MongoDB connection...');
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db();
        console.log('MongoDB connection established successfully');

        cachedClient = client;
        cachedDb = db;

        return { client, db };
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw new Error(`Database connection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Fetch messages between two users
 */
export async function fetchMessages(userId1: string, userId2: string) {
    const { db } = await connectToDatabase();

    // Find messages where either user is the sender and the other is the receiver
    const messages = await db.collection('messages').find({
        $or: [
            { senderId: userId1, receiverId: userId2 },
            { senderId: userId2, receiverId: userId1 }
        ]
    }).sort({ createdAt: 1 }).toArray();

    return messages;
}

/**
 * Send a new message
 */
export async function sendMessage(messageData: {
    senderId: string;
    receiverId: string;
    content: string;
}) {
    const { db } = await connectToDatabase();

    const result = await db.collection('messages').insertOne({
        ...messageData,
        createdAt: new Date(),
        read: false
    });

    return result;
}