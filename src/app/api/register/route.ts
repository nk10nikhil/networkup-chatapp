import { connectToDatabase } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json();

        // Validate required fields
        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // Log attempt to connect to database (for debugging)
        console.log('Attempting to connect to MongoDB with URI:',
            process.env.MONGODB_URI ? 'MONGODB_URI is defined' : 'MONGODB_URI is undefined');

        try {
            const { db } = await connectToDatabase();

            // Check if user with this email already exists
            const existingUser = await db.collection('users').findOne({ email });
            if (existingUser) {
                return NextResponse.json(
                    { message: 'User with this email already exists' },
                    { status: 409 }
                );
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create new user
            const result = await db.collection('users').insertOne({
                name,
                email,
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            // Return success response without including password
            return NextResponse.json({
                _id: result.insertedId,
                name,
                email,
                createdAt: new Date(),
                message: 'Registration successful'
            });
        } catch (dbError) {
            console.error('Database connection or operation error:', dbError);
            return NextResponse.json(
                { message: 'Database connection failed. Please check your configuration.' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Registration error:', error instanceof Error ? error.message : String(error));
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
        return NextResponse.json(
            { message: 'Something went wrong during registration' },
            { status: 500 }
        );
    }
}