import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';
import { FiLock } from 'react-icons/fi';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default async function LoginPage() {
    const session = await getServerSession(authOptions);

    // If user is already authenticated, redirect to chat
    if (session) {
        redirect('/chat');
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
            <header className="py-4 px-6">
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <Link href="/" className="flex items-center text-primary-700 dark:text-primary-400">
                        <FiLock className="w-6 h-6" />
                        <span className="ml-2 font-bold text-lg">SecureChat</span>
                    </Link>
                    <ThemeToggle />
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center p-4">
                <LoginForm />
            </main>

            <footer className="py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                &copy; 2025 SecureChat. All rights reserved.
            </footer>
        </div>
    );
}