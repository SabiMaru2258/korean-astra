"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import PageTransition from "@/components/PageTransition";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = pathname === "/login";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (hideChrome) {
    return <div className="flex min-h-screen">{children}</div>;
  }

  return (
    <div className="shell-bg relative min-h-screen text-foreground">
      <div className="shell-overlay absolute inset-0 pointer-events-none" />
      <div className="relative flex min-h-screen">
        <Sidebar 
          isMobileOpen={isMobileMenuOpen} 
          onMobileClose={() => setIsMobileMenuOpen(false)} 
        />
        <PageTransition>
          <MobileMenuButton onClick={() => setIsMobileMenuOpen(true)} />
          {children}
        </PageTransition>
      </div>
    </div>
  );
}

function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-white/90 dark:bg-slate-900/90 shadow-lg text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
      aria-label="Open menu"
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}
