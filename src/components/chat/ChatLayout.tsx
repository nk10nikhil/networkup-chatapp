"use client";

import { useState, useEffect } from "react";
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { FiLogOut, FiMenu, FiUser, FiSettings } from 'react-icons/fi';
import ChatList from './ChatList';
import NewChatModal from './NewChatModal';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import Link from 'next/link';
import Image from 'next/image';
import { getInitials, getAvatarColor } from '@/utils/helpers';

type ChatLayoutProps = {
    children: React.ReactNode;
    currentUserId: string;
};

export default function ChatLayout({ children, currentUserId }: ChatLayoutProps) {
    const [newChatModalOpen, setNewChatModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [currentUser, setCurrentUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);
    const pathname = usePathname();

    // Check if we're on a specific chat page (mobile view should hide sidebar)
    const isSpecificChatPage = pathname !== '/chat';

    // Handle screen resize and set mobile view
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 768);
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Get current user details
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch('/api/users/me');
                if (response.ok) {
                    const userData = await response.json();
                    setCurrentUser(userData);
                }
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        };

        fetchCurrentUser();
    }, []);

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            {isMobileView && (
                                <button
                                    title="Menu"
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="p-2 mr-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
                                >
                                    <FiMenu className="h-6 w-6" />
                                </button>
                            )}
                            <Link href="/chat" className="flex items-center">
                                <div className="bg-primary-600 text-white p-2 rounded-md">
                                    <FiUser className="h-5 w-5" />
                                </div>
                                <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">SecureChat</span>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <ThemeToggle />
                            <div className="relative">
                                <button
                                    className="flex items-center focus:outline-none"
                                    onClick={() => {/* Toggle user menu */ }}
                                >
                                    {currentUser?.avatar ? (
                                        <Image
                                            src={currentUser.avatar}
                                            alt={currentUser.name || ''}
                                            width={32}
                                            height={32}
                                            className="w-8 h-8 rounded-full"
                                        />
                                    ) : (
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAvatarColor(currentUserId)}`}>
                                            <span className="text-white text-xs font-medium">
                                                {currentUser?.name ? getInitials(currentUser.name) : 'U'}
                                            </span>
                                        </div>
                                    )}
                                    <span className="hidden md:block ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {currentUser?.name?.split(' ')[0] || ''}
                                    </span>
                                </button>
                                {/* User dropdown menu would go here */}
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                                title="Sign out"
                            >
                                <FiLogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Chat list */}
                <div
                    className={`w-80 md:relative md:block border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
            ${isMobileView && isSpecificChatPage ? 'hidden' : ''}
            ${isMobileView ? (isMobileMenuOpen ? 'absolute z-10 inset-y-0 left-0 w-80' : 'hidden') : 'block'}
          `}
                >
                    <ChatList
                        currentUserId={currentUserId}
                        onStartNewChat={() => setNewChatModalOpen(true)}
                    />
                </div>

                {/* Main chat area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {children}
                </div>
            </div>

            {/* New chat modal */}
            <NewChatModal
                isOpen={newChatModalOpen}
                onClose={() => setNewChatModalOpen(false)}
            />
        </div>
    );
}