import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BudgetApp",
  description: "Personal finance and budgeting tool",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased bg-background`}>
        <main className="pb-[calc(5.5rem+env(safe-area-inset-bottom))] min-h-screen max-w-lg mx-auto">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
