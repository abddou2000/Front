"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Home,
  Building2,
  BadgeEuro,
  CalendarClock,
  BadgePlus,
  FileSignature,
  BadgePercent,
  TimerReset,
  ClipboardList,
  Layers3,
  Menu,
} from "lucide-react";

type NavItem = { label: string; href: string; icon: React.ComponentType<any> };

const navItems: NavItem[] = [
  { label: "Accueil", href: "/configurateur/accueil", icon: Home },
  { label: "Paramétrage des données administratives", href: "/configurateur/parametrage-donnees-administratives", icon: Building2 },
  { label: "Paramétrage des cotisations", href: "/configurateur/parametrage-cotisations", icon: BadgeEuro },
  { label: "Paramétrage des absences", href: "/configurateur/parametrage-absences", icon: CalendarClock },
  { label: "Paramétrage des primes et indemnités", href: "/configurateur/parametrage-primes-indemnites", icon: BadgePlus },
  { label: "Paramétrage barème IR", href: "/configurateur/parametrage-bareme-ir", icon: BadgePercent },
  { label: "Paramétrage des données temps", href: "/configurateur/parametrage-donnees-temps", icon: TimerReset },
  { label: "Paramétrage des mesures et motifs", href: "/configurateur/parametrage-mesures-motifs", icon: ClipboardList },
  { label: "Paramétrage des états", href: "/configurateur/parametrage-etats", icon: Layers3 },
  { label: "Paramétrage des profils et grilles salariales", href: "/configurateur/parametrage-profils-grilles", icon: FileSignature },
];

export function ConfigSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname?.() || "";

  return (
    <>
      {/* Mobile menu button */}
      <button
        aria-label="Ouvrir le menu"
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#0B1524] text-white shadow ring-1 ring-white/10"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 flex-shrink-0 bg-[#0B1524] p-5 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo and title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center shadow-inner">
            <div className="w-5 h-5 rounded-full bg-white" />
          </div>
          <span className="font-semibold text-lg text-white">Innovex Consulting</span>
        </div>

        <div className="h-px bg-white/10 mb-3" />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overscroll-contain pr-3 space-y-2">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const iconColor = active ? "text-white" : "text-slate-300 group-hover:text-white";
            return (
              <a
                key={item.label}
                href={item.href}
                className={`group relative flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/20 ${
                  active ? "text-white bg-white/10" : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span
                  className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-md transition-opacity ${
                    active ? "bg-blue-400 opacity-100" : "opacity-0 group-hover:opacity-60 bg-white/20"
                  }`}
                />
                <span className="flex size-5 items-center justify-center flex-none">
                  <item.icon className={`size-[18px] stroke-[1.8] ${iconColor}`} />
                </span>
                <span className="whitespace-normal break-words leading-tight">
                  {item.label}
                </span>
              </a>
            );
          })}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div 
          className="md:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}

export default ConfigSidebar;
