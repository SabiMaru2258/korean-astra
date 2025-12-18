"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";

interface TopbarProps {
  title: string;
}

export default function Topbar({ title }: TopbarProps) {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleLogout = async () => {
    try {
      setSigningOut(true);
      const res = await fetch("/api/logout", { method: "POST", credentials: "include" });
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
    <header className="glass-panel px-6 py-4 shadow-md">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600 dark:text-gray-300">System Operational</span>
          <Button
            type="button"
            onClick={toggleTheme}
            variant="outline"
            className="gap-2"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          </Button>
          <Button
            type="button"
            onClick={handleLogout}
            variant="outline"
            className="gap-2"
            disabled={signingOut}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{signingOut ? "Signing out..." : "Logout"}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

