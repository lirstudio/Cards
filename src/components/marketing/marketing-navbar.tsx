"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SystemLogo } from "@/components/brand/system-logo";

const NAV_LINKS = [
  { label: "יכולות", href: "#features" },
  { label: "איך זה עובד", href: "#how-it-works" },
  { label: "תמחור", href: "#pricing" },
  { label: "שאלות נפוצות", href: "#faq" },
] as const;

export function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-[rgba(214,235,253,0.19)] bg-black/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="shrink-0">
          <SystemLogo heightClass="h-7" />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium tracking-wide text-[#a1a4a5] transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full border border-[rgba(214,235,253,0.19)] px-5 py-2 text-sm font-medium text-[#f0f0f0] transition-colors hover:bg-white/10"
          >
            התחברות
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            התחילו בחינם
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
