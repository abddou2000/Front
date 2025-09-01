// Dans : src/app/components/StatCard.tsx

import type { LucideIcon } from "lucide-react";
// NOUVEAU : On importe les composants nécessaires pour le tooltip
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  description: string;
  tooltipText?: string; 
  color?: 'blue' | 'purple' | 'amber' | 'green';
}

// ==========================================================
// C'EST CETTE PARTIE QUI A ÉTÉ CORRIGÉE
// ==========================================================
const colorClasses = {
  blue:   { bg: "bg-blue-50",    text: "text-blue-600" },
  purple: { bg: "bg-purple-50",  text: "text-purple-600" },
  amber:  { bg: "bg-amber-50",   text: "text-amber-600" },
  green:  { bg: "bg-green-50",   text: "text-green-600" },
};
// ==========================================================
// FIN DE LA CORRECTION
// ==========================================================


export function StatCard({ icon: Icon, label, value, description, tooltipText, color = 'blue' }: StatCardProps) {
  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className="flex flex-col h-full bg-white p-5 rounded-xl shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-3 cursor-help">
              <div className={`${selectedColor.bg} h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg`}>
                <Icon className={`${selectedColor.text} h-5 w-5`} />
              </div>
              <p className="text-sm font-medium text-gray-600">{label}</p>
            </div>
          </TooltipTrigger>
          {tooltipText && (
            <TooltipContent>
              <p>{tooltipText}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <p className="mt-auto pt-4 text-3xl font-bold text-gray-800">{value}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}