"use client";

import React, { useState, useMemo } from "react";
import {
  Search, ChevronDown, UserPlus, Edit3, Trash2, KeyRound, ChevronRight, ChevronLeft,
  LayoutDashboard, Users, ShieldCheck, Settings, X, MoreHorizontal,
} from "lucide-react";
import 'animate.css';


// --- TYPES ET DONNÉES ---
type Role = "Employé" | "Admin" | "RH" | "Paramètre";
type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
};

// On ajoute plus de données pour tester la pagination
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
// (Aucun changement ici, reste le même)
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
          <a key={item.label} href="#" className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${item.active ? "bg-[#2A3F5F] text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
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
  const [notification, setNotification] = useState({ show: false, message: "" });
  
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

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  // --- FONCTIONS DE GESTION ---
  const showTempNotification = (message: string) => {
    setNotification({ show: true, message });
    setTimeout(() => setNotification({ show: false, message: "" }), 3000);
  };

  const handleDeleteUser = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      setUsers(users.filter(u => u.id !== id));
      showTempNotification("Utilisateur supprimé avec succès.");
    }
  };

  const handleResetPassword = () => {
      showTempNotification("Mot de passe réinitialisé avec succès.");
  };

  const toggleUserStatus = (id: number) => {
    setUsers(users.map(user => user.id === id ? { ...user, active: !user.active } : user));
  };
  
  const getRoleBadgeClass = (role: Role) => {
    const roleClasses: Record<Role, string> = {
      "Admin": "bg-purple-100 text-purple-700",
      "Employé": "bg-orange-100 text-orange-700",
      "RH": "bg-blue-100 text-blue-700",
      "Paramètre": "bg-gray-200 text-gray-700",
    };
    return roleClasses[role] || "bg-slate-100 text-slate-700";
  };


  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* ... En-tête de la page ... */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Gestion des utilisateurs</h1>
            <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 font-semibold shadow transition-colors">
              <UserPlus className="h-4 w-4" />
              <span>Ajouter utilisateur</span>
              <ChevronRight className="h-4 w-4" />
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
            {/* Filtre par Rôle */}
            <select
                className="h-11 w-44 rounded-lg bg-white border border-gray-200 px-3 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value as Role | "Tous"); setCurrentPage(1); }}
            >
                <option value="Tous">Tous les rôles</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {/* Filtre par Statut */}
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
                       <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={user.active} onChange={() => toggleUserStatus(user.id)} className="peer sr-only"/>
                          <div className="h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-full" />
                        </label>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-start gap-1 text-gray-500">
                        <button className="p-2 hover:bg-gray-100 rounded-md hover:text-blue-600" title="Modifier"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={handleResetPassword} className="p-2 hover:bg-gray-100 rounded-md hover:text-blue-600" title="Réinitialiser mot de passe"><KeyRound className="h-4 w-4" /></button>
                        <button onClick={() => handleDeleteUser(user.id)} className="p-2 hover:bg-red-50 rounded-md hover:text-red-600" title="Supprimer"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- NOTIFICATION ET PAGINATION --- */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
             {/* Notification */}
            <div className="h-10"> {/* Conteneur pour éviter le décalage de la mise en page */}
                {notification.show && (
                     <div className="animate__animated animate__fadeInUp bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-2.5 rounded-lg inline-flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        <span>{notification.message}</span>
                     </div>
                )}
            </div>
            
            {/* Pagination */}
            <div className="flex items-center gap-2 ml-auto">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-9 w-9 flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)} className={`h-9 w-9 rounded-md border text-sm font-medium transition-colors ${page === currentPage ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
                        {page}
                    </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-9 w-9 flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}