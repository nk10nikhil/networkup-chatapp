import React from 'react';

interface UserAvatarProps {
    username: string;
    avatarUrl?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ username, avatarUrl }) => {
    return (
        <div className="user-avatar">
            <img 
                src={avatarUrl || '/assets/default-avatar.png'} 
                alt={`${username}'s avatar`} 
                className="avatar-image" 
            />
            <span className="username">{username}</span>
        </div>
    );
};

export default UserAvatar;