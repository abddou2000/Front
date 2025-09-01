"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import { Sidebar } from "./Sidebar"; // sidebar global (hors configurateur)

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";

  const hideGlobalSidebar =
    pathname === "/" ||
    pathname.startsWith("/mot-de-passe-oublie") ||
    pathname.startsWith("/configurateur");

  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {hideGlobalSidebar ? (
            children
          ) : (
            <div className="flex h-screen bg-gray-50">
              <Sidebar />
              <main className="flex-1 overflow-y-auto min-w-0">{children}</main>
            </div>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
