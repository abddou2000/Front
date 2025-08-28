// Dans : src/app/components/AddUserModal.tsx

import React, { useState } from 'react';
import { X } from 'lucide-react';
import 'animate.css';

type Role = "Employé" | "Admin" | "RH" | "Paramètre";
const ROLES: Role[] = ["Admin", "Employé", "RH", "Paramètre"];

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  // NOUVEAU : onAddUser attend maintenant aussi le mot de passe
  onAddUser: (newUser: { name: string; email: string; role: Role; password: string }) => void;
}

export function AddUserModal({ isOpen, onClose, onAddUser }: AddUserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('Employé');
  // NOUVEAU : Ajout de l'état pour le mot de passe
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // NOUVEAU : On vérifie aussi le champ mot de passe
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Tous les champs sont requis.');
      return;
    }
    // NOUVEAU : On inclut le mot de passe dans les données envoyées
    onAddUser({ name, email, role, password });
    
    // Réinitialiser le formulaire
    setName('');
    setEmail('');
    setRole('Employé');
    setPassword(''); // NOUVEAU : On vide aussi le champ mot de passe
    setError('');
  };
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate__animated animate__fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative bg-white w-full max-w-md p-8 rounded-xl shadow-2xl animate__animated animate__zoomIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Ajouter un nouvel utilisateur</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* Champ Nom complet (inchangé) */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">Nom complet</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Jean Dupont" />
            </div>
            
            {/* Champ Email (inchangé) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">Email professionnel</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: jean.dupont@email.com" />
            </div>
            
            {/* NOUVEAU : Champ Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">Mot de passe provisoire</label>
              <input 
                id="password"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            {/* Champ Rôle (inchangé) */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-600 mb-1">Rôle attribué</label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value as Role)} className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

          <div className="flex items-center justify-end gap-3 mt-8">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700">Annuler</button>
            <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white">Ajouter l'utilisateur</button>
          </div>
        </form>
      </div>
    </div>
  );
}