import type { Metadata } from "next";
import { Inter, Heebo } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

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
    <html lang="he" dir="rtl" className={`${inter.variable} ${heebo.variable} h-full`}>
      <body className="min-h-full bg-black font-sans text-[#f0f0f0] antialiased">
        {children}
      </body>
    </html>
  );
}
