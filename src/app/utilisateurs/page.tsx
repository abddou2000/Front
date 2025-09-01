// src/app/utilisateurs(api)/page.tsx
"use client";
import { ResetPasswordModal } from "../components/ResetPasswordModal";
import React, { useState, useMemo, useEffect } from "react";
import {
  Search, UserPlus, Edit3, Trash2, KeyRound, ChevronRight, ChevronLeft,
} from "lucide-react";
import "animate.css";

import { useAuth } from "@/context/AuthContext";

import { EditUserModal } from "../components/EditUserModal";
import { AddUserModal } from "../components/AddUserModal";
import { SuccessToast } from "../components/SuccessToast";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";

// --- TYPES ET DONNÉES ---
// ✅ Rôles en MAJUSCULES pour cohérence front/back
type Role = "EMPLOYE" | "ADMIN" | "RH" | "CONFIGURATEUR";
type User = {
  id: number;
  name: string;
  email: string;
  role: { id: number; type: Role }; // rôle objet
  active: boolean;
};

const ROLES: Role[] = ["ADMIN", "EMPLOYE", "RH", "CONFIGURATEUR"];
const ITEMS_PER_PAGE = 5;

// Endpoint à partir du rôle (basé sur la chaîne Role)
const roleToEndpoint = (role: Role) =>
  role
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase() + "s"; // admin -> admins, employe -> employes, configurateur -> configurateurs, rh -> rhs

// --- COMPOSANT PRINCIPAL: UsersPage ---
export default function UsersPage() {
  const { token } = useAuth();

  // --- ÉTATS ---
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "Tous">("Tous");
  const [statusFilter, setStatusFilter] = useState<"Tous" | "Actif" | "Inactif">("Tous");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ show: false, message: "" });

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // --- CHARGEMENT SÉCURISÉ DES UTILISATEURS ---
  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) {
        setIsLoading(false);
        setToast({ show: true, message: "Vous n'êtes pas authentifié." });
        return;
      }
      try {
        const res = await fetch("http://localhost:8080/api/utilisateurs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();

        const mapped: User[] = (Array.isArray(data) ? data : []).map((u: any) => ({
          id: Number(u.id ?? u.userId ?? Date.now()),
          name:
            (u.prenom && u.nom && `${u.prenom} ${u.nom}`) ||
            u.name ||
            u.username ||
            "—",
          email: u.email || "—",
          role: {
            id: Number(u.role?.id ?? u.roleId ?? 0),
            // rôle robuste : accepte .type, .name, ou string, puis upper
            type: ((u.role?.type || u.role?.name || u.role) ?? "EMPLOYE")
              .toString()
              .toUpperCase() as Role,
          },
          active: Boolean(
            u.active ?? u.enabled ?? u.etatCompte ?? u.accountNonLocked ?? true
          ),
        }));
        setUsers(mapped);
      } catch (err: any) {
        setToast({ show: true, message: `Erreur de chargement: ${err.message}` });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  // --- UTIL: Badge rôle (label FR + classes) ---
  const getRoleBadge = (roleObj: { id: number; type: Role }) => {
    const role = roleObj.type;
    const roleConfig: Record<
      Role,
      { label: string; classes: string }
    > = {
      ADMIN: { label: "Admin", classes: "bg-purple-100 text-purple-700" },
      EMPLOYE: { label: "Employé", classes: "bg-orange-100 text-orange-700" },
      RH: { label: "RH", classes: "bg-blue-100 text-blue-700" },
      CONFIGURATEUR: { label: "Configurateur", classes: "bg-gray-200 text-gray-700" },
    };
    return roleConfig[role] || { label: "Inconnu", classes: "bg-gray-100 text-gray-700" };
  };

  // --- LOGIQUE DE FILTRE ET DE PAGINATION ---
  const filteredUsers = useMemo(() => {
    return users
      .filter(
        (user) =>
          (user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.email || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter((user) => roleFilter === "Tous" || user.role.type === roleFilter)
      .filter((user) => {
        if (statusFilter === "Tous") return true;
        return statusFilter === "Actif" ? user.active : !user.active;
      });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const totalPagesRaw = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const totalPages = Math.max(1, totalPagesRaw);
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedUsers = filteredUsers.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  // --- FONCTIONS DE GESTION ---
  const handleAddUser = async (formData: any) => {
    if (!token) {
      setToast({ show: true, message: "Vous n'êtes pas authentifié." });
      return;
    }

    setIsSubmitting(true);
    try {
      // Étape 1 : créer l'utilisateur de base
      const userResponse = await fetch(
        `http://localhost:8080/api/utilisateurs?roleType=${encodeURIComponent(formData.role)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
            email: formData.email,
            nom: formData.nom,
            prenom: formData.prenom,
          }),
        }
      );

      if (!userResponse.ok) throw new Error(await userResponse.text());
      const newUser = await userResponse.json();
      const newUserId = newUser.id;

      // Étape 2 : créer le profil détaillé
      const profileEndpoint = roleToEndpoint(formData.role as Role); // admin->admins, employe->employes, rh->rhs, configurateur->configurateurs
      const profileResponse = await fetch(
        `http://localhost:8080/api/${profileEndpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: newUserId }),
        }
      );

      if (!profileResponse.ok) throw new Error(await profileResponse.text());

      // Succès UI
      setToast({ show: true, message: "Utilisateur ajouté avec succès." });

      // Injection locale
      const displayed: User = {
        id: Number(newUser.id),
        name:
          (newUser.prenom && newUser.nom && `${newUser.prenom} ${newUser.nom}`) ||
          newUser.name ||
          newUser.username ||
          `${formData.prenom} ${formData.nom}`,
        email: newUser.email || formData.email,
        role: {
          id: Number(newUser.role?.id ?? 0),
          type: (
            (newUser.role?.type || newUser.role?.name || formData.role) as string
          )
            .toString()
            .toUpperCase() as Role,
        },
        active: Boolean(
          newUser.active ?? newUser.enabled ?? newUser.etatCompte ?? true
        ),
      };

      setUsers((prev) => [displayed, ...prev]);
      setIsModalOpen(false);
      setCurrentPage(1);
    } catch (err: any) {
      setToast({ show: true, message: `Erreur: ${err.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsConfirmModalOpen(true);
  };

  const executeDelete = () => {
    if (userToDelete) {
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setIsConfirmModalOpen(false);
      setUserToDelete(null);
      setToast({ show: true, message: "Utilisateur supprimé avec succès." });
      setCurrentPage(1);
    }
  };

  const handleResetPasswordClick = (user: User) => {
    setUserToReset(user);
    setIsResetModalOpen(true);
  };

  const executeResetPassword = (password: string) => {
    if (userToReset) {
      console.log(`Le mot de passe de ${userToReset.name} a été réinitialisé à : ${password}`);
      setIsResetModalOpen(false);
      setUserToReset(null);
      setToast({ show: true, message: "Mot de passe réinitialisé avec succès." });
    }
  };

  // ⚠️ EditUserModal te renvoie (userId, formData). On met à jour seulement role.type.
  const executeEditUser = (
    userId: number,
    formData: { name: string; email: string; role: Role; active: boolean }
  ) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              name: formData.name,
              email: formData.email,
              role: { ...user.role, type: formData.role },
              active: formData.active,
            }
          : user
      )
    );
    setToast({ show: true, message: "Utilisateur modifié avec succès." });
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-6">
        {/* --- En-tête --- */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Gestion des utilisateurs</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 font-semibold shadow transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Ajouter utilisateur</span>
          </button>
        </div>

        {/* --- Filtres --- */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              placeholder="Rechercher par nom, email..."
              className="w-full h-11 rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <select
            className="h-11 w-44 rounded-lg bg-white border border-gray-200 px-3 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as Role | "Tous");
              setCurrentPage(1);
            }}
          >
            <option value="Tous">Tous les rôles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            className="h-11 w-44 rounded-lg bg-white border border-gray-200 px-3 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
          >
            <option value="Tous">Tous les statuts</option>
            <option value="Actif">Compte actif</option>
            <option value="Inactif">Compte inactif</option>
          </select>
        </div>

        {/* --- Tableau --- */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-sm text-gray-600">
            Chargement des utilisateurs…
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-500 bg-gray-50/70">
                <tr className="[&>th]:py-3.5 [&>th]:px-4 [&>th]:font-semibold text-left">
                  <th>Nom complet</th>
                  <th>Email professionnel</th>
                  <th>Rôle attribué</th>
                  <th>État du compte</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedUsers.map((user) => {
                  const badge = getRoleBadge(user.role);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-800">{user.name}</td>
                      <td className="py-3 px-4 text-gray-600">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ${badge.classes}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div
                          className={`relative h-6 w-11 rounded-full transition-colors ${
                            user.active ? "bg-blue-600" : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                              user.active ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-start gap-1 text-gray-500">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setIsEditModalOpen(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-md hover:text-blue-600"
                            title="Modifier"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => {
                              setUserToReset(user);
                              setIsResetModalOpen(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-md hover:text-blue-600"
                            title="Réinitialiser mot de passe"
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => {
                              setUserToDelete(user);
                              setIsConfirmModalOpen(true);
                            }}
                            className="p-2 hover:bg-red-50 rounded-md hover:text-red-600"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Aucun utilisateur à afficher.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* --- Pagination --- */}
        {!isLoading && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="h-10"></div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="h-9 w-9 flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-9 w-9 rounded-md border text-sm font-medium transition-colors ${
                    page === safeCurrentPage
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300 bg-white hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                className="h-9 w-9 flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddUser={handleAddUser}
        isLoading={isSubmitting}
      />

      <ConfirmDeleteModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={executeDelete}
        userName={userToDelete ? userToDelete.name : null}
      />

      <ResetPasswordModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={executeResetPassword}
        userName={userToReset ? userToReset.name : null}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        // ⚠️ signature (userId, formData) — correspondant à EditUserModal mis à jour
        onSubmit={(
          userId,
          formData: { name: string; email: string; role: Role; active: boolean }
        ) => executeEditUser(userId, formData)}
        userToEdit={editingUser}
      />

      <SuccessToast
        show={toast.show}
        message={toast.message}
        onClose={() => setToast({ show: false, message: "" })}
      />
    </>
  );
}
