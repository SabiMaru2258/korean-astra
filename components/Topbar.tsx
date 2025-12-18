"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";

interface TopbarProps {
  title: string;
}

export default function Topbar({ title }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUsername(data.username);
          }
        }
      } catch {
        // ignore
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      setSigningOut(true);
      const res = await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      if (!res.ok) {
        throw new Error("Failed to sign out");
      }
      router.replace("/login");
      router.refresh();
    } catch {
      router.replace("/login");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className="glass-panel px-4 sm:px-6 py-3 sm:py-4 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 pl-8 lg:pl-0">{title}</h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">System Operational</span>
          </div>
          {username && (
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-md bg-primary/10 text-primary">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium">{username}</span>
            </div>
          )}
          <Button
            type="button"
            onClick={toggleTheme}
            variant="outline"
            size="sm"
            className="gap-1 sm:gap-2 h-8 sm:h-10"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-3 w-3 sm:h-4 sm:w-4" />
            ) : (
              <Moon className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
            <span className="hidden sm:inline">
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          </Button>
          <Button
            type="button"
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="gap-1 sm:gap-2 h-8 sm:h-10"
            disabled={signingOut}
            aria-label="Sign out"
          >
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{signingOut ? "Signing out..." : "Logout"}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

