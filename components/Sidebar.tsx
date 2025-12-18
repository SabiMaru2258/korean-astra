"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, Image as ImageIcon, Briefcase } from "lucide-react";
import Logo from "@/components/Logo";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Ops Overview", icon: LayoutDashboard },
    { href: "/interpreter", label: "Message Interpreter", icon: MessageSquare },
    { href: "/image-id", label: "Image Explainer", icon: ImageIcon },
    { href: "/role-briefing", label: "Role Briefing Hub", icon: Briefcase },
  ];

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-3">
          <Logo size={40} />
          <span className="text-xl font-semibold text-gray-900">AstraSemi</span>
        </Link>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

