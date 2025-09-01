// Dans : src/app/Sidebar.tsx

"use client";

// NOUVEAU : On importe les icônes nécessaires
import { Activity, LayoutGrid, Users, Settings, Database } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  // MODIFIÉ : La liste des liens est mise à jour
  const navItems = [
    { href: "/journal-activite", icon: Activity,           label: "Journal d'activité" },
    { href: "/utilisateurs",       icon: Users,              label: "Utilisateurs" },
    { href: "/tableau-de-bord",    icon: LayoutGrid,         label: "Tableau de bord global" },
    { href: "/base-de-donnees",    icon: Database,           label: "Base de données" },
    { href: "/parametres",         icon: Settings,           label: "Paramètres du système" },
  ];
  return (
    <aside className="w-64 flex-shrink-0 bg-[#0B1524] p-6 hidden md:flex flex-col">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-white"></div>
        </div>
        <span className="font-semibold text-lg text-white">Innovex Consulting</span>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          // La logique pour déterminer quel lien est actif reste la même
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-[#2A3F5F] text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* NOUVEAU : Ajout de la section de profil utilisateur en bas */}
      <div className="mt-auto flex items-center gap-3 border-t border-white/10 pt-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-600">
            {/* Vous pouvez mettre ici l'initiale de l'utilisateur connecté */}
            <span className="font-semibold text-white">N</span> 
        </div>
        <div>
            <p className="text-sm font-medium text-white">Nabil</p>
            <a href="#" className="text-xs text-slate-400 hover:underline">Se déconnecter</a>
        </div>
      </div>
    </aside>
  );
}