"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface NotificationItem {
  id: string;
  title?: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Auth & Profile state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState<"admin" | "mentor" | "learner">("learner");
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

  // Real-time Notifications state
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Profile dropdown state
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Global search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync auth state & theme
  useEffect(() => {
    // Auth Check from Local Storage first for immediate UI
    const storedEmail = localStorage.getItem("userEmail");
    const storedName = localStorage.getItem("userName");
    const storedRole = (localStorage.getItem("userRole") || "learner").toLowerCase() as "admin" | "mentor" | "learner";
    const storedTokens = localStorage.getItem("tokenBalance");

    if (storedEmail) {
      setIsLoggedIn(true);
      if (storedName) setUserName(storedName);
      setUserRole(storedRole);
      if (storedTokens) setTokenBalance(Number(storedTokens) || 0);
    } else {
      setIsLoggedIn(false);
    }

    // Verify session dynamically with /api/auth/me
    async function syncAuth() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setIsLoggedIn(true);
            setUserName(data.user.name || "User");
            const verifiedRole = (data.user.role || "learner").toLowerCase() as "admin" | "mentor" | "learner";
            setUserRole(verifiedRole);
            setTokenBalance(data.user.tokenBalance ?? 0);
            localStorage.setItem("userRole", verifiedRole);
            localStorage.setItem("userName", data.user.name);
            localStorage.setItem("userEmail", data.user.email);
            if (data.user.tokenBalance !== undefined) {
              localStorage.setItem("tokenBalance", String(data.user.tokenBalance));
            }
          }
        }
      } catch {
        // fallback to localStorage
      }
    }

    void syncAuth();

    // Theme Sync
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "dark";
    if (savedTheme && savedTheme !== "dark") {
      setTimeout(() => setTheme(savedTheme), 0);
    }
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [pathname]);

  // Real-time notifications polling (every 3 seconds)
  useEffect(() => {
    if (!isLoggedIn) return;

    let isMounted = true;
    async function loadNotifications() {
      try {
        const res = await fetch(`/api/notifications?_t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.notifications) {
            setNotifications(data.notifications);
          }
        }
      } catch {
        // silent
      }
    }

    void loadNotifications();
    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 3000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [isLoggedIn]);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 10) {
        setIsVisible(true);
      } else if (currentY < lastScrollY.current) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = async () => {
    localStorage.clear();
    setIsProfileOpen(false);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/";
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readAll: true }),
      });
    } catch {}
  };

  const handleMarkOneRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {}
  };

  const formatNotifTime = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  // Role-Specific Navigation Links
  const getNavLinks = () => {
    if (!isLoggedIn) {
      return [
        { name: "Explore Courses", href: "/explore" },
        { name: "About", href: "/about" },
        { name: "Pricing Packages", href: "/pricing" },
      ];
    }

    if (userRole === "admin") {
      return [
        { name: "Admin Console", href: "/admin" },
        { name: "Course Approvals", href: "/admin/courses" },
        { name: "Verify Mentors", href: "/admin/mentors" },
        { name: "User Directory", href: "/admin/users" },
        { name: "Bookings", href: "/admin/bookings" },
        { name: "Live Site", href: "/explore" },
      ];
    }

    if (userRole === "mentor") {
      return [
        { name: "Mentor Studio", href: "/dashboard/mentor/courses" },
        { name: "+ Add Course", href: "/dashboard/mentor/courses/new" },
        { name: "Student Bookings", href: "/dashboard/mentor/bookings" },
        { name: "Schedule & Slots", href: "/dashboard/mentor/availability" },
        { name: "Earnings", href: "/dashboard/mentor/earnings" },
        { name: "Explore", href: "/explore" },
      ];
    }

    // Default Learner
    return [
      { name: "Explore Courses", href: "/explore" },
      { name: "My Learning", href: "/dashboard/courses" },
      { name: "Skill Exchanges", href: "/dashboard/exchanges" },
      { name: "Mentorship Sessions", href: "/dashboard/sessions" },
      { name: "Token Wallet", href: "/dashboard/billing" },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <nav
      className={`sticky top-0 z-50 w-full glass border-b border-border transition-all duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section & Role Indicator */}
          <div className="flex items-center gap-3">
            <Link href={isLoggedIn ? (userRole === "admin" ? "/admin" : userRole === "mentor" ? "/dashboard/mentor/courses" : "/dashboard") : "/"} className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="SkillBridge Logo"
                className="w-9 h-9 rounded-xl object-cover shadow-md shadow-primary/20 border border-primary/30 transform group-hover:scale-105 transition-transform"
              />
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-primary/80">
                Skill<span className="text-primary">bridge</span>
              </span>
            </Link>

            {/* Role Header Badge */}
            {isLoggedIn && (
              <span
                className={`hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border shadow-xs ${
                  userRole === "admin"
                    ? "bg-red-500/10 text-red-500 border-red-500/20"
                    : userRole === "mentor"
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                }`}
              >
                {userRole === "admin" ? "🛡️ Admin Console" : userRole === "mentor" ? "🎓 Mentor Hub" : "📚 Learner Hub"}
              </span>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const isHighlight = link.name.startsWith("+");
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs font-semibold tracking-wide transition-all ${
                    isHighlight
                      ? "px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-xs"
                      : isActive
                      ? "text-primary font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Action Buttons & Dropdowns */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Learner Token Badge */}
            {isLoggedIn && userRole === "learner" && tokenBalance !== null && (
              <Link
                href="/dashboard/billing"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold hover:bg-amber-500/20 transition-all"
                title="Your Skill Tokens (Click to Top Up)"
              >
                <span>🪙</span>
                <span>{tokenBalance}</span>
                <span className="text-[10px] opacity-70">Tokens</span>
              </Link>
            )}

            {/* Quick Mentor Create Course Button */}
            {isLoggedIn && userRole === "mentor" && pathname !== "/dashboard/mentor/courses/new" && (
              <Link
                href="/dashboard/mentor/courses/new"
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-all shadow-xs flex items-center gap-1"
              >
                <span>+</span> New Course
              </Link>
            )}

            {/* Quick Admin Approvals Badge */}
            {isLoggedIn && userRole === "admin" && (
              <Link
                href="/admin/courses"
                className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-all"
              >
                Approvals ⚡
              </Link>
            )}

            {/* Search Icon Button */}
            <button
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                setIsNotifOpen(false);
                setIsProfileOpen(false);
              }}
              className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-200"
              aria-label="Toggle Search"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-200"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-3 relative">
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsNotifOpen(!isNotifOpen);
                      setIsProfileOpen(false);
                    }}
                    className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors relative"
                  >
                    <span>🔔</span>
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-xs">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl p-4 space-y-3 z-50">
                      <div className="flex justify-between items-center border-b border-border pb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-foreground">Notifications</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Live sync active" />
                        </div>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} className="text-[10px] text-primary font-bold hover:underline">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="space-y-2 max-h-56 overflow-y-auto divide-y divide-border/40">
                        {notifications.length === 0 ? (
                          <p className="py-4 text-center text-xs text-muted-foreground">No notifications yet.</p>
                        ) : (
                          notifications.map((n) => (
                            <button
                              key={n.id}
                              onClick={() => handleMarkOneRead(n.id)}
                              className="w-full pt-2 text-left space-y-0.5 hover:bg-accent/40 p-1.5 rounded-lg transition-colors block"
                            >
                              {n.title && (
                                <p className="text-xs font-bold text-foreground">{n.title}</p>
                              )}
                              <p className={`text-xs ${n.read ? "text-muted-foreground" : "text-foreground font-semibold"}`}>
                                {n.content}
                              </p>
                              <span className="text-[8px] text-muted-foreground">{formatNotifTime(n.createdAt)}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsProfileOpen(!isProfileOpen);
                      setIsNotifOpen(false);
                    }}
                    className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-xs transition-colors ${
                      userRole === "admin"
                        ? "bg-red-500/10 border-red-500/30 text-red-500 hover:border-red-500"
                        : userRole === "mentor"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:border-amber-500"
                        : "bg-primary/10 border-primary/20 text-primary hover:border-primary/50"
                    }`}
                  >
                    {userName.substring(0, 1).toUpperCase()}
                  </button>

                  {/* Profile Menu Dropdown Tailored to Role */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl p-2.5 space-y-1 z-50 text-left">
                      <div className="px-2.5 py-2 border-b border-border/60">
                        <p className="text-xs font-bold text-foreground truncate">{userName}</p>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider ${
                            userRole === "admin"
                              ? "bg-red-500/10 text-red-500 border border-red-500/20"
                              : userRole === "mentor"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          }`}
                        >
                          {userRole}
                        </span>
                      </div>

                      {/* Admin-Specific Menu */}
                      {userRole === "admin" && (
                        <>
                          <Link
                            href="/admin"
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                          >
                            🛡️ Admin Dashboard
                          </Link>
                          <Link
                            href="/admin/courses"
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                          >
                            📚 Course Approvals
                          </Link>
                          <Link
                            href="/admin/mentors"
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                          >
                            🎓 Mentor Verifications
                          </Link>
                          <Link
                            href="/admin/users"
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                          >
                            👥 User Directory
                          </Link>
                          <Link
                            href="/admin/settings"
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                          >
                            ⚙️ Platform Settings
                          </Link>
                        </>
                      )}

                      {/* Mentor-Specific Menu */}
                      {userRole === "mentor" && (
                        <>
                          <Link
                            href="/dashboard/mentor/courses"
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                          >
                            🎓 Course Management
                          </Link>
                          <Link
                            href="/dashboard/mentor/courses/new"
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                          >
                            ➕ Add New Course
                          </Link>
                          <Link
                            href="/dashboard/mentor/bookings"
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                          >
                            📅 Student Bookings
                          </Link>
                          <Link
                            href="/dashboard/mentor/earnings"
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                          >
                            💰 Earnings & Payouts
                          </Link>
                          <Link
                            href="/dashboard/mentor/availability"
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                          >
                            ⏰ Availability Slots
                          </Link>
                          <Link
                            href="/dashboard/messages"
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                          >
                            💬 Direct Messages
                          </Link>
                        </>
                      )}

                      {/* Learner-Specific Menu */}
                      {userRole === "learner" && (
                        <>
                          <Link
                            href="/dashboard/courses"
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                          >
                            📖 Enrolled Courses
                          </Link>
                          <Link
                            href="/dashboard/sessions"
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                          >
                            🗓️ Mentorship Sessions
                          </Link>
                          <Link
                            href="/dashboard/exchanges"
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                          >
                            🔄 Skill Exchanges
                          </Link>
                          <Link
                            href="/dashboard/billing"
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                          >
                            🪙 Token Wallet & Plans
                          </Link>
                          <Link
                            href="/dashboard/messages"
                            onClick={() => setIsProfileOpen(false)}
                            className="block px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                          >
                            💬 Messages
                          </Link>
                        </>
                      )}

                      <div className="border-t border-border/60 pt-1 mt-1">
                        <Link
                          href="/dashboard/settings"
                          onClick={() => setIsProfileOpen(false)}
                          className="block px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                        >
                          ⚙️ Account Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left block px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/5 rounded-lg transition-colors"
                        >
                          🚪 Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Auth Buttons */}
                <Link
                  href="/auth?mode=login"
                  className="text-xs font-semibold hover:text-primary transition-colors text-muted-foreground"
                >
                  Login
                </Link>
                <Link
                  href="/auth?mode=signup"
                  className="px-4 h-9 flex items-center justify-center text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/10 hover:shadow-primary/25"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {/* Theme Toggle Button for Mobile */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-200"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sliding Search Overlay */}
      {isSearchOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border p-4 z-40 animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center gap-3">
            <input
              type="text"
              autoFocus
              placeholder="Search courses, skills, mentors (e.g. Next.js, IELTS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-xs p-3 rounded-xl border border-input bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/95 transition-all shadow-md cursor-pointer"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground font-bold px-2"
            >
              Close
            </button>
          </form>
        </div>
      )}

      {/* Mobile Menu panel Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-4 space-y-2.5 relative z-40 text-left">
          {/* Mobile Role Badge */}
          {isLoggedIn && (
            <div className="px-3 py-2 rounded-lg bg-accent/50 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold">{userName}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{userRole}</p>
              </div>
              {userRole === "learner" && tokenBalance !== null && (
                <span className="text-xs font-bold text-amber-500">🪙 {tokenBalance} Tokens</span>
              )}
            </div>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {link.name}
            </Link>
          ))}
          <div className="border-t border-border/60 my-2 pt-2 space-y-2">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  Account Settings
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left block px-3 py-2 rounded-md text-sm font-semibold text-red-500 hover:bg-red-500/5"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth?mode=login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  Login
                </Link>
                <Link
                  href="/auth?mode=signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block mx-3 px-4 py-2 text-center text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
