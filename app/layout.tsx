import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brain Brew Ride | Participant Guide",
  description: "Everything you need for Brain Brew Ride, September 19–21, 2026 in San Francisco.",
  icons: {
    icon: { url: "/logo.png", type: "image/png" },
    shortcut: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
