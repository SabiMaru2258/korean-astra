"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LayoutDashboard, MessageSquare, Image as ImageIcon, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import Logo from "@/components/Logo";

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [animatingItem, setAnimatingItem] = useState<string | null>(null);
  const animationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navItems = [
    {
      href: "/dashboard",
      label: "Ops Overview",
      icon: LayoutDashboard,
      description: "Upload ops CSVs and get AI summaries",
    },
    {
      href: "/interpreter",
      label: "Message Interpreter",
      icon: MessageSquare,
      description: "Summarize or rewrite notes and emails",
    },
    {
      href: "/image-id",
      label: "Image Explainer",
      icon: ImageIcon,
      description: "Explain images and suggest factory roles",
    },
    {
      href: "/role-briefing",
      label: "Role Briefing Hub",
      icon: Briefcase,
      description: "Review and assign role-specific briefings",
    },
  ];

  const handleNavClick = (href: string) => {
    if (animationTimeout.current) {
      clearTimeout(animationTimeout.current);
    }
    setAnimatingItem(href);
    animationTimeout.current = setTimeout(() => {
      setAnimatingItem(null);
      animationTimeout.current = null;
    }, 450);
  };

  useEffect(() => {
    return () => {
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
    };
  }, []);

  return (
    <aside
      className={`glass-panel min-h-screen flex flex-col overflow-x-visible transition-[width] duration-300 ease-in-out shadow-xl ${
        isCollapsed ? "w-20" : "w-64"
      } bg-white/90 dark:bg-slate-900/80`}
    >
      <div
        className={`border-b border-gray-200 dark:border-gray-800 ${
          isCollapsed
            ? "p-3 flex flex-col items-center gap-3"
            : "p-6 flex items-center justify-between"
        }`}
      >
        <Link
          href="/"
          className={`flex items-center gap-3 ${isCollapsed ? "justify-center w-full" : ""}`}
        >
          <Logo size={isCollapsed ? 32 : 40} />
          {!isCollapsed && (
            <span className="text-xl font-semibold text-gray-900">AstraSemi</span>
          )}
          {isCollapsed && <span className="sr-only">AstraSemi</span>}
        </Link>
        <button
          type="button"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
      <nav className="flex-1 p-3">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isAnimating = animatingItem === item.href;
            return (
              <li key={item.href} className="relative group">
                <Link
                  href={item.href}
                  title={item.label}
                  onClick={() => handleNavClick(item.href)}
                  className={`flex items-center gap-3 py-3 rounded-lg transition-all duration-200 ${
                    isCollapsed ? "justify-center px-2" : "px-4"
                  } ${
                    isActive
                      ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30"
                      : "text-gray-700 hover:bg-white/80 hover:shadow-sm dark:text-gray-100 dark:hover:bg-gray-800/70"
                  } ${isAnimating ? "nav-open-anim" : ""}`}
                >
                  <Icon className="h-5 w-5" />
                  {!isCollapsed ? (
                    <span className="font-medium">{item.label}</span>
                  ) : (
                    <span className="sr-only">{item.label}</span>
                  )}
                </Link>
                <span
                  className={`pointer-events-none absolute left-full top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white shadow-lg transition-all duration-150 z-20 dark:bg-gray-800 ${
                    isCollapsed
                      ? "opacity-0 scale-95 translate-x-0 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-2"
                      : "opacity-0 scale-95 translate-x-0 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-2"
                  }`}
                  aria-hidden="true"
                >
                  {item.description}
                </span>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

