import Link from "next/link";
import { SystemLogo } from "@/components/brand/system-logo";

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[rgba(214,235,253,0.19)] px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-6">
          <SystemLogo heightClass="h-6" />
          <span className="text-xs text-[#464a4d]">
            &copy; {year} Cards. כל הזכויות שמורות.
          </span>
        </div>

        <nav className="flex gap-6 text-sm text-[#a1a4a5]">
          <Link href="/login" className="transition-colors hover:text-white">
            התחברות
          </Link>
          <Link href="/signup" className="transition-colors hover:text-white">
            הרשמה
          </Link>
          <a href="#features" className="transition-colors hover:text-white">
            יכולות
          </a>
          <a href="#pricing" className="transition-colors hover:text-white">
            תמחור
          </a>
        </nav>
      </div>
    </footer>
  );
}
