import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/ThemeProvider";
import { ToastProvider } from "@/lib/ToastProvider";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dziennik Treningowy",
  description: "Osobisty dziennik treningowy — dane trzymane lokalnie na Twoim telefonie.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Dziennik",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0c0f" },
    { media: "(prefers-color-scheme: light)", color: "#f5f6f7" },
  ],
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className="dark" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${inter.variable}`}>
        <ThemeProvider>
          <ToastProvider>
            <ServiceWorkerRegister />
            <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col overscroll-y-contain sm:max-w-lg md:max-w-2xl">
              <main className="flex-1 overflow-y-auto pb-28 pt-safe-t">{children}</main>
              <BottomNav />
            </div>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
