"use client";
import React, { useMemo, useState } from "react";
import "animate.css";
import { SuccessToast } from "../../components/SuccessToast";
import { ConfirmDeleteModal } from "../../components/ConfirmDeleteModal";
import { CalendarClock, Plus, Edit3, Trash2, Save, X } from "lucide-react";

// Sidebar handled by layout.tsx

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

// NEW: formatteur FR JJ-MM-AAAA pour l’affichage
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
  type AbsenceType = {
    id: number;
    nom: string;
    code: string;
    justificatif: boolean;
    remuneree: boolean;
    impactSolde: boolean;
    startDate: string;
    endDate: string;
  };

  const [absences, setAbsences] = useState<AbsenceType[]>([
    {
      id: 1,
      nom: "Congé payé",
      code: "CP",
      justificatif: false,
      remuneree: true,
      impactSolde: true,
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

  // délimitation
  const [isDelimOpen, setIsDelimOpen] = useState(false);
  const [delimTarget, setDelimTarget] = useState<any>(null);
  const [delimEndDate, setDelimEndDate] = useState<string>("");
  const [delimError, setDelimError] = useState<string>("");

  const openCreate = () => {
    setEditingId(null);
    setFormValues({});
    setIsModalOpen(true);
  };
  const openEdit = (row: any) => {
    setEditingId(row.id);
    // clone pour éviter mutation de la source
    setFormValues(JSON.parse(JSON.stringify(row)));
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setToDelete({ id });
    setConfirmOpen(true);
  };
  const executeDelete = () => {
    if (!toDelete) return;
    setAbsences((prev) => prev.filter((r) => r.id !== toDelete.id));
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
    const delimitationData = {
      targetId: delimTarget.id,
      newEndDate: newEnd,
      originalEndDate,
    };

    setIsDelimOpen(false);
    setDelimTarget(null);
    setDelimEndDate("");
    setDelimError("");

    // Ouvrir l'édition de la nouvelle version (pré-remplie)
    const newStartDate = addOneDay(newEnd);
    const newVersion = {
      ...delimitationData,
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

    setToast({
      show: true,
      message: "Délimitation effectuée. Modifiez la nouvelle version.",
    });
  };

  const saveForm = () => {
    // Création / édition standard
    if (editingId == null) {
      setAbsences((prev) => [
        {
          id: Date.now(),
          nom: formValues.nom || "",
          code: formValues.code || "",
          justificatif: !!formValues.justificatif,
          remuneree: !!formValues.remuneree,
          impactSolde: !!formValues.impactSolde,
          startDate: formValues.startDate || "",
          endDate: formValues.endDate || "",
        },
        ...prev,
      ]);
    } else {
      setAbsences((prev) =>
        prev.map((r) => (r.id === editingId ? { ...r, ...formValues } : r))
      );
    }

    // Cas délimitation : appliquer la coupe + créer la 2e entrée avec les MODIFS saisies
    if (formValues._isDelimitation && formValues._delimitationData) {
      const { targetId, newEndDate, originalEndDate } =
        formValues._delimitationData;

      setAbsences((prev) => {
        // a) couper l'ancienne entrée
        const updated = prev.map((r) =>
          r.id === targetId ? { ...r, endDate: newEndDate } : r
        );
        const base = prev.find((r) => r.id === targetId) || {};
        // b) nouvelle entrée = base fusionnée avec les CHAMPS MODIFIÉS
        const newEntry = {
          ...base,
          ...formValues,
          id: Date.now(),
          startDate: addOneDay(newEndDate),
          endDate: originalEndDate,
        } as any;
        delete newEntry._isDelimitation;
        delete newEntry._delimitationData;
        return [newEntry, ...updated];
      });
    }

    setIsModalOpen(false);
    setFormValues({});
    setEditingId(null);
    setToast({
      show: true,
      message: editingId == null ? "Création effectuée." : "Modification enregistrée.",
    });
  };

  // NEW: toutes les cellules de date affichent JJ-MM-AAAA
  const dateCell = (value: string) => (
    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700">
      {value ? formatDateFR(value) : "—"}
    </span>
  );

  return (
    <>
      <div className="pt-3 sm:pt-0 p-4 sm:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Barre d'actions au-dessus du titre */}
          {/* En-tête avec spacer mobile pour l'icône hamburger */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div aria-hidden className="w-10 h-10 shrink-0 sm:hidden" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Paramétrage des absences
              </h1>
            </div>
          </div>

          {/* Barre d'actions SOUS le titre */}
          <div className="mt-2 sm:mt-3 mb-4 sm:mb-6">
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold shadow"
            >
              <Plus className="h-4 w-4" />
              Créer
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-gray-500 bg-gray-50/70">
                  <tr className="[&>th]:py-3.5 [&>th]:px-4 [&>th]:font-semibold text-left">
                    <th>Nom</th>
                    <th>Code</th>
                    <th>Justificatif</th>
                    <th>Rémunérée</th>
                    <th>Impact solde</th>
                    <th>Date début</th>
                    <th>Date fin</th>
                    <th className="w-36 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {absences.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        {row.nom}
                      </td>
                      <td className="py-3 px-4 text-gray-700">{row.code}</td>
                      <td className="py-3 px-4 text-gray-700">
                        {row.justificatif ? "Oui" : "Non"}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {row.remuneree ? "Oui" : "Non"}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {row.impactSolde ? "Oui" : "Non"}
                      </td>
                      <td className="py-3 px-4">{dateCell(row.startDate)}</td>
                      <td className="py-3 px-4">{dateCell(row.endDate)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1 text-gray-500">
                          <button
                            onClick={() => openEdit(row)}
                            className="p-2 hover:bg-gray-100 rounded-md hover:text-blue-600"
                            title="Modifier"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDelimModal(row)}
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
                  {absences.length === 0 && (
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

      {/* Modal d’édition */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 animate__animated animate__fadeIn"
            onClick={() => setIsModalOpen(false)}
          />
          <div
            className="relative bg-white w-[95%] sm:w-full max-w-3xl rounded-xl shadow-lg p-6 animate__animated animate__fadeInUp max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingId ? "Modifier" : "Créer"} type d’absence
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du type d’absence
                </label>
                <input
                  className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formValues.nom || ""}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      nom: (e.target as HTMLInputElement).value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code
                </label>
                <input
                  className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formValues.code || ""}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      code: (e.target as HTMLInputElement).value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Justificatif requis
                </label>
                <select
                  className="w-full h-11 rounded-lg bg-white border border-gray-200 px-3 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formValues.justificatif ? "Oui" : "Non"}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      justificatif:
                        (e.target as HTMLSelectElement).value === "Oui",
                    })
                  }
                >
                  <option>Oui</option>
                  <option>Non</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Absence rémunérée
                </label>
                <select
                  className="w-full h-11 rounded-lg bg-white border border-gray-200 px-3 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formValues.remuneree ? "Oui" : "Non"}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      remuneree:
                        (e.target as HTMLSelectElement).value === "Oui",
                    })
                  }
                >
                  <option>Oui</option>
                  <option>Non</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Impact sur solde de congé
                </label>
                <select
                  className="w-full h-11 rounded-lg bg-white border border-gray-200 px-3 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formValues.impactSolde ? "Oui" : "Non"}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      impactSolde:
                        (e.target as HTMLSelectElement).value === "Oui",
                    })
                  }
                >
                  <option>Oui</option>
                  <option>Non</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date début
                </label>
                <input
                  type="date"
                  className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formValues.startDate || ""}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      startDate: (e.target as HTMLInputElement).value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date fin
                </label>
                <input
                  type="date"
                  className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formValues.endDate || ""}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      endDate: (e.target as HTMLInputElement).value,
                    })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <button
                  onClick={() =>
                    setFormValues({
                      ...formValues,
                      startDate: addOneDay(formValues.endDate || ""),
                    })
                  }
                  className="mt-1 inline-flex items-center gap-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 text-sm font-medium"
                >
                  Délimiter date de Fin/Début
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 justify-end">
              <button
                onClick={saveForm}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 font-semibold shadow"
              >
                <Save className="h-4 w-4" />
                Enregistrer
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 font-semibold"
              >
                <X className="h-4 w-4" />
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de délimitation */}
      {isDelimOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 animate__animated animate__fadeIn"
            onClick={() => setIsDelimOpen(false)}
          />
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
              <button
                onClick={() => setIsDelimOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouvelle date de fin
                </label>
                <input
                  type="date"
                  max={delimTarget ? toISO(delimTarget.endDate || "") : undefined}
                  className={`w-full h-11 rounded-lg border ${
                    delimError ? "border-red-400" : "border-gray-200"
                  } bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500`}
                  value={delimEndDate}
                  onChange={(e) => {
                    const v = (e.target as HTMLInputElement).value;
                    setDelimEndDate(v);
                    if (delimTarget) {
                      const maybe = validateDelimDate(v, delimTarget);
                      setDelimError(maybe || "");
                    }
                  }}
                />
                {delimError && (
                  <p className="mt-2 text-xs text-red-600">{delimError}</p>
                )}
              </div>
              {/* NEW: message conditionnel sans blanc après "le" */}
              <p className="text-xs text-gray-500">
                {delimEndDate
                  ? <>Un nouvel enregistrement démarrera le <b>{formatDateFR(addOneDay(delimEndDate))}</b>. Vous pourrez le modifier immédiatement.</>
                  : <>Le nouvel enregistrement démarrera le <i>lendemain</i> de la date que vous choisirez. Vous pourrez le modifier immédiatement.</>}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-3 justify-end">
              <button
                onClick={confirmDelimitation}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 font-semibold shadow"
              >
                Valider
              </button>
              <button
                onClick={() => setIsDelimOpen(false)}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 font-semibold"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <SuccessToast
        show={toast.show}
        message={toast.message}
        onClose={() => setToast({ show: false, message: "" })}
      />
      <ConfirmDeleteModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={executeDelete}
        userName={toDelete ? "cet élément" : null}
      />
    </>
  );
}
