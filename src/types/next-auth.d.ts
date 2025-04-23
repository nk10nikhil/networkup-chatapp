import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's MongoDB ID. */
            id: string;
            /** The user's avatar URL. */
            avatar?: string;
        } & DefaultSession['user'];
    }

    interface User {
        /** The user's avatar URL. */
        avatar?: string;
    }
}