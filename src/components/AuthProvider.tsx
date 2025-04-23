"use client";

import { SessionProvider } from "next-auth/react";

type AuthProviderProps = {
    children: React.ReactNode;
    session?: any;
};

export default function AuthProvider({ children, session }: AuthProviderProps) {
    return <SessionProvider session={session}>{children}</SessionProvider>;
}