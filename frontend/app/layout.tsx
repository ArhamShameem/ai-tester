import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/auth-context";
import { Navbar } from "../components/navbar";

export const metadata: Metadata = {
  title: "AI Tester Platform — Automated AI Testing",
  description: "Playwright-based automated testing platform powered by local AI and intelligent failure diagnosis."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f8faf7] text-slate-900 antialiased selection:bg-[#2e633f] selection:text-white">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
