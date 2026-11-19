import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AIChatbot } from "@/components/ai/AIChatbot";

export const metadata: Metadata = {
  title: "DemandLend | Campus Resource Sharing & Lending Network",
  description:
    "List what you don't use, borrow what you need for free or fair rent. AI-powered search, reputation scoring, and demand calendar for campuses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50/50 font-sans text-slate-900 antialiased">
        <AuthProvider>
          <DataProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <AIChatbot />
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
