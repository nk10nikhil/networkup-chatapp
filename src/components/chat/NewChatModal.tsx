"use client";

import { useState, useEffect, useRef } from "react";
import { FiX, FiSearch, FiUser } from "react-icons/fi";
import { User } from "@/utils/types";
import { getInitials, getAvatarColor } from "@/utils/helpers";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type NewChatModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function NewChatModal({ isOpen, onClose }: NewChatModalProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [creating, setCreating] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Handle closing modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Focus search input when modal opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    // Search for users
    useEffect(() => {
        const searchUsers = async () => {
            if (searchQuery.trim().length < 2) {
                setUsers([]);
                return;
            }

            setLoading(true);

            try {
                const response = await fetch(`/api/users?search=${encodeURIComponent(searchQuery)}`);

                if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
                }
            } catch (error) {
                console.error("Error searching users:", error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(searchUsers, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Create new chat with selected user
    const createChat = async (userId: string) => {
        setCreating(true);

        try {
            const response = await fetch("/api/chats", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    participantId: userId,
                }),
            });

            if (response.ok) {
                const chat = await response.json();
                onClose();
                router.push(`/chat/${userId}`);
            }
        } catch (error) {
            console.error("Error creating chat:", error);
        } finally {
            setCreating(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        ref={modalRef}
                        className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-xl overflow-hidden"
                    >
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                New Conversation
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="p-4">
                            <div className="relative mb-4">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search users by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-800 dark:text-white"
                                />
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>

                            <div className="max-h-80 overflow-y-auto">
                                {loading ? (
                                    <div className="flex justify-center items-center py-8">
                                        <div className="loader">Searching...</div>
                                    </div>
                                ) : users.length === 0 ? (
                                    searchQuery.trim().length > 1 ? (
                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2">
                                                <FiUser className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                No users found matching your search
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2">
                                                <FiSearch className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Type at least 2 characters to search for users
                                            </p>
                                        </div>
                                    )
                                ) : (
                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {users.map((user) => (
                                            <li key={user._id.toString()}>
                                                <button
                                                    onClick={() => createChat(user._id.toString())}
                                                    disabled={creating}
                                                    className="w-full flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg"
                                                >
                                                    {user.avatar ? (
                                                        <Image
                                                            src={user.avatar}
                                                            alt={user.name}
                                                            width={40}
                                                            height={40}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor(user._id.toString())}`}>
                                                            <span className="text-white font-medium">
                                                                {getInitials(user.name)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="ml-3 text-left">
                                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {user.name}
                                                        </h4>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}