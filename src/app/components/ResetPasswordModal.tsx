// Dans : src/app/components/ResetPasswordModal.tsx

import React, { useState, useEffect } from 'react';
import { X, KeyRound } from 'lucide-react';
import 'animate.css';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  userName: string | null;
}

export function ResetPasswordModal({ isOpen, onClose, onConfirm, userName }: ResetPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Efface les champs quand la modale s'ouvre
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setConfirmPassword('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    // Validation
    if (!password || !confirmPassword) {
      setError('Les deux champs sont requis.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    
    // Si tout est bon, on envoie le nouveau mot de passe
    onConfirm(password);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate__animated animate__fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative bg-white w-full max-w-sm p-8 rounded-xl shadow-2xl animate__animated animate__zoomIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icône de clé (thème bleu) */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
          <KeyRound className="h-12 w-12 text-blue-500" />
        </div>

        <h2 className="mt-6 text-xl font-bold text-gray-800">Réinitialiser le mot de passe</h2>
        <p className="mt-2 text-sm text-gray-600">
          Pour l'utilisateur <strong className="text-gray-900">{userName}</strong>
        </p>

        {/* Formulaire */}
        <div className="mt-6 space-y-4 text-left">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-600 mb-1">
              Nouveau mot de passe
            </label>
            <input 
              id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-600 mb-1">
              Confirmer le mot de passe
            </label>
            <input 
              id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        
        {/* Boutons d'action */}
        <div className="mt-8 flex justify-center gap-4">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800">
            Annuler
          </button>
          <button type="button" onClick={handleSubmit} className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white">
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  );
}