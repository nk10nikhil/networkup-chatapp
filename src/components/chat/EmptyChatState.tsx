import { FiMessageCircle } from 'react-icons/fi';

export default function EmptyChatState() {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-900 p-8">
            <div className="w-24 h-24 bg-primary-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <FiMessageCircle className="w-12 h-12 text-primary-500 dark:text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to SecureChat
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 max-w-md mb-8">
                Select a conversation from the sidebar or start a new chat to begin messaging securely.
            </p>
            <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    End-to-End Encryption
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    All your messages are encrypted and can only be read by you and the recipient. Not even we can access your private conversations.
                </p>
            </div>
        </div>
    );
}