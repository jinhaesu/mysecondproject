"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Microscope, Database, LogOut, User, Map } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleNavClick = (href: string) => {
    router.push(href);
  };

  const navItems = [
    { href: "/", label: "AI 분석", icon: Microscope },
    { href: "/data", label: "데이터", icon: Database },
    { href: "/roadmap", label: "연구 로드맵", icon: Map },
  ];

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Microscope className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-bold text-lg hidden sm:block">AI Research Assistant</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <User className="w-4 h-4" />
              <span className="hidden sm:block">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">로그아웃</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
