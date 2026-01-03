"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "neon";
    size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95",
                    {
                        "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30": variant === "primary",
                        "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700": variant === "secondary",
                        "border-2 border-slate-600 text-slate-200 hover:border-slate-400": variant === "outline",
                        "hover:bg-slate-800 text-slate-300 hover:text-white": variant === "ghost",
                        "bg-transparent border border-[var(--color-neon-blue)] text-[var(--color-neon-blue)] shadow-[0_0_10px_rgba(0,243,255,0.2)] hover:bg-[rgba(0,243,255,0.1)] hover:shadow-[0_0_20px_rgba(0,243,255,0.4)]": variant === "neon",
                        "h-8 px-3 text-sm": size === "sm",
                        "h-10 px-4 py-2": size === "md",
                        "h-12 px-6 text-lg": size === "lg",
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
