"use client";

import { useTheme } from "@/components/ThemeProvider";
import { useState, useEffect } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Wait until component is mounted to avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button
                className="p-2 rounded-md bg-gray-100 dark:bg-gray-700"
                aria-label="Toggle theme"
            >
                <div className="w-5 h-5"></div>
            </button>
        );
    }

    return (
        <button
            className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <FiSun className="text-amber-400 w-5 h-5" />
            ) : (
                <FiMoon className="text-gray-700 w-5 h-5" />
            )}
        </button>
    );
}