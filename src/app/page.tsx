import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FiLock, FiMessageCircle, FiUserPlus, FiShield, FiCheck, FiLayers } from 'react-icons/fi';
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
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-gray-700 hover:bg-primary-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300"
                            >
                                Register
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                {/* Enhanced Hero Section with Animations */}
                <div className="relative overflow-hidden bg-gradient-to-b from-white to-primary-50 dark:from-gray-900 dark:to-gray-800">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 dark:bg-primary-700/20 rounded-full animate-float-slow"></div>
                        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-primary-300/20 dark:bg-primary-600/10 rounded-full animate-float-medium"></div>
                        <div className="absolute -bottom-40 left-1/2 w-72 h-72 bg-primary-100/40 dark:bg-primary-800/20 rounded-full animate-float-fast"></div>

                        {/* Grid pattern overlay */}
                        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32 relative z-10">
                        <div className="text-center">
                            <div className="inline-flex items-center bg-primary-50 dark:bg-gray-800/50 px-3 py-1 rounded-full mb-6 animate-fade-in">
                                <span className="inline-block w-2 h-2 rounded-full bg-primary-500 mr-2"></span>
                                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">End-to-end encrypted messaging</span>
                            </div>

                            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                <span className="block mb-2">Secure Communication</span>
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-400 dark:to-primary-300">End-to-End Encrypted</span>
                            </h1>

                            <p className="mt-6 max-w-md mx-auto text-base text-gray-600 dark:text-gray-300 sm:text-lg md:mt-8 md:text-xl md:max-w-3xl animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                                Connect with others through our state-of-the-art encrypted messaging platform.
                                Your conversations remain private and secure with military-grade encryption.
                            </p>

                            <div className="mt-8 max-w-md mx-auto sm:flex sm:justify-center md:mt-10 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                                <div className="rounded-md shadow">
                                    <Link
                                        href="/register"
                                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 hover:scale-105 md:py-4 md:text-lg md:px-10 transition-all duration-300"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                                    <Link
                                        href="/login"
                                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 hover:scale-105 dark:text-primary-400 dark:bg-gray-800 dark:hover:bg-gray-700 md:py-4 md:text-lg md:px-10 transition-all duration-300"
                                    >
                                        Sign In
                                    </Link>
                                </div>
                            </div>

                            {/* Security features list */}
                            <div className="mt-12 max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 text-left animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <FiCheck className="h-6 w-6 text-primary-500 dark:text-primary-400" />
                                    </div>
                                    <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                                        <span className="font-medium text-gray-900 dark:text-white">End-to-end encryption</span> for all messages
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <FiCheck className="h-6 w-6 text-primary-500 dark:text-primary-400" />
                                    </div>
                                    <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                                        <span className="font-medium text-gray-900 dark:text-white">Self-destructing messages</span> for added privacy
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <FiCheck className="h-6 w-6 text-primary-500 dark:text-primary-400" />
                                    </div>
                                    <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                                        <span className="font-medium text-gray-900 dark:text-white">No data storage</span> on our servers
                                    </p>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <FiCheck className="h-6 w-6 text-primary-500 dark:text-primary-400" />
                                    </div>
                                    <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                                        <span className="font-medium text-gray-900 dark:text-white">Multi-device support</span> with sync
                                    </p>
                                </div>
                            </div>

                            {/* Chat preview illustration */}
                            <div className="mt-16 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '1s' }}>
                                <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
                                    {/* Chat window mockup */}
                                    <div className="bg-white dark:bg-gray-800 h-96 p-4 overflow-hidden">
                                        <div className="h-12 flex items-center border-b border-gray-200 dark:border-gray-700 pb-4">
                                            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-gray-700 flex items-center justify-center">
                                                <span className="text-primary-800 dark:text-primary-300 font-medium">JS</span>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">Jane Smith</p>
                                                <p className="text-xs text-green-500 flex items-center">
                                                    <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                                                    Online
                                                </p>
                                            </div>
                                        </div>

                                        <div className="py-4 space-y-4 overflow-y-auto">
                                            <div className="flex">
                                                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-none px-4 py-2 max-w-[75%]">
                                                    <p className="text-gray-800 dark:text-white text-sm">Hi there! How's it going?</p>
                                                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">10:24 AM</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <div className="bg-primary-600 rounded-2xl rounded-tr-none px-4 py-2 max-w-[75%]">
                                                    <p className="text-white text-sm">Hey! I'm good. Just checking out this new secure chat app.</p>
                                                    <div className="flex justify-end items-center">
                                                        <p className="text-primary-200 text-xs mt-1">10:26 AM • Read</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex animate-pulse-slow">
                                                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-none px-4 py-2 max-w-[75%]">
                                                    <div className="flex space-x-1">
                                                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                                                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                                                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Overlay with gradient for aesthetic touch */}
                                    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white dark:from-gray-800 opacity-70"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Wave divider */}
                    <div className="relative h-12 md:h-24">
                        <svg className="absolute bottom-0 w-full h-12 md:h-24 text-white dark:text-gray-900" viewBox="0 0 1440 96" fill="currentColor" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                            <path d="M0 96L48 80C96 64 192 32 288 26.7C384 21.3 480 42.7 576 48C672 53.3 768 42.7 864 48C960 53.3 1056 74.7 1152 74.7C1248 74.7 1344 53.3 1392 42.7L1440 32V0H1392C1344 0 1248 0 1152 0C1056 0 960 0 864 0C768 0 672 0 576 0C480 0 384 0 288 0C192 0 96 0 48 0H0V96Z"></path>
                        </svg>
                    </div>
                </div>

                {/* Features section (keeping the existing features section) */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="pt-6">
                            <div className="flow-root bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 pb-8 hover:shadow-xl transition-shadow duration-300 h-full">
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
                            <div className="flow-root bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 pb-8 hover:shadow-xl transition-shadow duration-300 h-full">
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
                            <div className="flow-root bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 pb-8 hover:shadow-xl transition-shadow duration-300 h-full">
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