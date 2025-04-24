import { FiMoreHorizontal, FiPhone, FiVideo, FiArrowLeft } from "react-icons/fi";
import Avatar from "@/components/ui/Avatar";

interface ChatHeaderProps {
    participant: {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    isMobile?: boolean;
    onBackClick?: () => void;
    isOnline?: boolean;
}

export function ChatHeader({
    participant,
    isMobile = false,
    onBackClick,
    isOnline = false
}: ChatHeaderProps) {
    return (
        <div className="flex items-center px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            {isMobile && (
                <button
                    title="Back"
                    onClick={onBackClick}
                    className="mr-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <FiArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
            )}

            <div className="flex items-center flex-1">
                <div className="relative">
                    <Avatar
                        name={participant.name}
                        image={participant.avatar}
                        userId={participant._id}
                        size="md"
                    />
                    {/* Online status indicator dot */}
                    <span
                        className={`absolute right-0 bottom-0 block h-3 w-3 rounded-full ring-2 ring-white ${isOnline ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                    />
                </div>

                <div className="ml-3">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                        {participant.name}
                    </h3>
                    <div className="flex items-center">
                        <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${isOnline ? 'bg-green-500' : 'bg-gray-400'
                            }`}></span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {isOnline ? "Online" : "Offline"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <button title="Call" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <FiPhone className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <button title="Video Call" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <FiVideo className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <button title="More Options" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <FiMoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
            </div>
        </div>
    );
}