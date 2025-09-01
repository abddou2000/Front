// Dans : src/app/base-de-donnees/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { 
  Trash2, 
  LoaderCircle, 
  DownloadCloud, 
  Search,
  HardDriveDownload,
  FileClock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SuccessToast } from '../components/SuccessToast';
import { PasswordConfirmModal } from '../components/PasswordConfirmModal';
import 'animate.css';

// --- Type pour une sauvegarde ---
type Backup = {
  id: string;
  date: string;
  time: string;
  size: string; // ex: "15.4 MB"
  createdBy: "Automatique" | "Manuel";
};

// --- Données d'exemple pour l'historique ---
const initialBackups: Backup[] = [
  { id: 'backup-123', date: '15 Juil. 2024', time: '02:00', size: '15.4 MB', createdBy: 'Automatique' },
  { id: 'backup-122', date: '14 Juil. 2024', time: '02:00', size: '15.2 MB', createdBy: 'Automatique' },
  { id: 'backup-121', date: '13 Juil. 2024', time: '11:34', size: '14.9 MB', createdBy: 'Manuel' },
  { id: 'backup-120', date: '12 Juil. 2024', time: '02:00', size: '14.8 MB', createdBy: 'Automatique' },
  { id: 'backup-119', date: '11 Juil. 2024', time: '02:00', size: '14.7 MB', createdBy: 'Automatique' },
  { id: 'backup-118', date: '10 Juil. 2024', time: '09:01', size: '14.5 MB', createdBy: 'Manuel' },
  { id: 'backup-117', date: '09 Juil. 2024', time: '02:00', size: '14.3 MB', createdBy: 'Automatique' },
];

const ITEMS_PER_PAGE = 5;

// --- LA PAGE PRINCIPALE ---
export default function DatabasePage() {
  const [backups, setBackups] = useState<Backup[]>(initialBackups);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // ==========================================================
  // CORRECTION : Les fonctions sont maintenant remplies
  // ==========================================================
  const handleBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      const now = new Date();
      const newBackup: Backup = {
        id: `backup-${Date.now()}`,
        date: now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', ''),
        time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        size: `${(Math.random() * (16 - 15) + 15).toFixed(1)} MB`,
        createdBy: 'Manuel',
      };
      // Ajoute la nouvelle sauvegarde en haut de la liste
      setBackups(prev => [newBackup, ...prev]);
      setIsBackingUp(false);
      setToast({ show: true, message: "Sauvegarde de la base de données terminée." });
      setCurrentPage(1); // Revenir à la première page
    }, 2500);
  };
  
  const handleOpenConfirmModal = () => {
    setIsConfirmModalOpen(true);
  };

  const executeDelete = (password: string) => {
    setIsDeleting(true); 
    setTimeout(() => {
      if (password === "admin") {
        setIsConfirmModalOpen(false);
        setToast({ show: true, message: "Nettoyage des anciennes sauvegardes effectué." });
      } else {
        setToast({ show: true, message: "Mot de passe incorrect !" });
      }
      setIsDeleting(false); 
    }, 2000);
  };
  // ==========================================================
  // FIN DE LA CORRECTION
  // ==========================================================
  
  // --- NOUVEAU : Logique de recherche et de pagination ---
  const filteredBackups = useMemo(() => {
    return backups.filter(b => 
      b.date.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [backups, searchQuery]);

  const totalPages = Math.ceil(filteredBackups.length / ITEMS_PER_PAGE);
  const paginatedBackups = filteredBackups.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <div className="p-6 md:p-10">
        <div className="animate__animated animate__fadeInDown">
          <h1 className="text-3xl font-bold text-gray-800">Gestion de la Base de Données</h1>
          <p className="text-gray-500 mt-1">Sauvegardez et gérez les archives de vos données critiques.</p>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate__animated animate__fadeInUp" style={{animationDelay: '100ms'}}>
          <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col md:flex-row items-center gap-4">
            <div className="mx-auto md:mx-0 h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-lg bg-blue-100">
              <HardDriveDownload className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-gray-800">Sauvegarde Manuelle</h3>
              <p className="text-xs text-gray-500 mt-1">Créez une sauvegarde instantanée de toutes vos données.</p>
            </div>
            <button
              onClick={handleBackup}
              disabled={isBackingUp || isDeleting}
              className="mt-4 md:mt-0 md:ml-auto w-full md:w-auto inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors disabled:bg-blue-400 disabled:cursor-wait"
            >
              {isBackingUp ? ( <><LoaderCircle className="h-4 w-4 animate-spin" /><span>Sauvegarde...</span></> ) : ( "Lancer" )}
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col md:flex-row items-center gap-4">
             <div className="mx-auto md:mx-0 h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-lg bg-orange-100">
                <Trash2 className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="font-semibold text-gray-800">Nettoyer les Archives</h3>
                <p className="text-xs text-gray-500 mt-1">Supprimez les sauvegardes anciennes pour libérer de l'espace.</p>
              </div>
               <button
                onClick={handleOpenConfirmModal}
                disabled={isBackingUp || isDeleting}
                className="mt-4 md:mt-0 md:ml-auto w-full md:w-auto inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors disabled:opacity-50"
              >
                 {isDeleting ? ( <><LoaderCircle className="h-4 w-4 animate-spin" /><span>Nettoyage...</span></> ) : ( "Nettoyer" )}
              </button>
          </div>

        </div>

        <div className="mt-10 animate__animated animate__fadeInUp" style={{animationDelay: '200ms'}}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><FileClock className="h-5 w-5"/>Historique des sauvegardes</h2>
                 <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      placeholder="Rechercher par date..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-10 rounded-lg border border-gray-200 bg-white pl-9 pr-4 text-sm"
                    />
                  </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-gray-500 bg-gray-50/70">
                  <tr className="[&>th]:py-3 [&>th]:px-4 [&>th]:font-semibold text-left">
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Taille du fichier</th>
                    <th>Créé par</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                 <tbody className="divide-y divide-gray-200">
                    {paginatedBackups.map((backup) => (
                      <tr key={backup.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{backup.date}</td>
                        <td className="py-3 px-4 text-gray-600">{backup.time}</td>
                        <td className="py-3 px-4 text-gray-600">{backup.size}</td>
                        <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${ backup.createdBy === 'Manuel' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600' }`}>{backup.createdBy}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-md bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium text-xs">
                              <DownloadCloud className="h-3 w-3" />
                              <span>Télécharger</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {paginatedBackups.length === 0 && ( <tr><td colSpan={5} className="py-8 text-center text-gray-500">Aucune sauvegarde trouvée.</td></tr> )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-9 w-9 flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                > <ChevronLeft className="h-4 w-4" /> </button>
                <span className="text-sm font-medium text-gray-600">Page {currentPage} sur {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-9 w-9 flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                > <ChevronRight className="h-4 w-4" /> </button>
            </div>
        </div>
      </div>
      
      <SuccessToast
        show={toast.show}
        message={toast.message}
        onClose={() => setToast({ show: false, message: "" })}
      />
      
      <PasswordConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={executeDelete}
        title="Action Irréversible"
        description="Cette action supprimera définitivement les anciennes sauvegardes."
        isLoading={isDeleting}
      />
    </>
  );
}