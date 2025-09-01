"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Search,
  Calendar as CalendarIcon, 
  FilePlus, 
  FileText, 
  FileMinus,
  Zap,
  LucideIcon,
  ChevronLeft,
  ChevronRight,
  FilterX, 
} from "lucide-react";
import 'animate.css';

// --- TYPES ---
type ActionType = "Connexion" | "Création" | "Modification" | "Suppression";
type UserRole = "Admin" | "Employé" | "RH";
type LogEntry = {
  id: number;
  date: Date;
  user: { name: string; role: UserRole; };
  actionType: ActionType;
  details: string;
};

// --- Données d'exemple ---
const initialLogs: LogEntry[] = [
  { id: 1, date: new Date(2024, 6, 15, 14, 30), user: { name: 'Nabil Admin', role: 'Admin' }, actionType: 'Connexion', details: 'S\'est connecté avec succès depuis l\'IP 192.168.1.1' },
  { id: 2, date: new Date(2024, 6, 15, 14, 32), user: { name: 'Alice Durand', role: 'Admin' }, actionType: 'Modification', details: 'A modifié le profil de l\'utilisateur Marc Dupuis (ID: 3)' },
  { id: 3, date: new Date(2024, 6, 15, 15, 1), user: { name: 'Emma Perrin', role: 'RH' }, actionType: 'Création', details: 'A créé un nouveau contrat pour Chloé Dubois' },
  { id: 4, date: new Date(2024, 6, 16, 9, 0), user: { name: 'Nabil Admin', role: 'Admin' }, actionType: 'Suppression', details: 'A supprimé l\'utilisateur test (ID: 99)' },
  { id: 5, date: new Date(2024, 6, 16, 10, 15), user: { name: 'Marc Dupuis', role: 'Employé' }, actionType: 'Modification', details: 'A mis à jour ses informations personnelles' },
  { id: 6, date: new Date(2024, 6, 16, 11, 0), user: { name: 'Alice Durand', role: 'Admin' }, actionType: 'Création', details: 'A créé un nouveau rôle "Auditeur"' },
  { id: 7, date: new Date(2024, 6, 16, 12, 45), user: { name: 'Nabil Admin', role: 'Admin' }, actionType: 'Modification', details: 'A réinitialisé le mot de passe de Emma Perrin' },
  { id: 8, date: new Date(2024, 6, 17, 8, 30), user: { name: 'Emma Perrin', role: 'RH' }, actionType: 'Connexion', details: 'S\'est connecté avec succès depuis l\'IP 208.67.222.222' },
];
const ITEMS_PER_PAGE = 8;

// ==========================================================
// CORRECTION : Les fonctions sont maintenant complètes
// ==========================================================
const getActionConfig = (type: ActionType): { icon: LucideIcon, color: string, bg: string } => {
  switch (type) {
    case "Connexion":    return { icon: Zap,         color: "text-amber-600", bg:"bg-amber-50" };
    case "Création":     return { icon: FilePlus,    color: "text-green-600", bg:"bg-green-50" };
    case "Modification": return { icon: FileText,    color: "text-blue-600", bg:"bg-blue-50" };
    case "Suppression":  return { icon: FileMinus,   color: "text-red-600", bg:"bg-red-50" };
    default:             return { icon: Zap,         color: "text-gray-600", bg:"bg-gray-50" };
  }
};
const getRoleBadgeClass = (role: UserRole): string => {
  switch (role) {
    case "Admin":   return "bg-purple-100 text-purple-700";
    case "RH":      return "bg-blue-100 text-blue-700";
    case "Employé": return "bg-orange-100 text-orange-700";
    default:        return "bg-gray-100 text-gray-700";
  }
};
// ==========================================================
// FIN DE LA CORRECTION
// ==========================================================


// --- La Page ---
export default function ActivityLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ date: '', user: 'tous', action: 'toutes' });

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const userMatch = filters.user === 'tous' || log.user.name === filters.user;
      const actionMatch = filters.action === 'toutes' || log.actionType === filters.action;
      const dateMatch = !filters.date || log.date.toLocaleDateString('fr-FR').includes(filters.date);
      return userMatch && actionMatch && dateMatch;
    });
  }, [logs, filters]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);
  
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = useMemo(() => {
    return filteredLogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [filteredLogs, currentPage]);

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setFilters({ date: '', user: 'tous', action: 'toutes' });
  };
  
  const uniqueUsers = useMemo(() => [...new Set(logs.map(log => log.user.name))], [logs]);

  return (
    <div className="p-6 md:p-10 h-full flex flex-col">
      <div className="animate__animated animate__fadeInDown">
        <h1 className="text-3xl font-bold text-gray-800">Journal d'activité</h1>
        <p className="text-gray-500 mt-1">Suivez toutes les actions importantes réalisées sur la plateforme.</p>
      </div>
      
      <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border animate__animated animate__fadeInUp" style={{ animationDelay: '100ms' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Rechercher par date"
              className="w-full h-11 rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-sm"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
            />
          </div>
          <select 
            className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-500"
            value={filters.user}
            onChange={(e) => handleFilterChange('user', e.target.value)}
          >
            <option value="tous">Tous les utilisateurs</option>
            {uniqueUsers.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <select 
            className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-500"
            value={filters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
          >
            <option value="toutes">Toutes les actions</option>
            <option value="Connexion">Connexion</option>
            <option value="Création">Création</option>
            <option value="Modification">Modification</option>
            <option value="Suppression">Suppression</option>
          </select>
          <button onClick={clearFilters} className="h-11 flex items-center justify-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold border text-sm transition-colors">
            <FilterX className="h-4 w-4"/> 
            <span>Effacer</span>
          </button>
        </div>
      </div>

      <div className="mt-6 flex-1 bg-white rounded-lg shadow-sm border overflow-hidden animate__animated animate__fadeInUp flex flex-col" style={{ animationDelay: '200ms' }}>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm">
            <thead className="text-gray-500 bg-gray-50/70 sticky top-0">
              <tr className="[&>th]:py-3 [&>th]:px-4 [&>th]:font-semibold text-left">
                <th className="w-[25%]">Utilisateur concerné</th>
                <th className="w-[15%]">Type d'action</th>
                <th>Détail de l'action</th>
                <th className="w-[15%] text-right">Date et Heure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedLogs.map((log) => {
                const { icon: Icon, color, bg } = getActionConfig(log.actionType);
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 text-xs font-semibold">
                          {log.user.name.charAt(0)}
                        </div>
                        <div>
                           <p className="font-medium text-gray-800">{log.user.name}</p>
                           <p className={`text-xs ${getRoleBadgeClass(log.user.role)} w-fit px-1.5 py-0.5 rounded-full font-semibold`}>{log.user.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full ${bg}`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                        <span className={`font-semibold text-xs ${color}`}>{log.actionType}</span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-600">{log.details}</td>
                    <td className="p-3 text-right text-gray-500">
                      <div>{log.date.toLocaleDateString('fr-FR')}</div>
                      <div className="text-xs">{log.date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                  </tr>
                )
              })}
               {paginatedLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">Aucun log ne correspond à vos filtres.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t p-2 flex items-center justify-end gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 flex items-center justify-center rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50"
            > <ChevronLeft className="h-4 w-4" /> </button>
            <span className="text-sm font-medium text-gray-600">Page {currentPage} sur {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 flex items-center justify-center rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50"
            > <ChevronRight className="h-4 w-4" /> </button>
        </div>
      </div>
    </div>
  );
}