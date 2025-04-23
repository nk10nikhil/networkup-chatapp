// import React from "react"

// interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
//     variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
//     size?: "sm" | "md" | "lg"
//     fullWidth?: boolean
//     isLoading?: boolean
// }

// export default function Button({
//     children,
//     className,
//     variant = "primary",
//     size = "md",
//     fullWidth = false,
//     isLoading = false,
//     disabled,
//     ...props
// }: ButtonProps) {
//     const baseStyles = "font-medium rounded-lg focus:outline-none transition-colors inline-flex items-center justify-center"

//     const variants = {
//         primary: "bg-primary-600 hover:bg-primary-700 text-white focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
//         secondary: "bg-secondary-600 hover:bg-secondary-700 text-white focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2",
//         outline: "border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300",
//         ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
//         danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
//     }

//     const sizes = {
//         sm: "text-xs px-3 py-1.5",
//         md: "text-sm px-4 py-2",
//         lg: "text-base px-6 py-3",
//     }

//     const widthClass = fullWidth ? "w-full" : ""
//     const disabledClass = disabled || isLoading ? "opacity-60 cursor-not-allowed" : ""

//     return (
//         <button
//             className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${disabledClass} ${className}`}
//             disabled={disabled || isLoading}
//             {...props}
//         >
//             {isLoading && (
//                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//             )}
//             {children}
//         </button>
//     )
// }


import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
    {
        variants: {
            variant: {
                primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
                secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600",
                outline: "border border-gray-300 bg-transparent hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-white",
                ghost: "bg-transparent hover:bg-gray-100 focus:ring-gray-500 dark:hover:bg-gray-800 dark:text-gray-300",
                destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
            },
            size: {
                sm: "h-8 px-3 py-1",
                md: "h-10 px-4 py-2",
                lg: "h-12 px-6 py-3",
                icon: "h-10 w-10",
            },
            fullWidth: {
                true: "w-full",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, fullWidth, isLoading, children, ...props }, ref) => {
        return (
            <button
                className={buttonVariants({ variant, size, fullWidth, className })}
                ref={ref}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? (
                    <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        <span>Loading...</span>
                    </>
                ) : (
                    children
                )}
            </button>
        );
    }
);

Button.displayName = "Button";

export default Button;