import React, { memo } from "react";
import { FiMoreHorizontal } from "react-icons/fi";

interface EmptyChatStateProps {
    participantName: string;
}

// Using memo to prevent unnecessary re-renders once mounted
const EmptyChatState = memo(({ participantName }: EmptyChatStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-primary-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <FiMoreHorizontal className="w-8 h-8 text-primary-500 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                No messages yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs">
                Send a message to start the conversation with {participantName}
            </p>
        </div>
    );
});

EmptyChatState.displayName = "EmptyChatState";

export default EmptyChatState;