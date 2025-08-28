"use client";
import { ResetPasswordModal } from '../components/ResetPasswordModal';
import React, { useState, useMemo } from "react";
import {
  Search, ChevronDown, UserPlus, Edit3, Trash2, KeyRound, ChevronRight, ChevronLeft,
  LayoutDashboard, Users, ShieldCheck, Settings, X, MoreHorizontal,
} from "lucide-react";
import 'animate.css';
import { EditUserModal } from '../components/EditUserModal';
import { AddUserModal } from '../components/AddUserModal';
import { SuccessToast } from '../components/SuccessToast';
// NOUVEAU : On importe la modale de confirmation
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';


// --- TYPES ET DONNÉES ---
type Role = "Employé" | "Admin" | "RH" | "Paramètre";
type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
};

const initialUsers: User[] = [
  { id: 1, name: "Damien Leroy", email: "damien@ercy.comez", role: "Employé", active: true },
  { id: 2, name: "Alice Durand", email: "alice.durand@email.com", role: "Admin", active: false },
  { id: 3, name: "Marc Dupuis", email: "marc.dupuis@connex.com", role: "Employé", active: true },
  { id: 4, name: "Emma Perrin", email: "emma.perrin@email.com", role: "RH", active: false },
  { id: 5, name: "Lucas Martin", email: "lucas.martin@comex.com", role: "Paramètre", active: false },
  { id: 6, name: "Chloé Dubois", email: "chloe.dubois@email.com", role: "Employé", active: true },
  { id: 7, name: "Paul Bernard", email: "paul.bernard@connex.com", role: "Admin", active: true },
  { id: 8, name: "Sophie Robert", email: "sophie.robert@comex.com", role: "RH", active: true },
];

const ROLES: Role[] = ["Admin", "Employé", "RH", "Paramètre"];
const ITEMS_PER_PAGE = 5;


// --- COMPOSANT: BARRE LATÉRALE (Sidebar) ---
function Sidebar() {
  const navItems = [
    { icon: LayoutDashboard, label: "Tableau de bord" },
    { icon: Users, label: "Utilisateurs", active: true },
    { icon: ShieldCheck, label: "Rôles & permissions" },
    { icon: Settings, label: "Paramètres" },
  ];
  return (
    <aside className="w-64 flex-shrink-0 bg-[#0B1524] p-6 hidden md:flex flex-col">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-white"></div>
        </div>
        <span className="font-semibold text-lg text-white">Innovex Consulting</span>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              item.active ? "bg-[#2A3F5F] text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}


// --- COMPOSANT PRINCIPAL: UsersPage ---
export default function UsersPage() {
  // --- ÉTATS (States) ---
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "Tous">("Tous");
  const [statusFilter, setStatusFilter] = useState<"Tous" | "Actif" | "Inactif">("Tous");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // NOUVEAU : États pour gérer la pop-up de suppression
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  // NOUVEAU : États pour la modale de réinitialisation de mdp
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<User | null>(null);

  // ÉTAPE 1 — NOUVEAU : États pour la modale d’édition
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // --- LOGIQUE DE FILTRE ET DE PAGINATION ---
  const filteredUsers = useMemo(() => {
    return users
      .filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter(user => roleFilter === "Tous" || user.role === roleFilter)
      .filter(user => {
        if (statusFilter === "Tous") return true;
        return statusFilter === "Actif" ? user.active : !user.active;
      });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Sécurisation pagination si aucun résultat
  const totalPagesRaw = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const totalPages = Math.max(1, totalPagesRaw);
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedUsers = filteredUsers.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  // --- FONCTIONS DE GESTION ---
  const handleAddUser = (newUser: { name: string; email: string; role: Role; password: string }) => {
    const userToDisplay: User = {
      id: Date.now(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      active: true,
    };
    setUsers([userToDisplay, ...users]);
    setIsModalOpen(false);
    setToast({ show: true, message: "L'utilisateur a été ajouté avec succès." });
    setCurrentPage(1);
  };

  // MODIFIÉ : On remplace l'ancienne logique de handleDeleteUser par ce nouveau système
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsConfirmModalOpen(true);
  };

  const executeDelete = () => {
    if (userToDelete) {
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setIsConfirmModalOpen(false);
      setUserToDelete(null);
      setToast({ show: true, message: "Utilisateur supprimé avec succès." });
      // Optionnel: revenir page 1 si la page devient vide
      setCurrentPage(1);
    }
  };

  // MODIFIÉ : On divise la logique de réinitialisation en deux
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

  // ⛏️ ÉTAPE 1 — SUPPRIMÉ : toggleUserStatus (le statut est désormais indicatif uniquement)

  const getRoleBadgeClass = (role: Role) => {
    const roleClasses: Record<Role, string> = {
      "Admin": "bg-purple-100 text-purple-700",
      "Employé": "bg-orange-100 text-orange-700",
      "RH": "bg-blue-100 text-blue-700",
      "Paramètre": "bg-gray-200 text-gray-700",
    };
    return roleClasses[role] || "bg-slate-100 text-slate-700";
  };

  // ÉTAPE 2 — NOUVEAU : Fonctions d’édition
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const executeEditUser = (formData: { name: string; email: string; role: Role; active: boolean; }) => {
    if (editingUser) {
      setUsers(users.map(u =>
        u.id === editingUser.id
          ? { ...u, name: formData.name, email: formData.email, role: formData.role, active: formData.active }
          : u
      ));
      setToast({ show: true, message: "Utilisateur modifié avec succès." });
    }
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            {/* ... En-tête de la page ... */}
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

            {/* --- FILTRES INTERACTIFS --- */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  placeholder="Rechercher par nom, email..."
                  className="w-full h-11 rounded-lg border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <select
                className="h-11 w-44 rounded-lg bg-white border border-gray-200 px-3 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value as Role | "Tous"); setCurrentPage(1); }}
              >
                <option value="Tous">Tous les rôles</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <select
                className="h-11 w-44 rounded-lg bg-white border border-gray-200 px-3 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
              >
                <option value="Tous">Tous les statuts</option>
                <option value="Actif">Compte actif</option>
                <option value="Inactif">Compte inactif</option>
              </select>
            </div>

            {/* --- TABLEAU DES UTILISATEURS --- */}
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
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-800">{user.name}</td>
                      <td className="py-3 px-4 text-gray-600">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ${getRoleBadgeClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {/* Ce conteneur n'est plus cliquable. C'est juste un indicateur visuel. */}
                        <div
                          className={`relative h-6 w-11 rounded-full transition-colors ${
                            user.active ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                              user.active ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-start gap-1 text-gray-500">
                          {/* ÉTAPE 3 — NOUVEAU onClick */}
                          <button
                            onClick={() => handleEditClick(user)}
                            className="p-2 hover:bg-gray-100 rounded-md hover:text-blue-600"
                            title="Modifier"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleResetPasswordClick(user)}
                            className="p-2 hover:bg-gray-100 rounded-md hover:text-blue-600"
                            title="Réinitialiser mot de passe"
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>

                          {/* MODIFIÉ : Le bouton appelle maintenant handleDeleteClick */}
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="p-2 hover:bg-red-50 rounded-md hover:text-red-600"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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

            {/* --- PAGINATION --- */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="h-10"></div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="h-9 w-9 flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-9 w-9 rounded-md border text-sm font-medium transition-colors ${
                      page === safeCurrentPage ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="h-9 w-9 flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>

      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddUser={handleAddUser}
      />

      {/* NOUVEAU : On ajoute la modale de confirmation ici */}
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

      {/* ÉTAPE 4 — NOUVELLE MODALE D’ÉDITION */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={executeEditUser}
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
