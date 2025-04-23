import { FiLoader } from 'react-icons/fi';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
    const sizeMap = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    return (
        <div className={`flex justify-center items-center ${className}`}>
            <FiLoader className={`animate-spin ${sizeMap[size]} text-primary-600 dark:text-primary-400`} />
        </div>
    );
}