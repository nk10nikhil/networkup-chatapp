import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/db';
import { compare } from 'bcryptjs';
import { User } from 'next-auth';

// Extend the built-in User type with our custom properties
interface CustomUser extends User {
    avatar?: string;
}

// Add the verifyPassword function that's being used in login route
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await compare(plainPassword, hashedPassword);
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Missing credentials');
                }

                const { db } = await connectToDatabase();
                const user = await db.collection('users').findOne({
                    email: credentials.email.toLowerCase()
                });

                if (!user) {
                    throw new Error('No user found with this email');
                }

                const isPasswordValid = await compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error('Invalid password');
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar
                };
            }
        })
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                // Use type assertion to handle avatar property
                token.avatar = (user as CustomUser).avatar;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    id: token.id as string,
                    name: token.name as string,
                    email: token.email as string,
                    avatar: token.avatar as string | undefined,
                };
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
};