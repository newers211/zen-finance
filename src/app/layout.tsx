import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Используем стандартный шрифт Inter вместо Geist
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zen Finance",
  description: "Financial tracker for 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}