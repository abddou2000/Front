// src/app/components/EditUserModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { X, Edit3 } from "lucide-react";
import "animate.css";

// ⚠️ Assure-toi d'avoir un fichier "@/types" qui exporte `User` et `Role`
// Définitions locales des types pour cette modale
type Role = "Employé" | "Admin" | "RH" | "Paramètre"; // Ou "Configurateur"
type User = {
  id: number;
  name: string;
  email: string;
  role: { id: number; type: Role }; 
  active: boolean;
};


const ROLES: Role[] = ["Admin", "Employé", "RH", "Paramètre"];

// On réutilise le type User partagé
type EditableUser = User | null;

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    userId: number,
    formData: { name: string; email: string; role: Role; active: boolean }
  ) => void;
  userToEdit: EditableUser;
}

export function EditUserModal({
  isOpen,
  onClose,
  onSubmit,
  userToEdit,
}: EditUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("Employé");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");

  // Pré-remplit le formulaire à chaque fois que l'utilisateur à modifier change
  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name);
      setEmail(userToEdit.email);
      setRole(userToEdit.role.type); // <-- on lit .type
      setIsActive(userToEdit.active);
    }
  }, [userToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Le nom et l'email sont requis.");
      return;
    }
    if (userToEdit) {
      onSubmit(userToEdit.id, { name, email, role, active: isActive });
    }
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
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
          aria-label="Fermer"
        >
          <X size={22} />
        </button>

        {/* Icône de crayon (thème bleu) */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
          <Edit3 className="h-12 w-12 text-blue-500" />
        </div>

        <h2 className="mt-6 text-xl font-bold text-gray-800">
          Modifier l'utilisateur
        </h2>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="edit-name"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Nom complet
              </label>
              <input
                id="edit-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="edit-email"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Email professionnel
              </label>
              <input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="edit-role"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Rôle attribué
              </label>
              <select
                id="edit-role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* ========================================================== */}
            {/* TOGGLE ÉTAT DU COMPTE                                     */}
            {/* ========================================================== */}
            <div className="pt-2">
              <label className="flex items-center justify-between cursor-pointer select-none">
                <span className="font-medium text-gray-700">État du compte</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                    id="edit-status"
                  />
                  <div className="h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 transition-colors"></div>
                  <div className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5"></div>
                </div>
              </label>
            </div>
            {/* ========================================================== */}
            {/* FIN TOGGLE                                                 */}
            {/* ========================================================== */}
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
          )}

          <div className="mt-8 flex justify-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
