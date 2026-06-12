import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { PostHogProvider } from "@/components/analytics/PostHogProvider";

import "./globals.css";

const inter = Inter({
  display: "swap",
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JobPilot",
  description: "AI-powered job hunting assistant for technical job seekers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
