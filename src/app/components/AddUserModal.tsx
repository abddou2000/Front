// src/app/components/AddUserModal.tsx
"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import "animate.css";

// ✅ Rôles en MAJUSCULES (aligné avec le back)
type Role = "EMPLOYE" | "ADMIN" | "RH" | "CONFIGURATEUR";
const ROLES: Role[] = ["ADMIN", "EMPLOYE", "RH", "CONFIGURATEUR"];

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (formData: any) => void;
  isLoading?: boolean;
}

export function AddUserModal({
  isOpen,
  onClose,
  onAddUser,
  isLoading = false,
}: AddUserModalProps) {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("EMPLOYE");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const resetForm = () => {
    setNom("");
    setPrenom("");
    setUsername("");
    setEmail("");
    setRole("EMPLOYE");
    setPassword("");
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim() || !username.trim() || !email.trim() || !password.trim() || !role) {
      setError("Tous les champs sont requis.");
      return;
    }
    onAddUser({ nom, prenom, username, email, password, role });
    resetForm();
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
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Ajouter un nouvel utilisateur
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* Prénom + Nom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <input
                  id="prenom"
                  type="text"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Jean"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  id="nom"
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Dupont"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email professionnel
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: jean.dupont@email.com"
                disabled={isLoading}
              />
            </div>

            {/* Username + Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom d'utilisateur
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: j.dupont"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe provisoire
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Rôle */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Rôle attribué
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

          <div className="flex items-center justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-2 disabled:opacity-70"
              disabled={isLoading}
            >
              {isLoading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                  <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              )}
              Ajouter l’utilisateur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
