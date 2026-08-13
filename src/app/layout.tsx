import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getCurrentUserId } from "@/lib/session";
import { getUserLabel } from "@/lib/userLabel";
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

async function UserLabel({ userId, className }: { userId: string; className: string }) {
  const label = await getUserLabel(userId);
  if (!label) return null;
  return <span className={className}>{label}</span>;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = await getCurrentUserId();
  const authenticated = !!userId;

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
              <NavLinks
                userLabelSlot={
                  <Suspense fallback={null}>
                    <UserLabel
                      userId={userId}
                      className="px-2 text-neutral-500 whitespace-nowrap max-w-[10rem] truncate"
                    />
                  </Suspense>
                }
              />
              <div className="md:hidden flex items-center gap-2 min-w-0">
                <Suspense fallback={null}>
                  <UserLabel
                    userId={userId}
                    className="text-sm text-neutral-500 truncate max-w-[8rem]"
                  />
                </Suspense>
                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="px-2 py-2 rounded-md text-sm text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 shrink-0"
                  >
                    ログアウト
                  </button>
                </form>
              </div>
            </div>
          </header>
        )}
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6">
          {children}
        </main>
        {authenticated && <BottomNav />}
      </body>
    </html>
  );
}
