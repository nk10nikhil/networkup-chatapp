"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { FiEdit2, FiArrowLeft, FiCheck } from 'react-icons/fi';

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

type ProfileFormProps = {
    user: {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
    };
};

export default function ProfileForm({ user }: ProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user.name,
        }
    });

    const onSubmit = async (data: ProfileFormData) => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/api/users/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name,
                    // You could implement avatar update here
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update profile');
            }

            setSuccess('Profile updated successfully');

            // Refresh server-side data
            router.refresh();
        } catch (error: any) {
            setError(error.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="px-4 py-5 sm:p-6">
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        Account Information
                    </h2>
                    <Button
                        onClick={() => router.push('/chat')}
                        variant="ghost"
                        size="sm"
                        className="text-primary-600 dark:text-primary-400 flex items-center"
                    >
                        <FiArrowLeft className="mr-1" /> Back to chat
                    </Button>
                </div>

                {success && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md flex items-center">
                        <FiCheck className="w-5 h-5 mr-2" />
                        {success}
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
                        {error}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="relative">
                        <Avatar
                            name={user.name}
                            image={user.avatar}
                            userId={user._id}
                            size="lg"
                        />
                        <button className="absolute bottom-0 right-0 p-1 rounded-full bg-primary-600 text-white hover:bg-primary-700">
                            <FiEdit2 className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {user.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="name">
                            Display Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            {...register('name')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Your name"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={isLoading}
                        className="mt-4"
                    >
                        Save Changes
                    </Button>
                </form>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Security
                    </h3>

                    <Button
                        onClick={() => router.push('/password')}
                        variant="outline"
                    >
                        Change Password
                    </Button>
                </div>
            </div>
        </div>
    );
}