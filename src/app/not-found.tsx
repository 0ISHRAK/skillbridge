import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Background glow animations */}
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/3 right-1/3 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="space-y-6 max-w-md animate-scale-up">
        {/* Visual symbol */}
        <div className="text-7xl">🔍</div>

        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tight text-primary">404</h1>
          <h2 className="text-xl font-bold text-foreground">Page Not Found / পাতাটি পাওয়া যায়নি</h2>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <div className="pt-6 flex justify-center gap-3">
          <Link
            href="/"
            className="px-5 h-10 flex items-center justify-center font-bold text-xs rounded-lg border border-border bg-card hover:bg-accent text-foreground transition-all"
          >
            Go to Homepage
          </Link>
          
          <Link
            href="/dashboard"
            className="px-5 h-10 flex items-center justify-center font-bold text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/10"
          >
            My Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
