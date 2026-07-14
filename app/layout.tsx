import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pl8 — Eat well, effortlessly",
  description:
    "AI nutrition that scans your plate, reads your fridge, and finds the cheapest, closest store for what's missing.",
};

export const viewport: Viewport = {
  themeColor: "#F2F2F7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh pb-28">{children}</body>
    </html>
  );
}
