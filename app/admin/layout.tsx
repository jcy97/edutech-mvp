"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  FileText,
  Home,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const menuItems = [
    {
      href: "/admin/dashboard",
      icon: BarChart3,
      label: "대시보드",
    },
    {
      href: "/admin/problems",
      icon: FileText,
      label: "문제관리",
    },
    {
      href: "/admin/settings",
      icon: Settings,
      label: "일반설정",
    },
  ];

  const isLoginPage = pathname === "/admin";

  useEffect(() => {
    if (isLoginPage) {
      setIsLoading(false);
      return;
    }

    const adminLoggedIn = localStorage.getItem("admin_logged_in");
    if (adminLoggedIn === "true") {
      setIsAuthenticated(true);
    } else {
      router.push("/admin");
    }
    setIsLoading(false);
  }, [isLoginPage, router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    router.push("/admin");
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleMenuItemClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">관리자</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      <aside
        className={`
        ${isMobileMenuOpen ? "block" : "hidden"} 
        lg:block lg:w-64 bg-white shadow-sm border-r flex flex-col 
        ${isMobileMenuOpen ? "absolute lg:relative z-50 w-full" : ""}
      `}
      >
        <div className="p-6 border-b hidden lg:block">
          <h2 className="text-lg font-semibold text-gray-900">관리자 메뉴</h2>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleMenuItemClick}
              >
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium cursor-pointer transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t mt-auto space-y-2">
          <Link href="/" onClick={handleMenuItemClick}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full gap-2 justify-start"
            >
              <Home size={16} />
              메인으로
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full gap-2 justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut size={16} />
            로그아웃
          </Button>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <main className="flex-1 lg:overflow-auto">{children}</main>
    </div>
  );
}
