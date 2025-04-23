import { MongoClient, Db, ObjectId } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}

const uri = process.env.MONGODB_URI;

export async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db();

    cachedClient = client;
    cachedDb = db;

    return { client, db };
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