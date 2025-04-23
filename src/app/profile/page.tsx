import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/db';
import ProfileForm from '@/components/profile/ProfileForm';
import { ObjectId } from 'mongodb';

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    // If not authenticated, redirect to login
    if (!session) {
        redirect('/login');
    }

    // Get user details
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne(
        { _id: new ObjectId(session.user.id) },
        { projection: { password: 0 } }
    );

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Your Profile</h1>
                        <a
                            href="/chat"
                            className="px-4 py-2 text-sm font-medium text-primary-700 dark:text-primary-400 hover:underline"
                        >
                            Back to Chat
                        </a>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                        <ProfileForm user={user} />
                    </div>
                </div>
            </main>
        </div>
    );
}