"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface MockNotification {
  id: string;
  text: string;
  time: string;
  read: boolean;
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
  const [userName, setUserName] = useState("Fahim Hossain");
  const [userRole, setUserRole] = useState("learner");

  // Notifications state
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<MockNotification[]>([
    { id: "n-1", text: "Session confirmed with Tanzim Hasan", time: "30m ago", read: false },
    { id: "n-2", text: "New chat message from Sabrina Rahman", time: "1h ago", read: false },
    { id: "n-3", text: "Tokens transaction invoice INV-1024 paid", time: "1d ago", read: true }
  ]);

  // Profile dropdown state
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Global search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Sync auth state & theme with document class list
  useEffect(() => {
    // Auth Check
    const storedEmail = localStorage.getItem("userEmail");
    const storedName = localStorage.getItem("userName");
    const storedRole = localStorage.getItem("userRole");
    
    setTimeout(() => {
      if (storedEmail) {
        setIsLoggedIn(true);
        if (storedName) setUserName(storedName);
        if (storedRole) setUserRole(storedRole);
      } else {
        setIsLoggedIn(false);
      }
    }, 0);

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
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("isEmailVerified");
    localStorage.removeItem("isOnboarded");
    localStorage.removeItem("tokenBalance");
    localStorage.removeItem("mentorEarnings");
    localStorage.removeItem("scheduledSessions");
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

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const navLinks = [
    { name: "Explore Courses", href: "/explore" },
    { name: "About", href: "/about" },
    { name: "Pricing Packages", href: "/pricing" }
  ];

  return (
    <nav className={`sticky top-0 z-50 w-full glass border-b border-border transition-all duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold shadow-md shadow-primary/20 transform group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-primary/80">
                Skill<span className="text-primary">bridge</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs font-semibold tracking-wide transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Action Buttons & Dropdowns */}
          <div className="hidden md:flex items-center gap-4">
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
              <div className="flex items-center gap-4 relative">
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
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-background animate-pulse" />
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl p-4 space-y-3 z-50">
                      <div className="flex justify-between items-center border-b border-border pb-2">
                        <span className="text-xs font-bold text-foreground">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} className="text-[10px] text-primary font-bold hover:underline">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-border/40">
                        {notifications.map((n) => (
                          <div key={n.id} className="pt-2 text-left space-y-0.5">
                            <p className={`text-xs ${n.read ? "text-muted-foreground" : "text-foreground font-semibold"}`}>
                              {n.text}
                            </p>
                            <span className="text-[8px] text-muted-foreground">{n.time}</span>
                          </div>
                        ))}
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
                    className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs hover:border-primary/50 transition-colors"
                  >
                    {userName.substring(0, 1)}
                  </button>

                  {/* Profile Menu Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl p-2.5 space-y-1.5 z-50 text-left">
                      <div className="px-2.5 py-1.5 border-b border-border/60">
                        <p className="text-xs font-bold text-foreground truncate">{userName}</p>
                        <p className="text-[9px] text-muted-foreground capitalize font-semibold mt-0.5">{userRole}</p>
                      </div>
                      
                      <Link
                        href="/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-2.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                      >
                        Dashboard Overview
                      </Link>
                      
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-2.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                      >
                        Profile Settings
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-2.5 py-2 text-xs font-medium text-red-500 hover:bg-red-500/5 rounded-lg transition-colors"
                      >
                        Sign Out
                      </button>
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
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  Dashboard Overview
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
