"use client";
import React, { useMemo, useState } from "react";
import "animate.css";

// Sidebar handled by layout.tsx
import {
  CalendarClock,
  ClipboardList,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
} from "lucide-react";

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

export default function Page() {
  type Holiday = {
    id: number;
    code: string;
    nom: string;
    dateDebut: string;
    dateFin: string;
    validDebut: string;
    validFin: string;
    recurrence: boolean;
  };
  type LeaveType = {
    id: number;
    nom: string;
    code: string;
    decompte: boolean;
    justificatif: boolean;
    startDate: string;
    endDate: string;
  };

  const [activeTab, setActiveTab] = useState<"feries" | "absences">("feries");
  const [yearFilter, setYearFilter] = useState<string>(new Date().getFullYear().toString());

  const [holidays, setHolidays] = useState<Holiday[]>([
    {
      id: 1,
      code: "AIDF",
      nom: "Aid El Fitr",
      dateDebut: "2024-04-10",
      dateFin: "2024-04-11",
      validDebut: "2024-01-01",
      validFin: "2024-12-31",
      recurrence: true,
    },
  ]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([
    {
      id: 1,
      nom: "Récupération",
      code: "RECUP",
      decompte: false,
      justificatif: false,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<any>({});
  const [toast, setToast] = useState({ show: false, message: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ id: number } | null>(null);

  // Délimitation
  const [isDelimOpen, setIsDelimOpen] = useState(false);
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
    setFormValues(JSON.parse(JSON.stringify(row))); // clone pour éviter les effets de bord
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setToDelete({ id });
    setConfirmOpen(true);
  };
  const executeDelete = () => {
    if (!toDelete) return;
    if (activeTab === "feries")
      setHolidays((prev) => prev.filter((r) => r.id !== toDelete.id));
    else setLeaveTypes((prev) => prev.filter((r) => r.id !== toDelete.id));
    setConfirmOpen(false);
    setToDelete(null);
    setToast({ show: true, message: "Suppression effectuée." });
  };

  // --- délimitation ---
  const openDelimModal = (row: any) => {
    setDelimTarget(row);
    setDelimEndDate("");
    setDelimError("");
    setIsDelimOpen(true);
  };

  const validateDelimDate = (newEnd: string, row: any): string | null => {
    if (!newEnd) return "Veuillez choisir une date de fin.";
    if (activeTab === "feries") {
      const s = toISO(row.validDebut);
      const e = toISO(row.validFin);
      if (!isBetweenExclusive(newEnd, s, e)) {
        return `La date doit être ≥ ${s} et strictement < ${e}.`;
      }
    } else {
      const s = toISO(row.startDate);
      const e = toISO(row.endDate);
      if (!isBetweenExclusive(newEnd, s, e)) {
        return `La date doit être ≥ ${s} et strictement < ${e}.`;
      }
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

    const originalEndDate =
      activeTab === "feries" ? delimTarget.validFin : delimTarget.endDate;

    // Préparer l’édition de la nouvelle version (la coupe réelle se fera au save)
    const newVersion =
      activeTab === "feries"
        ? {
            ...delimTarget,
            id: Date.now(),
            validDebut: addOneDay(newEnd),
            validFin: originalEndDate,
            _isDelimitation: true,
            _delimitationData: {
              tab: "feries",
              targetId: delimTarget.id,
              newEndDate: newEnd,
              originalEndDate,
            },
          }
        : {
            ...delimTarget,
            id: Date.now(),
            startDate: addOneDay(newEnd),
            endDate: originalEndDate,
            _isDelimitation: true,
            _delimitationData: {
              tab: "absences",
              targetId: delimTarget.id,
              newEndDate: newEnd,
              originalEndDate,
            },
          };

    setIsDelimOpen(false);
    setDelimTarget(null);
    setDelimEndDate("");
    setDelimError("");

    setEditingId(newVersion.id);
    setFormValues(newVersion);
    setIsModalOpen(true);
    setToast({ show: true, message: "Délimitation effectuée. Modifiez la nouvelle version." });
  };

  const saveForm = () => {
    // Cas standard
    const saveStandard = () => {
      if (activeTab === "feries") {
        if (editingId == null)
          setHolidays((prev) => [{ id: Date.now(), ...formValues }, ...prev]);
        else
          setHolidays((prev) =>
            prev.map((r) => (r.id === editingId ? { ...r, ...formValues } : r))
          );
      } else {
        if (editingId == null)
          setLeaveTypes((prev) => [{ id: Date.now(), ...formValues }, ...prev]);
        else
          setLeaveTypes((prev) =>
            prev.map((r) => (r.id === editingId ? { ...r, ...formValues } : r))
          );
      }
    };

    // Cas délimitation : couper l’ancienne ligne + créer la nouvelle avec les champs modifiés
    const saveDelimitation = () => {
      const data = formValues._delimitationData;
      if (!data) return saveStandard();

      const { tab, targetId, newEndDate, originalEndDate } = data;

      const apply = (setter: React.Dispatch<React.SetStateAction<any[]>>) => {
        setter((prev) => {
          const updated =
            tab === "feries"
              ? prev.map((r) => (r.id === targetId ? { ...r, validFin: newEndDate } : r))
              : prev.map((r) => (r.id === targetId ? { ...r, endDate: newEndDate } : r));

          const base = prev.find((r) => r.id === targetId) || {};

          const newEntry =
            tab === "feries"
              ? {
                  ...(base as any),
                  ...formValues,
                  id: Date.now(),
                  validDebut: addOneDay(newEndDate),
                  validFin: originalEndDate,
                }
              : {
                  ...(base as any),
                  ...formValues,
                  id: Date.now(),
                  startDate: addOneDay(newEndDate),
                  endDate: originalEndDate,
                };

          delete (newEntry as any)._isDelimitation;
          delete (newEntry as any)._delimitationData;

          return [newEntry, ...updated];
        });
      };

      if (tab === "feries") apply(setHolidays);
      else apply(setLeaveTypes);
    };

    if (formValues._isDelimitation) saveDelimitation();
    else saveStandard();

    setIsModalOpen(false);
    setFormValues({});
    setEditingId(null);
    setToast({ show: true, message: "Enregistrement effectué." });
  };

  const filteredHolidays = useMemo(
    () => holidays.filter((h) => (h.validDebut || "").startsWith(yearFilter)),
    [holidays, yearFilter]
  );

  const dateCell = (value: string) => (
    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700">
      {value || "—"}
    </span>
  );

  return (
    <>
      <div className="pt-3 sm:pt-0 p-4 sm:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Titre + anti recouvrement hamburger */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div aria-hidden className="w-10 h-10 shrink-0 sm:hidden" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Paramétrage des données des temps
              </h1>
            </div>
          </div>

          {/* Onglets */}
          <div className="mb-4 sm:mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("feries")}
              className={`px-3 sm:px-4 py-2 text-sm font-semibold rounded-md border transition-colors ${
                activeTab === "feries"
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <CalendarClock className="h-4 w-4 inline mr-2" />
              Calendrier des jours fériés
            </button>
            <button
              onClick={() => setActiveTab("absences")}
              className={`px-3 sm:px-4 py-2 text-sm font-semibold rounded-md border transition-colors ${
                activeTab === "absences"
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ClipboardList className="h-4 w-4 inline mr-2" />
              Types d’absences (congés)
            </button>
          </div>

          {/* Fériés */}
          {activeTab === "feries" && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-700">Année de validité</label>
                  <select
                    className="h-10 rounded-lg bg-white border border-gray-200 px-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                    value={yearFilter}
                    onChange={(e) => setYearFilter((e.target as HTMLSelectElement).value)}
                  >
                    {Array.from({ length: 6 }).map((_, idx) => {
                      const y = (new Date().getFullYear() - 2 + idx).toString();
                      return (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <button
                  onClick={openCreate}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold shadow"
                >
                  <Plus className="h-4 w-4" />
                  Créer
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="text-gray-500 bg-gray-50/70">
                    <tr className="[&>th]:py-3 [&>th]:sm:py-3.5 [&>th]:px-3 sm:[&>th]:px-4 [&>th]:font-semibold text-left">
                      <th>Code</th>
                      <th>Nom</th>
                      <th>Date début</th>
                      <th>Date fin</th>
                      <th>Début validité</th>
                      <th>Fin validité</th>
                      <th>Récurrence</th>
                      <th className="w-28 sm:w-36 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredHolidays.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3 sm:px-4 font-semibold text-gray-800">{row.code}</td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700">{row.nom}</td>
                        <td className="py-3 px-3 sm:px-4">{dateCell(row.dateDebut)}</td>
                        <td className="py-3 px-3 sm:px-4">{dateCell(row.dateFin)}</td>
                        <td className="py-3 px-3 sm:px-4">{dateCell(row.validDebut)}</td>
                        <td className="py-3 px-3 sm:px-4">{dateCell(row.validFin)}</td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700">{row.recurrence ? "Oui" : "Non"}</td>
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
                    {filteredHolidays.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-500">
                          Aucun jour férié pour cette année.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Absences */}
          {activeTab === "absences" && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Types d’absences (congés)</h2>
                <button
                  onClick={openCreate}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold shadow"
                >
                  <Plus className="h-4 w-4" />
                  Créer
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="text-gray-500 bg-gray-50/70">
                    <tr className="[&>th]:py-3 [&>th]:sm:py-3.5 [&>th]:px-3 sm:[&>th]:px-4 [&>th]:font-semibold text-left">
                      <th>Nom</th>
                      <th>Code</th>
                      <th>Décompte</th>
                      <th>Justificatif</th>
                      <th>Date début</th>
                      <th>Date fin</th>
                      <th className="w-28 sm:w-36 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {leaveTypes.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3 sm:px-4 font-semibold text-gray-800">{row.nom}</td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700">{row.code}</td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700">{row.decompte ? "Oui" : "Non"}</td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700">{row.justificatif ? "Oui" : "Non"}</td>
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
                    {leaveTypes.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-500">
                          Aucun type d’absence.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
                {editingId ? "Modifier" : "Créer"} {activeTab === "feries" ? "jour férié" : "type d'absence"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-md hover:bg-gray-100" aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {activeTab === "feries" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <input className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                         value={formValues.code || ""} onChange={(e) => setFormValues({ ...formValues, code: (e.target as HTMLInputElement).value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                         value={formValues.nom || ""} onChange={(e) => setFormValues({ ...formValues, nom: (e.target as HTMLInputElement).value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                  <input type="date" className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                         value={formValues.dateDebut || ""} onChange={(e) => setFormValues({ ...formValues, dateDebut: (e.target as HTMLInputElement).value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                  <input type="date" className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                         value={formValues.dateFin || ""} onChange={(e) => setFormValues({ ...formValues, dateFin: (e.target as HTMLInputElement).value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Début validité</label>
                  <input type="date" className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                         value={formValues.validDebut || ""} onChange={(e) => setFormValues({ ...formValues, validDebut: (e.target as HTMLInputElement).value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fin validité</label>
                  <input type="date" className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                         value={formValues.validFin || ""} onChange={(e) => setFormValues({ ...formValues, validFin: (e.target as HTMLInputElement).value })} />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={() => setFormValues({ ...formValues, validDebut: addOneDay(formValues.validFin || "") })}
                    className="mt-1 inline-flex items-center gap-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 text-sm font-medium"
                  >
                    Délimiter date de Fin/Début
                  </button>
                </div>
                <div className="md:col-span-2">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={!!formValues.recurrence}
                      onChange={(e) => setFormValues({ ...formValues, recurrence: (e.target as HTMLInputElement).checked })}
                    />
                    <span>Récurrence annuelle</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                         value={formValues.nom || ""} onChange={(e) => setFormValues({ ...formValues, nom: (e.target as HTMLInputElement).value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <input className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                         value={formValues.code || ""} onChange={(e) => setFormValues({ ...formValues, code: (e.target as HTMLInputElement).value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Décompte dans le solde</label>
                  <select className="w-full h-11 rounded-lg bg-white border border-gray-200 px-3 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                          value={formValues.decompte ? "Oui" : "Non"}
                          onChange={(e) => setFormValues({ ...formValues, decompte: (e.target as HTMLSelectElement).value === "Oui" })}>
                    <option>Oui</option>
                    <option>Non</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Justificatif requis</label>
                  <select className="w-full h-11 rounded-lg bg-white border border-gray-200 px-3 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                          value={formValues.justificatif ? "Oui" : "Non"}
                          onChange={(e) => setFormValues({ ...formValues, justificatif: (e.target as HTMLSelectElement).value === "Oui" })}>
                    <option>Oui</option>
                    <option>Non</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                  <input type="date" className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                         value={formValues.startDate || ""} onChange={(e) => setFormValues({ ...formValues, startDate: (e.target as HTMLInputElement).value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                  <input type="date" className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                         value={formValues.endDate || ""} onChange={(e) => setFormValues({ ...formValues, endDate: (e.target as HTMLInputElement).value })} />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="button"
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
                  max={delimTarget ? (activeTab === "feries" ? toISO(delimTarget.validFin || "") : toISO(delimTarget.endDate || "")) : undefined}
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
                    Période actuelle :{" "}
                    <b>{activeTab === "feries" ? toISO(delimTarget.validDebut) : toISO(delimTarget.startDate)}</b> →{" "}
                    <b>{activeTab === "feries" ? toISO(delimTarget.validFin) : toISO(delimTarget.endDate)}</b>. La date choisie doit être ≥ début et &lt; fin actuelle.
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
