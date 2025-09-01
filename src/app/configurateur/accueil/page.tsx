"use client";
import React from "react";
import {
  Building2,
  BadgeEuro,
  CalendarClock,
  BadgePlus,
  BadgePercent,
  TimerReset,
  ClipboardList,
  FileSignature,
  Layers3,
  ArrowRight,
} from "lucide-react";

type LinkItem = {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
};

const links: LinkItem[] = [
  { title: "Données administratives", href: "/configurateur/parametrage-donnees-administratives", icon: Building2 },
  { title: "Cotisations", href: "/configurateur/parametrage-cotisations", icon: BadgeEuro },
  { title: "Absences", href: "/configurateur/parametrage-absences", icon: CalendarClock },
  { title: "Primes & indemnités", href: "/configurateur/parametrage-primes-indemnites", icon: BadgePlus },
  { title: "Barème IR", href: "/configurateur/parametrage-bareme-ir", icon: BadgePercent },
  { title: "Données temps", href: "/configurateur/parametrage-donnees-temps", icon: TimerReset },
  { title: "Mesures & motifs", href: "/configurateur/parametrage-mesures-motifs", icon: ClipboardList },
  { title: "Profils & grilles", href: "/configurateur/parametrage-profils-grilles", icon: FileSignature },
  { title: "États", href: "/configurateur/parametrage-etats", icon: Layers3 },
];

export default function Page() {
  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* En-tête simple */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">Accueil</h1>
          </div>
        </div>

        {/* Carte bienvenue minimaliste */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <p className="text-base text-gray-800">
            Bienvenue, <span className="font-semibold">Name Surname</span>
          </p>
          <p className="text-sm text-gray-500">Rôle : Configurateur</p>
        </div>

        {/* Raccourcis simples */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">Raccourcis</h2>
            <a
              href="/configurateur/parametrage-donnees-administratives"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              Commencer <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:bg-gray-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100">
                  <l.icon className="h-4 w-4 text-gray-700" />
                </span>
                <span className="text-sm text-gray-800 group-hover:text-gray-900">
                  {l.title}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
