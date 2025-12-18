"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LayoutDashboard, MessageSquare, Image as ImageIcon, ChevronLeft, ChevronRight, ShieldCheck, Users, Menu, X } from "lucide-react";
import Logo from "@/components/Logo";

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [animatingItem, setAnimatingItem] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "user" | null>(null);
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
      href: "/community",
      label: "Community Forum",
      icon: Users,
      description: "Internal semiconductor discussion board",
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

  useEffect(() => {
    let cancelled = false;
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setUserRole(null);
          return;
        }
        const data = await res.json();
        if (!cancelled && data.authenticated) {
          setUserRole(data.role === "admin" ? "admin" : "user");
        } else if (!cancelled) {
          setUserRole(null);
        }
      } catch {
        if (!cancelled) setUserRole(null);
      }
    };
    checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobileOpen && onMobileClose) {
      onMobileClose();
    }
  }, [pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`glass-panel min-h-screen flex flex-col overflow-x-visible transition-all duration-300 ease-in-out shadow-xl bg-white/90 dark:bg-slate-900/80
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "w-20" : "w-64"}
        `}
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
          onClick={onMobileClose}
        >
          <Logo size={isCollapsed ? 32 : 40} />
          {!isCollapsed && (
            <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">AstraSemi</span>
          )}
          {isCollapsed && <span className="sr-only">AstraSemi</span>}
        </Link>
        <div className="flex items-center gap-2">
          {/* Mobile close button */}
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onMobileClose}
            className="lg:hidden rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
          {/* Desktop collapse button */}
          <button
            type="button"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
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
                  onClick={() => {
                    handleNavClick(item.href);
                    if (onMobileClose) onMobileClose();
                  }}
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
          {userRole === "admin" && (
            <li className="relative group">
              <Link
                href="/admin"
                title="Admin Dashboard"
                onClick={() => {
                  handleNavClick("/admin");
                  if (onMobileClose) onMobileClose();
                }}
                className={`flex items-center gap-3 py-3 rounded-lg transition-all duration-200 ${
                  isCollapsed ? "justify-center px-2" : "px-4"
                } ${
                  pathname === "/admin"
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30"
                    : "text-gray-700 hover:bg-white/80 hover:shadow-sm dark:text-gray-100 dark:hover:bg-gray-800/70"
                } ${animatingItem === "/admin" ? "nav-open-anim" : ""}`}
              >
                <ShieldCheck className="h-5 w-5" />
                {!isCollapsed ? (
                  <span className="font-medium">Admin Dashboard</span>
                ) : (
                  <span className="sr-only">Admin Dashboard</span>
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
                Access admin controls and user management
              </span>
            </li>
          )}
        </ul>
      </nav>
    </aside>
    </>
  );
}

