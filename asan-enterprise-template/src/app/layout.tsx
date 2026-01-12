import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASAN Enterprise Template",
  description: "ASANMOD v1.0.0 SaaS Starter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
