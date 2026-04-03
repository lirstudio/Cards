import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import { AuthHashRedirect } from "@/components/auth/auth-hash-redirect";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Cards — עמודי נחיתה",
    template: "%s | Cards",
  },
  description: "פלטפורמה ליצירת עמודי נחיתה מותאמים אישית",
  openGraph: { locale: "he_IL" },
  icons: {
    icon: "/brand/cards-logo.svg",
    apple: "/brand/cards-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full`}>
      <body className="min-h-full bg-[#f8f9fa] font-sans text-neutral-900 antialiased">
        <AuthHashRedirect />
        {children}
      </body>
    </html>
  );
}
