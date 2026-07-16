"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("Fahim Hossain");
  const [userRole, setUserRole] = useState("learner");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Sync profile data from localStorage & run Route Guards
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    const storedName = localStorage.getItem("userName");
    const storedRole = localStorage.getItem("userRole") || "learner";

    if (!storedEmail) {
      router.push("/auth?mode=login");
      return;
    }

    // Role path permission restrictions checks
    if (storedRole === "learner" && pathname.includes("/dashboard/mentor")) {
      router.push("/dashboard");
      return;
    }
    if (storedRole === "mentor" && (pathname === "/dashboard/courses" || pathname === "/dashboard/book")) {
      router.push("/dashboard");
      return;
    }

    if (storedName) setUserName(storedName);
    setUserRole(storedRole);
    setCheckingAuth(false);
  }, [pathname, router]);

  const handleLogout = async () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("isEmailVerified");
    localStorage.removeItem("isOnboarded");
    localStorage.removeItem("tokenBalance");
    localStorage.removeItem("mentorEarnings");
    localStorage.removeItem("scheduledSessions");
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/";
  };

  const menuItems = userRole === "admin" ? [
    { name: "Overview", href: "/dashboard", icon: "📊" },
    { name: "Admin Panel", href: "/admin", icon: "🛡️" },
    { name: "Messages", href: "/dashboard/messages", icon: "💬" },
    { name: "Skill Exchange", href: "/dashboard/exchanges", icon: "🤝" },
    { name: "Profile Settings", href: "/dashboard/settings", icon: "⚙️" },
  ] : userRole === "mentor" ? [
    { name: "Overview", href: "/dashboard", icon: "📊" },
    { name: "My Courses", href: "/dashboard/mentor/courses", icon: "📚" },
    { name: "Set Availability", href: "/dashboard/mentor/availability", icon: "🕒" },
    { name: "Manage Bookings", href: "/dashboard/mentor/bookings", icon: "📅" },
    { name: "Earnings & Payouts", href: "/dashboard/mentor/earnings", icon: "💸" },
    { name: "Reviews Received", href: "/dashboard/mentor/reviews", icon: "★" },
    { name: "Messages", href: "/dashboard/messages", icon: "💬" },
    { name: "Skill Exchange", href: "/dashboard/exchanges", icon: "🤝" },
    { name: "Profile Settings", href: "/dashboard/settings", icon: "⚙️" },
  ] : [
    { name: "Overview", href: "/dashboard", icon: "📊" },
    { name: "My Courses", href: "/dashboard/courses", icon: "📚" },
    { name: "My Sessions", href: "/dashboard/sessions", icon: "📅" },
    { name: "Skill Exchange", href: "/dashboard/exchanges", icon: "🤝" },
    { name: "Messages", href: "/dashboard/messages", icon: "💬" },
    { name: "Wallet & Invoices", href: "/dashboard/billing", icon: "💳" },
    { name: "Profile Settings", href: "/dashboard/settings", icon: "⚙️" },
  ];

  // Renders a beautiful skeleton dashboard while checking localStorage credentials
  if (checkingAuth) {
    return (
      <div className="flex-1 flex flex-col md:flex-row bg-background min-h-[calc(100vh-4rem)]">
        {/* Sidebar Skeleton */}
        <aside className="hidden md:block w-64 bg-card border-r border-border p-6 space-y-6">
          <div className="h-8 bg-muted rounded-lg animate-pulse w-3/4" />
          <div className="space-y-4 pt-8">
            <div className="h-10 bg-muted rounded-lg animate-pulse" />
            <div className="h-10 bg-muted rounded-lg animate-pulse" />
            <div className="h-10 bg-muted rounded-lg animate-pulse" />
            <div className="h-10 bg-muted rounded-lg animate-pulse" />
          </div>
        </aside>
        
        {/* Main Panel Content Skeleton */}
        <main className="flex-1 p-8 space-y-6">
          <div className="h-12 bg-muted rounded-2xl animate-pulse w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-muted rounded-2xl animate-pulse" />
            <div className="h-32 bg-muted rounded-2xl animate-pulse" />
            <div className="h-32 bg-muted rounded-2xl animate-pulse" />
          </div>
          <div className="h-64 bg-muted rounded-2xl animate-pulse" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-background">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 h-16 border-b border-border bg-card">
        <Link href="/" className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-sm font-bold tracking-tight">Skillbridge</span>
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

      {/* Mobile Drawer menu */}
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
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={() => {
              setIsMobileOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-red-500 hover:bg-red-500/5 transition-colors text-left"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-card border-r border-border flex-col justify-between p-6 shrink-0 relative z-30">
        <div className="space-y-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight">
              Skill<span className="text-primary">bridge</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/10"
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

        {/* User profile & Logout */}
        <div className="border-t border-border pt-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold border border-primary/20">
              {userName.substring(0, 1)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-foreground truncate">{userName}</p>
              <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">{userRole}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full h-9 flex items-center justify-center gap-2 rounded-lg border border-border text-xs font-semibold hover:bg-red-500/5 text-red-500 transition-colors cursor-pointer"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Scroll Panel */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-background relative z-10">
        {children}
      </main>
    </div>
  );
}
