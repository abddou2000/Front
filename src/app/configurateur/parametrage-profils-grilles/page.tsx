"use client";
import React, { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Settings,
  Building2,
  FileSignature,
  BadgeEuro,
  CalendarClock,
  BadgePlus,
  BadgePercent,
  TimerReset,
  ClipboardList,
  Layers3,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
} from "lucide-react";
import "animate.css";
import { SuccessToast } from "../../components/SuccessToast";
import { ConfirmDeleteModal } from "../../components/ConfirmDeleteModal";
// Sidebar handled by layout.tsx

function addOneDay(dateString: string): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function toISO(d?: string) {
  if (!d) return "";
  const t = new Date(d);
  if (Number.isNaN(t.getTime())) return "";
  const yyyy = t.getFullYear();
  const mm = String(t.getMonth() + 1).padStart(2, "0");
  const dd = String(t.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function isBetweenExclusive(target: string, start: string, end: string) {
  const t = new Date(target).getTime();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return t >= s && t < e; // ≥ start && < end
}

// Sidebar handled by layout.tsx
export default function Page() {
  type Profil = {
    id: number;
    code: string;
    nom: string;
    categorie: string;
    fonction: string;
    salaireBase: number;
    primes: string[];
    startDate: string;
    endDate: string;
  };
  type Grille = {
    id: number;
    profil: string;
    niveau: string;
    echelon: string;
    ancienneteMin: number;
    salaireMin: number;
    startDate: string;
    endDate: string;
  };

  const [activeTab, setActiveTab] = useState<"profils" | "grilles">("profils");
  const [profils, setProfils] = useState<Profil[]>([
    {
      id: 1,
      code: "CAD-COM",
      nom: "Cadre commercial",
      categorie: "Cadre",
      fonction: "Responsable commercial",
      salaireBase: 12000,
      primes: ["Prime de transport"],
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    },
  ]);
  const [grilles, setGrilles] = useState<Grille[]>([
    {
      id: 1,
      profil: "Cadre commercial",
      niveau: "N2",
      echelon: "E1",
      ancienneteMin: 2,
      salaireMin: 14000,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<any>({ primes: [] });
  const [toast, setToast] = useState({ show: false, message: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ id: number } | null>(null);

  // délimitation
  const [isDelimOpen, setIsDelimOpen] = useState(false);
  const [delimTarget, setDelimTarget] = useState<any>(null);
  const [delimEndDate, setDelimEndDate] = useState<string>("");
  const [delimError, setDelimError] = useState<string>("");

  const openCreate = () => {
    setEditingId(null);
    setFormValues(activeTab === "profils" ? { primes: [] } : {});
    setIsModalOpen(true);
  };
  const openEdit = (row: any) => {
    setEditingId(row.id);
    setFormValues(JSON.parse(JSON.stringify(row)));
    setIsModalOpen(true);
  };
  const handleDelete = (id: number) => {
    setToDelete({ id });
    setConfirmOpen(true);
  };
  const executeDelete = () => {
    if (!toDelete) return;
    const id = toDelete.id;
    if (activeTab === "profils") setProfils((prev) => prev.filter((r) => r.id !== id));
    else setGrilles((prev) => prev.filter((r) => r.id !== id));
    setConfirmOpen(false);
    setToDelete(null);
    setToast({ show: true, message: "Suppression effectuée." });
  };

  // délimitation
  const openDelimModal = (row: any) => {
    setDelimTarget(row);
    setDelimEndDate("");
    setDelimError("");
    setIsDelimOpen(true);
  };

  const validateDelimDate = (newEnd: string, row: any): string | null => {
    if (!newEnd) return "Veuillez choisir une date de fin.";
    const s = toISO(row.startDate);
    const e = toISO(row.endDate);
    if (!isBetweenExclusive(newEnd, s, e)) {
      return `La date doit être ≥ ${s} et strictement < ${e}.`;
    }
    return null;
  };

  const confirmDelimitation = () => {
    if (!delimTarget) return;
    const newEnd = toISO(delimEndDate);
    const err = validateDelimDate(newEnd, delimTarget);
    if (err) {
      setDelimError(err);
      setToast({ show: true, message: "Délimitation refusée : " + err });
      return;
    }

    const originalEndDate = delimTarget.endDate;
    const delimitationData = {
      targetId: delimTarget.id,
      newEndDate: newEnd,
      originalEndDate,
      activeTab,
    };

    // fermer modal + préparer nouvelle version (coupure appliquée au save)
    setIsDelimOpen(false);
    setDelimTarget(null);
    setDelimEndDate("");
    setDelimError("");

    const newStartDate = addOneDay(newEnd);
    const newVersion = {
      ...delimTarget,
      id: Date.now(),
      startDate: newStartDate,
      endDate: originalEndDate,
      _isDelimitation: true,
      _delimitationData: delimitationData,
    };

    setEditingId(newVersion.id);
    setFormValues(newVersion);
    setIsModalOpen(true);
    setToast({ show: true, message: "Délimitation effectuée. Modifiez la nouvelle version." });
  };

  const saveForm = () => {
    const saveStandard = () => {
      if (activeTab === "profils") {
        if (editingId == null) setProfils((prev) => [{ id: Date.now(), ...formValues }, ...prev]);
        else setProfils((prev) => prev.map((r) => (r.id === editingId ? { ...r, ...formValues } : r)));
      } else {
        if (editingId == null) setGrilles((prev) => [{ id: Date.now(), ...formValues }, ...prev]);
        else setGrilles((prev) => prev.map((r) => (r.id === editingId ? { ...r, ...formValues } : r)));
      }
    };

    const saveDelimitation = () => {
      const data = formValues._delimitationData;
      if (!data) return saveStandard();

      const { targetId, newEndDate, originalEndDate, activeTab: tab } = data;

      const apply = (setter: React.Dispatch<React.SetStateAction<any[]>>) => {
        setter((prev) => {
          // a) couper l’ancienne période
          const updated = prev.map((r) => (r.id === targetId ? { ...r, endDate: newEndDate } : r));
          const base = prev.find((r) => r.id === targetId) || {};
          // b) nouvelle entrée = contenu du formulaire
          const next = {
            ...(base as any),
            ...formValues,
            id: Date.now(),
            startDate: addOneDay(newEndDate),
            endDate: originalEndDate,
          } as any;
          delete (next as any)._isDelimitation;
          delete (next as any)._delimitationData;
          return [next, ...updated];
        });
      };

      if (tab === "profils") apply(setProfils);
      else apply(setGrilles);
    };

    if (formValues._isDelimitation) saveDelimitation();
    else saveStandard();

    setIsModalOpen(false);
    setFormValues(activeTab === "profils" ? { primes: [] } : {});
    setEditingId(null);
    setToast({ show: true, message: "Enregistrement effectué." });
  };

  const current = useMemo(() => {
    return activeTab === "profils"
      ? { title: "Liste des profils", data: profils }
      : { title: "Liste des grilles salariales", data: grilles };
  }, [activeTab, profils, grilles]);

  const dateCell = (value: string) => (
    <span className="inline-flex items-center rounded-md px-2 py-1 text-[11px] md:text-xs font-medium bg-slate-100 text-slate-700">
      {value || "—"}
    </span>
  );

  return (
    <>
      <div className="pt-3 sm:pt-0 p-4 sm:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Titre + profil (avec espace anti-hamburger) */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div aria-hidden className="w-10 h-10 shrink-0 sm:hidden" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Paramétrage des profils & grilles salariales
              </h1>
            </div>
          </div>

          {/* Onglets */}
          <div className="mb-4 sm:mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("profils")}
              className={`px-3 sm:px-4 py-2 text-sm font-semibold rounded-md border transition-colors ${
                activeTab === "profils" ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ClipboardList className="h-4 w-4 inline mr-2" /> Profils
            </button>
            <button
              onClick={() => setActiveTab("grilles")}
              className={`px-3 sm:px-4 py-2 text-sm font-semibold rounded-md border transition-colors ${
                activeTab === "grilles" ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Layers3 className="h-4 w-4 inline mr-2" /> Grilles salariales
            </button>
          </div>

          {/* Bloc liste */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">{current.title}</h2>
              {/* ✅ on conserve ton bouton bleu dans l’entête */}
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold shadow"
              >
                <Plus className="h-4 w-4" />
                {activeTab === "profils" ? "Ajouter profil" : "Ajouter grille"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="text-gray-500 bg-gray-50/70">
                  {activeTab === "profils" ? (
                    <tr className="[&>th]:py-3 [&>th]:sm:py-3.5 [&>th]:px-3 sm:[&>th]:px-4 [&>th]:font-semibold text-left">
                      <th>Code</th>
                      <th>Nom</th>
                      <th>Catégorie</th>
                      <th>Fonction/Poste</th>
                      <th>Salaire de base</th>
                      <th>Primes associées</th>
                      <th>Date début</th>
                      <th>Date fin</th>
                      <th className="w-28 sm:w-36 text-right">Actions</th>
                    </tr>
                  ) : (
                    <tr className="[&>th]:py-3 [&>th]:sm:py-3.5 [&>th]:px-3 sm:[&>th]:px-4 [&>th]:font-semibold text-left">
                      <th>Profil</th>
                      <th>Niveau</th>
                      <th>Échelon</th>
                      <th>Ancienneté min (ans)</th>
                      <th>Salaire minimum</th>
                      <th>Date début</th>
                      <th>Date fin</th>
                      <th className="w-28 sm:w-36 text-right">Actions</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {activeTab === "profils" &&
                    profils.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3 sm:px-4 font-semibold text-gray-800">{row.code}</td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700">{row.nom}</td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700">{row.categorie}</td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700">{row.fonction}</td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700">{row.salaireBase}</td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700">{row.primes.join(", ") || "—"}</td>
                        <td className="py-3 px-3 sm:px-4">{dateCell(row.startDate)}</td>
                        <td className="py-3 px-3 sm:px-4">{dateCell(row.endDate)}</td>
                        <td className="py-3 px-3 sm:px-4">
                          <div className="flex items-center justify-end gap-1 text-gray-500">
                            <button onClick={() => openEdit(row)} className="p-2 hover:bg-gray-100 rounded-md hover:text-blue-600" title="Modifier">
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button onClick={() => openDelimModal(row)} className="p-2 hover:bg-gray-100 rounded-md hover:text-blue-600" title="Délimiter dates">
                              <CalendarClock className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(row.id)} className="p-2 hover:bg-red-50 rounded-md hover:text-red-600" title="Supprimer">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {activeTab === "grilles" &&
                    grilles.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3 sm:px-4 text-gray-700">{row.profil}</td>
                        <td className="py-3 px-3 sm:px-4 font-semibold text-gray-800">{row.niveau}</td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700">{row.echelon}</td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700">{row.ancienneteMin}</td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700">{row.salaireMin}</td>
                        <td className="py-3 px-3 sm:px-4">{dateCell(row.startDate)}</td>
                        <td className="py-3 px-3 sm:px-4">{dateCell(row.endDate)}</td>
                        <td className="py-3 px-3 sm:px-4">
                          <div className="flex items-center justify-end gap-1 text-gray-500">
                            <button onClick={() => openEdit(row)} className="p-2 hover:bg-gray-100 rounded-md hover:text-blue-600" title="Modifier">
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button onClick={() => openDelimModal(row)} className="p-2 hover:bg-gray-100 rounded-md hover:text-blue-600" title="Délimiter dates">
                              <CalendarClock className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(row.id)} className="p-2 hover:bg-red-50 rounded-md hover:text-red-600" title="Supprimer">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {current.data.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500">
                        Aucune donnée à afficher.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal édition */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate__animated animate__fadeIn" onClick={() => setIsModalOpen(false)} />
          <div
            className="relative bg-white w-[95%] sm:w-full max-w-3xl rounded-xl shadow-lg p-6 animate__animated animate__fadeInUp max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingId ? "Modifier" : "Créer"} {activeTab === "profils" ? "profil" : "grille"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-md hover:bg-gray-100" aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {activeTab === "profils" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code du profil</label>
                  <input
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.code || ""}
                    onChange={(e) => setFormValues({ ...formValues, code: (e.target as HTMLInputElement).value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du profil</label>
                  <input
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.nom || ""}
                    onChange={(e) => setFormValues({ ...formValues, nom: (e.target as HTMLInputElement).value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie associée</label>
                  <select
                    className="w-full h-11 rounded-lg bg-white border border-gray-200 px-3 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.categorie || ""}
                    onChange={(e) => setFormValues({ ...formValues, categorie: (e.target as HTMLSelectElement).value })}
                  >
                    <option value="">Sélectionner</option>
                    <option>Cadre</option>
                    <option>Employé</option>
                    <option>Ouvrier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fonction / Poste type</label>
                  <input
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.fonction || ""}
                    onChange={(e) => setFormValues({ ...formValues, fonction: (e.target as HTMLInputElement).value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salaire de base</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.salaireBase ?? ""}
                    onChange={(e) => setFormValues({ ...formValues, salaireBase: Number((e.target as HTMLInputElement).value) })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primes associées</label>
                  <input
                    placeholder="Séparer par des virgules (ex: Prime de transport, Prime panier)"
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={(formValues.primes || []).join(", ")}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        primes: (e.target as HTMLInputElement)
                          .value.split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                  <input
                    type="date"
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.startDate || ""}
                    onChange={(e) => setFormValues({ ...formValues, startDate: (e.target as HTMLInputElement).value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                  <input
                    type="date"
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.endDate || ""}
                    onChange={(e) => setFormValues({ ...formValues, endDate: (e.target as HTMLInputElement).value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    onClick={() => setFormValues({ ...formValues, startDate: addOneDay(formValues.endDate || "") })}
                    className="mt-1 inline-flex items-center gap-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 text-sm font-medium"
                  >
                    Délimiter date de Fin/Début
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profil concerné</label>
                  <select
                    className="w-full h-11 rounded-lg bg-white border border-gray-200 px-3 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.profil || profils[0]?.nom || ""}
                    onChange={(e) => setFormValues({ ...formValues, profil: (e.target as HTMLSelectElement).value })}
                  >
                    {profils.map((p) => (
                      <option key={p.id} value={p.nom}>
                        {p.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                  <input
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.niveau || ""}
                    onChange={(e) => setFormValues({ ...formValues, niveau: (e.target as HTMLInputElement).value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Échelon</label>
                  <input
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.echelon || ""}
                    onChange={(e) => setFormValues({ ...formValues, echelon: (e.target as HTMLInputElement).value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ancienneté minimale (années)</label>
                  <input
                    type="number"
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.ancienneteMin ?? ""}
                    onChange={(e) => setFormValues({ ...formValues, ancienneteMin: Number((e.target as HTMLInputElement).value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salaire minimum</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.salaireMin ?? ""}
                    onChange={(e) => setFormValues({ ...formValues, salaireMin: Number((e.target as HTMLInputElement).value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                  <input
                    type="date"
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.startDate || ""}
                    onChange={(e) => setFormValues({ ...formValues, startDate: (e.target as HTMLInputElement).value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                  <input
                    type="date"
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.endDate || ""}
                    onChange={(e) => setFormValues({ ...formValues, endDate: (e.target as HTMLInputElement).value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    onClick={() => setFormValues({ ...formValues, startDate: addOneDay(formValues.endDate || "") })}
                    className="mt-1 inline-flex items-center gap-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 text-sm font-medium"
                  >
                    Délimiter date de Fin/Début
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center gap-3 justify-end">
              <button onClick={saveForm} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 font-semibold shadow">
                <Save className="h-4 w-4" />
                Enregistrer
              </button>
              <button onClick={() => setIsModalOpen(false)} className="inline-flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 font-semibold">
                <X className="h-4 w-4" />
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal délimitation */}
      {isDelimOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate__animated animate__fadeIn" onClick={() => setIsDelimOpen(false)} />
          <div
            className="relative bg-white w-[95%] sm:w-full max-w-md rounded-xl shadow-lg p-6 animate__animated animate__fadeInUp max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delim-title"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 id="delim-title" className="text-lg font-semibold text-gray-800">
                Délimiter la période
              </h3>
              <button onClick={() => setIsDelimOpen(false)} className="p-2 rounded-md hover:bg-gray-100" aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nouvelle date de fin</label>
                <input
                  type="date"
                  className={`w-full h-11 rounded-lg border ${delimError ? "border-red-400" : "border-gray-200"} bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500`}
                  value={delimEndDate}
                  onChange={(e) => {
                    const v = (e.target as HTMLInputElement).value;
                    setDelimEndDate(v);
                    if (delimTarget) setDelimError(validateDelimDate(v, delimTarget) || "");
                  }}
                />
                {delimTarget && (
                  <p className="mt-1 text-[11px] text-gray-500">
                    Période actuelle : <b>{toISO(delimTarget.startDate)}</b> → <b>{toISO(delimTarget.endDate)}</b>. La date choisie doit être ≥ début et &lt; fin actuelle.
                  </p>
                )}
                {delimError && <p className="mt-2 text-xs text-red-600">{delimError}</p>}
              </div>
              <p className="text-xs text-gray-500">
                Un nouvel enregistrement démarrera le <b>{addOneDay(delimEndDate || "")}</b>. Vous pourrez le modifier immédiatement.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3 justify-end">
              <button onClick={confirmDelimitation} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 font-semibold shadow">
                Valider
              </button>
              <button onClick={() => setIsDelimOpen(false)} className="inline-flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 font-semibold">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <SuccessToast show={toast.show} message={toast.message} onClose={() => setToast({ show: false, message: "" })} />
      <ConfirmDeleteModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={executeDelete} userName={toDelete ? "cet élément" : null} />
    </>
  );
}
