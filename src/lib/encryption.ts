// import CryptoJS from 'crypto-js';

// /**
//  * Encrypts a message using AES encryption
//  * @param message The message to encrypt
//  * @param secretKey The encryption key (should be shared between the chat partners)
//  * @returns Encrypted message string
//  */
// export function encryptMessage(message: string, secretKey: string): string {
//     return CryptoJS.AES.encrypt(message, secretKey).toString();
// }

// /**
//  * Decrypts a message using AES encryption
//  * @param encryptedMessage The encrypted message
//  * @param secretKey The encryption key (should be shared between the chat partners)
//  * @returns Decrypted message string
//  */
// export function decryptMessage(encryptedMessage: string, secretKey: string): string {
//     const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
//     return bytes.toString(CryptoJS.enc.Utf8);
// }

// /**
//  * Generates a secure encryption key for a chat between two users
//  * @param userId1 First user ID
//  * @param userId2 Second user ID
//  * @returns A consistent encryption key for the chat
//  */
// export function generateChatKey(userId1: string, userId2: string): string {
//     // Sort the user IDs to ensure the same key is generated regardless of order
//     const sortedIds = [userId1, userId2].sort().join('_');
//     // Create a SHA-256 hash of the combined IDs to get a consistent, secure key
//     return CryptoJS.SHA256(sortedIds).toString();
// }


import CryptoJS from 'crypto-js';

/**
 * Generate a deterministic encryption key for a specific chat
 * @param userId1 First user's ID
 * @param userId2 Second user's ID
 */
export function generateChatKey(userId1: string, userId2: string): string {
    // Sort IDs to ensure the same key is generated regardless of order
    const sortedIds = [userId1, userId2].sort().join('_');

    // Use a secret from environment variable or a hardcoded secret
    // In production, use an environment variable
    const secret = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET || 'default-secret-key-change-in-production';

    // Generate a SHA-256 hash to use as the encryption key
    return CryptoJS.SHA256(sortedIds + secret).toString();
}

/**
 * Encrypt message content
 * @param content Plain text message
 * @param chatKey Encryption key for the chat
 */
export function encryptMessage(content: string, chatKey: string): string {
    return CryptoJS.AES.encrypt(content, chatKey).toString();
}

/**
 * Decrypt message content
 * @param encryptedContent Encrypted message
 * @param chatKey Encryption key for the chat
 */
export function decryptMessage(encryptedContent: string, chatKey: string): string {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedContent, chatKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Failed to decrypt message:', error);
        return '[Encrypted message]';
    }
}

/**
 * Check if a string is likely encrypted
 * @param text Text to check
 */
export function isEncrypted(text: string): boolean {
    // Most encrypted content with AES will be base64 and fairly long
    return /^[A-Za-z0-9+/=]+$/.test(text) && text.length > 20;
}