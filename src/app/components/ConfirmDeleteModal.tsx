

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import 'animate.css';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string | null; // Pour afficher le nom de l'utilisateur
}

export function ConfirmDeleteModal({ isOpen, onClose, onConfirm, userName }: ConfirmDeleteModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    // Fond sombre
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate__animated animate__fadeIn"
      onClick={onClose}
    >
      {/* La boîte de dialogue */}
      <div 
        className="relative bg-white w-full max-w-sm p-8 rounded-xl shadow-2xl text-center animate__animated animate__zoomIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icône d'avertissement */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>

        {/* Titre et Message */}
        <h2 className="mt-6 text-xl font-bold text-gray-800">Confirmation de suppression</h2>
        <p className="mt-2 text-sm text-gray-600">
          Voulez-vous vraiment supprimer l'utilisateur <br /> <strong className="text-gray-900">{userName}</strong> ?
          <br /><br />
          Cette action est irréversible.
        </p>
        
        {/* Boutons d'action */}
        <div className="mt-8 flex justify-center gap-4">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800"
          >
            Annuler
          </button>
          <button 
            type="button" 
            onClick={onConfirm} 
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}