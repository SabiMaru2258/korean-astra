"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import PageTransition from "@/components/PageTransition";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = pathname === "/login";

  if (hideChrome) {
    return <div className="flex min-h-screen">{children}</div>;
  }

  return (
    <div className="shell-bg relative min-h-screen text-foreground">
      <div className="shell-overlay absolute inset-0 pointer-events-none" />
      <div className="relative flex min-h-screen">
        <Sidebar />
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  );
}
