"use client";

import { Wallet, Menu } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface NavbarProps {
    account: string | null;
    onConnect: () => void;
}

export function Navbar({ account, onConnect }: NavbarProps) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--color-glass-border)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-neon-purple)] to-[var(--color-neon-blue)] animate-pulse" />
                        <span className="font-bold text-xl tracking-tight text-white">
                            Finternet
                        </span>
                    </div>

                    {/* Connect Wallet */}
                    <div className="flex items-center gap-4">
                        {account ? (
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/50 border border-slate-800 text-sm text-slate-300">
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                                {account.slice(0, 6)}...{account.slice(-4)}
                            </div>
                        ) : (
                            <Button variant="neon" size="sm" onClick={onConnect} className="gap-2">
                                <Wallet className="w-4 h-4" />
                                Connect Wallet
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
