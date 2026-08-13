import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { cookies } from "next/headers";
import "./globals.css";
import { SESSION_COOKIE, verifySessionValue } from "@/lib/auth";
import { NavLinks } from "@/components/NavLinks";
import { BottomNav } from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyCar Maintenance",
  description: "車・バイクのメンテナンス管理",
  appleWebApp: {
    capable: true,
    title: "MyCar",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const authenticated = verifySessionValue(
    cookieStore.get(SESSION_COOKIE)?.value
  );

  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        {authenticated && (
          <header className="border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-10 bg-white/90 dark:bg-neutral-950/90 backdrop-blur">
            <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
              <Link href="/" className="font-semibold text-lg shrink-0">
                🚗 MyCar
              </Link>
              <NavLinks />
              <form action="/api/auth/logout" method="POST" className="md:hidden">
                <button
                  type="submit"
                  className="px-3 py-2 rounded-md text-sm text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  ログアウト
                </button>
              </form>
            </div>
          </header>
        )}
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-6">
          {children}
        </main>
        {authenticated && <BottomNav />}
      </body>
    </html>
  );
}
