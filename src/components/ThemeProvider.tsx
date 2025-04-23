// "use client"

// import { createContext, useContext, useEffect, useState } from "react"

// type Theme = "dark" | "light" | "system"

// type ThemeProviderProps = {
//     children: React.ReactNode
//     defaultTheme?: Theme
//     attribute?: string
//     enableSystem?: boolean
//     disableTransitionOnChange?: boolean
// }

// const initialState = {
//     theme: "system" as Theme,
//     setTheme: (theme: Theme) => null,
// }

// const ThemeProviderContext = createContext(initialState)

// export function ThemeProvider({
//     children,
//     defaultTheme = "system",
//     attribute = "data-theme",
//     enableSystem = true,
//     disableTransitionOnChange = false,
//     ...props
// }: ThemeProviderProps) {
//     const [theme, setTheme] = useState<Theme>(defaultTheme)

//     useEffect(() => {
//         const root = window.document.documentElement

//         if (theme === "system" && enableSystem) {
//             const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
//                 ? "dark"
//                 : "light"
//             root.setAttribute(attribute, systemTheme)
//             return
//         }

//         root.setAttribute(attribute, theme)
//     }, [theme, attribute, enableSystem])

//     const value = {
//         theme,
//         setTheme: (theme: Theme) => {
//             setTheme(theme)
//         },
//     }

//     return (
//         <ThemeProviderContext.Provider {...props} value={value}>
//             {children}
//         </ThemeProviderContext.Provider>
//     )
// }

// export const useTheme = () => {
//     const context = useContext(ThemeProviderContext)

//     if (context === undefined)
//         throw new Error("useTheme must be used within a ThemeProvider")

//     return context
// }


ThemeProvider.tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}