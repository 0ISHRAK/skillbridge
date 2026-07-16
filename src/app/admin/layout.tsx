"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState("Admin");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    const storedName = localStorage.getItem("userName");

    if (storedRole !== "admin") {
      router.push("/dashboard");
      return;
    }

    if (storedName) setAdminName(storedName);
    setCheckingAuth(false);
  }, [router]);

  const menuItems = [
    { name: "Overview", href: "/admin", icon: "📊" },
    { name: "Users", href: "/admin/users", icon: "👥" },
    { name: "Mentors", href: "/admin/mentors", icon: "🎓" },
    { name: "Courses", href: "/admin/courses", icon: "📚" },
    { name: "Bookings", href: "/admin/bookings", icon: "📅" },
    { name: "Payments", href: "/admin/payments", icon: "💰" },
    { name: "Reports", href: "/admin/reports", icon: "📋" },
    { name: "Settings", href: "/admin/settings", icon: "⚙️" },
  ];

  if (checkingAuth) {
    return (
      <div className="flex-1 flex flex-col md:flex-row bg-background min-h-[calc(100vh-4rem)]">
        <aside className="hidden md:block w-64 bg-card border-r border-border p-6 space-y-6">
          <div className="h-8 bg-muted rounded-lg animate-pulse w-3/4" />
          <div className="space-y-4 pt-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </aside>
        <main className="flex-1 p-8 space-y-6">
          <div className="h-12 bg-muted rounded-2xl animate-pulse w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-background">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 h-16 border-b border-border bg-card">
        <Link href="/admin" className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-red-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
            A
          </div>
          <span className="text-sm font-bold tracking-tight">Admin Panel</span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
        >
          {isMobileOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden border-b border-border bg-card/95 backdrop-blur-md px-4 py-4 space-y-2 relative z-40">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive ? "bg-red-500/10 text-red-500" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-card border-r border-border flex-col justify-between p-6 shrink-0">
        <div className="space-y-8">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight">
              Admin<span className="text-red-500">Panel</span>
            </span>
          </Link>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? "bg-red-500 text-white shadow-sm shadow-red-500/10"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-border pt-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-lg font-bold border border-red-500/20">
              {adminName.substring(0, 1)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-foreground truncate">{adminName}</p>
              <p className="text-[9px] text-red-500 uppercase font-bold tracking-wider mt-0.5">ADMINISTRATOR</p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="w-full h-9 flex items-center justify-center gap-2 rounded-lg border border-border text-xs font-semibold hover:bg-accent text-muted-foreground transition-colors"
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-background">
        {children}
      </main>
    </div>
  );
}
