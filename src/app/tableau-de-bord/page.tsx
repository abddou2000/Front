// Dans : src/app/tableau-de-bord/page.tsx
"use client";

import { useState, useEffect } from "react";
import { StatCard } from "../components/StatCard";
import { UserActivityChart } from "../components/UserActivityChart";
import { Users, FileText, CalendarClock, Briefcase, LucideIcon } from "lucide-react";
import 'animate.css';

// CORRECTION N°1 : On crée un type pour la forme de nos données de statistiques
type StatData = {
  icon: LucideIcon;
  label: string;
  value: string;
  description: string;
  tooltipText: string;
  color: 'blue' | 'purple' | 'amber' | 'green';
};

// --- Composant Squelette (inchangé) ---
function StatCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white p-5 rounded-xl shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse"></div>
        <div className="h-4 w-24 rounded bg-gray-200 animate-pulse"></div>
      </div>
      <div className="mt-auto pt-4 h-8 w-16 rounded bg-gray-200 animate-pulse"></div>
      <div className="mt-2 h-3 w-32 rounded bg-gray-200 animate-pulse"></div>
    </div>
  );
}


export default function DashboardPage() {
  // CORRECTION N°2 : On dit à useState que statsData sera un TABLEAU de StatData (ou null)
  const [statsData, setStatsData] = useState<StatData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      try {
        // Les données simulées correspondent maintenant exactement au type StatData
        const simulatedData: StatData[] = [
          { icon: Users, label: "Utilisateurs actifs", value: "1,204", description: "Connectés ces 30 derniers jours", tooltipText: "Nombre d'utilisateurs uniques connectés...", color: 'blue' },
          { icon: Briefcase, label: "Employés enregistrés", value: "87", description: "Fiches salariés actives", tooltipText: "Nombre de fiches d'employés actives...", color: 'purple' },
          { icon: FileText, label: "Fiches de paie", value: "172", description: "Générées ce mois-ci", tooltipText: "Nombre de bulletins de paie générés...", color: 'amber' },
          { icon: CalendarClock, label: "Congés en attente", value: "12", description: "En attente de validation RH", tooltipText: "Nombre de demandes de congés en attente...", color: 'green' },
        ];
        setStatsData(simulatedData);
        
      } catch (error) {
        console.error("Erreur de chargement des stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 animate__animated animate__fadeInDown">
        Tableau de bord global
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          // CORRECTION N°3 : Le .map() est maintenant garanti de fonctionner car TypeScript sait que statsData est un tableau
          statsData && statsData.map((stat, index) => (
            <div 
              key={stat.label} 
              className="animate__animated animate__fadeInUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <StatCard {...stat} />
            </div>
          ))
        )}
      </div>
      
      <div className="mt-8">
        <div 
          className="animate__animated animate__fadeInUp" 
          style={{ animationDelay: '400ms' }}
        >
          <UserActivityChart /> 
        </div>
      </div>
    </div>
  );
}