import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import User from '@/models/User';

export async function POST(request) {
    const { email, password } = await request.json();

    const db = await connectToDatabase();
    const user = await db.collection('users').findOne({ email });

    if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
        return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
    }

    // Here you would typically create a session or a JWT token
    // For simplicity, we are just returning the user data
    return NextResponse.json({ message: 'Login successful', user });
}