"use client";
import React, { useState } from "react";
import {
  BadgePercent,
  ClipboardList,
  CalendarClock,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
} from "lucide-react";
import "animate.css";
import { SuccessToast } from "../../components/SuccessToast";
import { ConfirmDeleteModal } from "../../components/ConfirmDeleteModal";

// --- helpers ---
function addOneDay(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
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
// NEW: format d’affichage JJ-MM-AAAA
function formatDateFR(d?: string) {
  if (!d) return "";
  const t = new Date(d);
  if (Number.isNaN(t.getTime())) return "";
  const dd = String(t.getDate()).padStart(2, "0");
  const mm = String(t.getMonth() + 1).padStart(2, "0");
  const yyyy = t.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export default function Page() {
  type Tranche = {
    id: number;
    code: number;
    min: number;
    max: number;
    taux: number;
    deduction: number;
    startDate: string;
    endDate: string;
  };
  type Constante = {
    id: number;
    code: string;
    nom: string;
    value: number;
    startDate: string;
    endDate: string;
  };

  const [activeTab, setActiveTab] = useState<"tranches" | "constantes">("tranches");

  const [tranches, setTranches] = useState<Tranche[]>([
    { id: 1, code: 1, min: 0, max: 30000, taux: 0, deduction: 0, startDate: "2024-01-01", endDate: "2024-12-31" },
    { id: 2, code: 2, min: 30001, max: 50000, taux: 10, deduction: 500, startDate: "2024-01-01", endDate: "2024-12-31" },
  ]);
  const [constantes, setConstantes] = useState<Constante[]>([
    { id: 1, code: "CONST_A", nom: "Abattement général", value: 2500, startDate: "2024-01-01", endDate: "2024-12-31" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<any>({});
  const [toast, setToast] = useState({ show: false, message: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ id: number } | null>(null);

  // Délimitation
  const [isDelimOpen, setIsDelimOpen] = useState(false);
  const [delimTab, setDelimTab] = useState<"tranches" | "constantes">("tranches");
  const [delimTarget, setDelimTarget] = useState<any>(null);
  const [delimEndDate, setDelimEndDate] = useState<string>("");
  const [delimError, setDelimError] = useState<string>("");

  // --- actions ---
  const openCreate = () => {
    setEditingId(null);
    setFormValues({});
    setIsModalOpen(true);
  };

  const openEdit = (row: any) => {
    setEditingId(row.id);
    setFormValues(JSON.parse(JSON.stringify(row))); // clone
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setToDelete({ id });
    setConfirmOpen(true);
  };
  const executeDelete = () => {
    if (!toDelete) return;
    setTranches((prev) => prev.filter((r) => r.id !== toDelete.id));
    setConfirmOpen(false);
    setToDelete(null);
    setToast({ show: true, message: "Suppression effectuée." });
  };

  // --- délimitation ---
  const openDelimModal = (row: any, tab: "tranches" | "constantes") => {
    setDelimTab(tab);
    setDelimTarget(row);
    setDelimEndDate("");
    setDelimError("");
    setIsDelimOpen(true);
  };
  const validateDelimDate = (newEnd: string, row: any): string | null => {
    if (!newEnd) return "Veuillez choisir une date de fin.";
    const start = toISO(row.startDate);
    const end = toISO(row.endDate);
    if (!isBetweenExclusive(newEnd, start, end)) {
      return `La date doit être ≥ ${start} et strictement < ${end}.`;
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
    const delimitationData = { tab: delimTab, targetId: delimTarget.id, newEndDate: newEnd, originalEndDate };

    setIsDelimOpen(false);
    setDelimTarget(null);
    setDelimEndDate("");
    setDelimError("");

    // Ouvrir l’édition de la nouvelle version
    const newVersion = {
      ...delimitationData,
      ...delimTarget,
      id: Date.now(),
      startDate: addOneDay(newEnd),
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
      if (activeTab === "tranches") {
        if (editingId == null)
          setTranches((prev) => [
            {
              id: Date.now(),
              code: Number(formValues.code) || 0,
              min: Number(formValues.min) || 0,
              max: Number(formValues.max) || 0,
              taux: Number(formValues.taux) || 0,
              deduction: Number(formValues.deduction) || 0,
              startDate: formValues.startDate || "",
              endDate: formValues.endDate || "",
            },
            ...prev,
          ]);
        else
          setTranches((prev) =>
            prev.map((r) =>
              r.id === editingId
                ? {
                    ...r,
                    code: Number(formValues.code),
                    min: Number(formValues.min),
                    max: Number(formValues.max),
                    taux: Number(formValues.taux),
                    deduction: Number(formValues.deduction),
                    startDate: formValues.startDate,
                    endDate: formValues.endDate,
                  }
                : r
            )
          );
      } else {
        if (editingId != null) {
          setConstantes((prev) =>
            prev.map((r) =>
              r.id === editingId
                ? {
                    ...r,
                    code: formValues.code,
                    nom: formValues.nom,
                    value: Number(formValues.value) || 0,
                    startDate: formValues.startDate,
                    endDate: formValues.endDate,
                  }
                : r
            )
          );
        }
      }
    };

    const saveDelimitation = () => {
      const data = formValues._delimitationData;
      if (!data) return saveStandard();
      const { tab, targetId, newEndDate, originalEndDate } = data;

      const apply = (setter: React.Dispatch<React.SetStateAction<any[]>>) => {
        setter((prev) => {
          const updated = prev.map((r) => (r.id === targetId ? { ...r, endDate: newEndDate } : r));
          const base = prev.find((r) => r.id === targetId) || {};

          const normalized =
            tab === "tranches"
              ? {
                  code: Number(formValues.code) || 0,
                  min: Number(formValues.min) || 0,
                  max: Number(formValues.max) || 0,
                  taux: Number(formValues.taux) || 0,
                  deduction: Number(formValues.deduction) || 0,
                }
              : {
                  code: formValues.code,
                  nom: formValues.nom,
                  value: Number(formValues.value) || 0,
                };

          const newEntry = {
            ...(base as any),
            ...normalized,
            id: Date.now(),
            startDate: addOneDay(newEndDate),
            endDate: originalEndDate,
          };
          delete (newEntry as any)._isDelimitation;
          delete (newEntry as any)._delimitationData;

          return [newEntry, ...updated];
        });
      };

      if (tab === "tranches") apply(setTranches);
      else apply(setConstantes);
    };

    if (formValues._isDelimitation) saveDelimitation();
    else saveStandard();

    setIsModalOpen(false);
    setFormValues({});
    setEditingId(null);
    setToast({ show: true, message: "Enregistrement effectué." });
  };

  // --- view helpers ---
  const dateCell = (value: string) => (
    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700">
      {value ? formatDateFR(value) : "—"}
    </span>
  );

  return (
    <>
      <div className="pt-3 sm:pt-0 p-4 sm:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Titre + spacer mobile pour ne pas être masqué par le hamburger */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <div aria-hidden className="w-10 h-10 shrink-0 sm:hidden" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Paramétrage du Barème de l'IR
              </h1>
            </div>
          </div>

          {/* Onglets */}
          <div className="mb-4 sm:mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("tranches")}
              className={`px-3 sm:px-4 py-2 text-sm font-semibold rounded-md border transition-colors ${
                activeTab === "tranches"
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <BadgePercent className="h-4 w-4 inline mr-2" />
              Tranches IR
            </button>
            <button
              onClick={() => setActiveTab("constantes")}
              className={`px-3 sm:px-4 py-2 text-sm font-semibold rounded-md border transition-colors ${
                activeTab === "constantes"
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ClipboardList className="h-4 w-4 inline mr-2" />
              Constantes & Plafonds
            </button>
          </div>

          {/* Carte + header */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                {activeTab === "tranches" ? "Liste des tranches" : "Constantes & Plafonds"}
              </h2>
              {activeTab === "tranches" && (
                <button
                  onClick={openCreate}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold shadow"
                >
                  <Plus className="h-4 w-4" />
                  Créer
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="text-gray-500 bg-gray-50/70">
                  {activeTab === "tranches" ? (
                    <tr className="[&>th]:py-3 [&>th]:sm:py-3.5 [&>th]:px-3 sm:[&>th]:px-4 [&>th]:font-semibold text-left">
                      <th>Code</th>
                      <th>Valeur min</th>
                      <th>Valeur max</th>
                      <th>Taux (%)</th>
                      <th>Somme à déduire</th>
                      <th>Date début</th>
                      <th>Date fin</th>
                      <th className="w-28 sm:w-36 text-right">Actions</th>
                    </tr>
                  ) : (
                    <tr className="[&>th]:py-3 [&>th]:sm:py-3.5 [&>th]:px-3 sm:[&>th]:px-4 [&>th]:font-semibold text-left">
                      <th>Code</th>
                      <th>Nom</th>
                      <th>Valeur</th>
                      <th>Date début</th>
                      <th>Date fin</th>
                      <th className="w-28 sm:w-36 text-right">Actions</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {activeTab === "tranches" &&
                    tranches.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3 sm:px-4 font-semibold text-gray-800">{row.code}</td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700">{row.min}</td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700">{row.max}</td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700">{row.taux}%</td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700">{row.deduction}</td>
                        <td className="py-3 px-3 sm:px-4">{dateCell(row.startDate)}</td>
                        <td className="py-3 px-3 sm:px-4">{dateCell(row.endDate)}</td>
                        <td className="py-3 px-3 sm:px-4">
                          <div className="flex items-center justify-end gap-1 text-gray-500">
                            <button
                              onClick={() => openEdit(row)}
                              className="p-2 hover:bg-gray-100 rounded-md hover:text-blue-600"
                              title="Modifier"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDelimModal(row, "tranches")}
                              className="p-2 hover:bg-gray-100 rounded-md hover:text-blue-600"
                              title="Délimiter dates"
                            >
                              <CalendarClock className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(row.id)}
                              className="p-2 hover:bg-red-50 rounded-md hover:text-red-600"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {activeTab === "constantes" &&
                    constantes.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3 sm:px-4 font-semibold text-gray-800">{row.code}</td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700">{row.nom}</td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700">{row.value}</td>
                        <td className="py-3 px-3 sm:px-4">{dateCell(row.startDate)}</td>
                        <td className="py-3 px-3 sm:px-4">{dateCell(row.endDate)}</td>
                        <td className="py-3 px-3 sm:px-4">
                          <div className="flex items-center justify-end gap-1 text-gray-500">
                            <button
                              onClick={() => openEdit(row)}
                              className="p-2 hover:bg-gray-100 rounded-md hover:text-blue-600"
                              title="Modifier"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDelimModal(row, "constantes")}
                              className="p-2 hover:bg-gray-100 rounded-md hover:text-blue-600"
                              title="Délimiter dates"
                            >
                              <CalendarClock className="h-4 w-4" />
                            </button>
                            {/* Pas de suppression/création sur constantes */}
                          </div>
                        </td>
                      </tr>
                    ))}

                  {activeTab === "tranches" && tranches.length === 0 && (
                    <tr><td colSpan={8} className="py-8 text-center text-gray-500">Aucune donnée à afficher.</td></tr>
                  )}
                  {activeTab === "constantes" && constantes.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-gray-500">Aucune donnée à afficher.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d’édition */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate__animated animate__fadeIn" onClick={() => setIsModalOpen(false)} />
          <div
            className="relative bg-white w-[95%] sm:w-full max-w-3xl rounded-xl shadow-lg p-6 animate__animated animate__fadeInUp max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingId ? "Modifier" : "Créer"} {activeTab === "tranches" ? "tranche" : "constante"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-md hover:bg-gray-100" aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {activeTab === "tranches" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <input type="number" className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                         value={formValues.code ?? ""} onChange={(e) => setFormValues({ ...formValues, code: Number((e.target as HTMLInputElement).value) })} />
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Valeur min</label>
                  <input type="number" className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                         value={formValues.min ?? ""} onChange={(e) => setFormValues({ ...formValues, min: Number((e.target as HTMLInputElement).value) })} />
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Valeur max</label>
                  <input type="number" className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                         value={formValues.max ?? ""} onChange={(e) => setFormValues({ ...formValues, max: Number((e.target as HTMLInputElement).value) })} />
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Taux (%)</label>
                  <input type="number" step="0.01" className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                         value={formValues.taux ?? ""} onChange={(e) => setFormValues({ ...formValues, taux: Number((e.target as HTMLInputElement).value) })} />
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Somme à déduire</label>
                  <input type="number" step="0.01" className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                         value={formValues.deduction ?? ""} onChange={(e) => setFormValues({ ...formValues, deduction: Number((e.target as HTMLInputElement).value) })} />
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                  <input type="date" className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                         value={formValues.startDate || ""} onChange={(e) => setFormValues({ ...formValues, startDate: (e.target as HTMLInputElement).value })} />
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                  <input type="date" className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                         value={formValues.endDate || ""} onChange={(e) => setFormValues({ ...formValues, endDate: (e.target as HTMLInputElement).value })} />
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
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <input className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                         value={formValues.code || ""} onChange={(e) => setFormValues({ ...formValues, code: (e.target as HTMLInputElement).value })} />
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                         value={formValues.nom || ""} onChange={(e) => setFormValues({ ...formValues, nom: (e.target as HTMLInputElement).value })} />
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Valeur</label>
                  <input type="number" step="0.01" className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                         value={formValues.value ?? ""} onChange={(e) => setFormValues({ ...formValues, value: Number((e.target as HTMLInputElement).value) })} />
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                  <input type="date" className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                         value={formValues.startDate || ""} onChange={(e) => setFormValues({ ...formValues, startDate: (e.target as HTMLInputElement).value })} />
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                  <input type="date" className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                         value={formValues.endDate || ""} onChange={(e) => setFormValues({ ...formValues, endDate: (e.target as HTMLInputElement).value })} />
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
                <Save className="h-4 w-4" /> Enregistrer
              </button>
              <button onClick={() => setIsModalOpen(false)} className="inline-flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 font-semibold">
                <X className="h-4 w-4" /> Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de délimitation */}
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
              <h3 id="delim-title" className="text-lg font-semibold text-gray-800">Délimiter la période</h3>
              <button onClick={() => setIsDelimOpen(false)} className="p-2 rounded-md hover:bg-gray-100" aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nouvelle date de fin</label>
                <input
                  type="date"
                  max={delimTarget ? toISO(delimTarget.endDate || "") : undefined}
                  className={`w-full h-11 rounded-lg border ${delimError ? "border-red-400" : "border-gray-200"} bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500`}
                  value={delimEndDate}
                  onChange={(e) => {
                    const v = (e.target as HTMLInputElement).value;
                    setDelimEndDate(v);
                    if (delimTarget) setDelimError(validateDelimDate(v, delimTarget) || "");
                  }}
                />
                {delimError && <p className="mt-2 text-xs text-red-600">{delimError}</p>}
              </div>
              {/* NEW: message sans trou après "le" */}
              <p className="text-xs text-gray-500">
                {delimEndDate
                  ? <>Un nouvel enregistrement démarrera le <b>{formatDateFR(addOneDay(delimEndDate))}</b>. Vous pourrez le modifier immédiatement.</>
                  : <>Le nouvel enregistrement démarrera le <i>lendemain</i> de la date que vous choisirez. Vous pourrez le modifier immédiatement.</>}
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
