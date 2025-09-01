// Dans : src/app/components/PasswordConfirmModal.tsx

import React, { useState, useEffect } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import 'animate.css';

interface PasswordConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void; // Envoie le mot de passe pour vérification
  title: string;
  description: string;
  isLoading: boolean;
}

export function PasswordConfirmModal({ isOpen, onClose, onConfirm, title, description, isLoading }: PasswordConfirmModalProps) {
  const [password, setPassword] = useState('');

  // Vider le mot de passe à chaque ouverture
  useEffect(() => {
    if (isOpen) {
      setPassword('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm(password);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate__animated animate__fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative bg-white w-full max-w-sm p-8 rounded-xl shadow-2xl text-center animate__animated animate__zoomIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <ShieldAlert className="h-12 w-12 text-red-500" />
        </div>

        <h2 className="mt-6 text-xl font-bold text-gray-800">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">
          {description}
        </p>
        
        {/* Champ mot de passe */}
        <div className="mt-6 text-left">
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-600 mb-1">
            Veuillez entrer votre mot de passe pour confirmer
          </label>
          <input 
            id="confirm-password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="••••••••"
          />
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isLoading}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 disabled:opacity-50"
          >
            Annuler
          </button>
          <button 
            type="button" 
            onClick={handleConfirm} 
            disabled={isLoading || password.length === 0}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "Vérification..." : "Confirmer et Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}