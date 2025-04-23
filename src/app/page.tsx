import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FiLock, FiMessageCircle, FiUserPlus, FiShield } from 'react-icons/fi';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default async function Home() {
    const session = await getServerSession(authOptions);

    // If user is authenticated, redirect to chat
    if (session) {
        redirect('/chat');
    }

    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <FiLock className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">SecureChat</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <ThemeToggle />
                            <Link
                                href="/login"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-gray-700 hover:bg-primary-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                Sign in
                            </Link>
                            <Link
                                href="/register"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                Sign up
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                            <span className="block">Secure Communication</span>
                            <span className="block text-primary-600 dark:text-primary-400">End-to-End Encrypted</span>
                        </h1>
                        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                            Connect with others through our state-of-the-art encrypted messaging platform. Your conversations remain private and secure.
                        </p>
                        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                            <div className="rounded-md shadow">
                                <Link
                                    href="/register"
                                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                                >
                                    Get Started
                                </Link>
                            </div>
                            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                                <Link
                                    href="/login"
                                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 dark:text-primary-400 dark:bg-gray-800 dark:hover:bg-gray-700 md:py-4 md:text-lg md:px-10"
                                >
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="mt-24">
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="pt-6">
                                <div className="flow-root bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 pb-8">
                                    <div className="-mt-6">
                                        <div>
                                            <span className="inline-flex items-center justify-center p-3 bg-primary-600 rounded-md shadow-lg">
                                                <FiShield className="h-6 w-6 text-white" aria-hidden="true" />
                                            </span>
                                        </div>
                                        <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">End-to-End Encryption</h3>
                                        <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                                            Your messages are encrypted on your device and can only be decrypted by the intended recipient. No one else can read them, not even us.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <div className="flow-root bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 pb-8">
                                    <div className="-mt-6">
                                        <div>
                                            <span className="inline-flex items-center justify-center p-3 bg-primary-600 rounded-md shadow-lg">
                                                <FiMessageCircle className="h-6 w-6 text-white" aria-hidden="true" />
                                            </span>
                                        </div>
                                        <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">Real-Time Messaging</h3>
                                        <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                                            Enjoy instant communication with real-time message delivery and read receipts, all while maintaining complete privacy.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <div className="flow-root bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 pb-8">
                                    <div className="-mt-6">
                                        <div>
                                            <span className="inline-flex items-center justify-center p-3 bg-primary-600 rounded-md shadow-lg">
                                                <FiUserPlus className="h-6 w-6 text-white" aria-hidden="true" />
                                            </span>
                                        </div>
                                        <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">Easy to Connect</h3>
                                        <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                                            Find and connect with friends easily through our secure platform. Start conversations with just a few clicks.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-8 flex items-center justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            &copy; 2025 SecureChat. All rights reserved.
                        </p>
                        <div className="flex space-x-6">
                            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                                <span className="sr-only">Terms</span>
                                Terms
                            </a>
                            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                                <span className="sr-only">Privacy</span>
                                Privacy
                            </a>
                            <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                                <span className="sr-only">Security</span>
                                Security
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}