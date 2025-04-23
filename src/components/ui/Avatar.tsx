import Image from 'next/image';
import { getInitials, getAvatarColor } from '@/utils/helpers';

interface AvatarProps {
    name: string;
    image?: string;
    userId: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function Avatar({ name, image, userId, size = 'md', className = '' }: AvatarProps) {
    // Determine size in pixels
    const sizeMap = {
        sm: {
            width: 8,
            height: 8,
            fontSize: 'text-xs',
        },
        md: {
            width: 10,
            height: 10,
            fontSize: 'text-sm',
        },
        lg: {
            width: 16,
            height: 16,
            fontSize: 'text-lg',
        },
    };

    const { width, height, fontSize } = sizeMap[size];

    if (image) {
        return (
            <Image
                src={image}
                alt={name}
                width={height * 4}
                height={width * 4}
                className={`w-${width} h-${height} rounded-full object-cover ${className}`}
            />
        );
    }

    return (
        <div
            className={`w-${width} h-${height} rounded-full flex items-center justify-center ${getAvatarColor(userId)} ${className}`}
        >
            <span className={`text-white font-medium ${fontSize}`}>
                {getInitials(name)}
            </span>
        </div>
    );
}