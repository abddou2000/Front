// Dans : src/app/layout.tsx

"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "./Sidebar";
import "./globals.css";
import { usePathname } from "next/navigation";

// NOUVEAU : On importe le "fournisseur" d'authentification
import { AuthProvider } from "@/context/AuthContext"; 
// Note : Assurez-vous que l'alias `@/` est bien configuré pour pointer vers `src/`.
// Si ce n'est pas le cas, le chemin sera "../context/AuthContext".

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const pagesWithoutSidebar = [
    '/',
    '/mot-de-passe-oublie',
    // La page de confirmation est à l'intérieur de /mot-de-passe-oublie,
    // on va donc utiliser `startsWith` pour une logique plus robuste
  ];
  
  // Logique améliorée pour couvrir toutes les sous-pages
  const shouldHideSidebar = 
    pathname === '/' || 
    pathname.startsWith('/mot-de-passe-oublie');

    
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* ========================================================== */}
        {/* LA SEULE MODIFICATION EST D'AJOUTER AuthProvider ICI */}
        {/* ========================================================== */}
        <AuthProvider>
          <div className="flex h-screen bg-gray-50">
            {!shouldHideSidebar && <Sidebar />}
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}