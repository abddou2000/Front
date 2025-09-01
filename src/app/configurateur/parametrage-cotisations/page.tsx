"use client";
import React, { useMemo, useState } from "react";
import "animate.css";

// Sidebar handled by layout.tsx

import {
  BadgeEuro,
  FileSignature,
  CalendarClock,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
} from "lucide-react";

import { SuccessToast } from "../../components/SuccessToast";
import { ConfirmDeleteModal } from "../../components/ConfirmDeleteModal";


// --- helpers dates ---
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
  type TypeCotisation = {
    id: number;
    nom: string;
    description: string;
    startDate: string;
    endDate: string;
  };
  type Cotisation = {
    id: number;
    typeId: number;
    code: string;
    nom: string;
    tauxSalarial: number;
    tauxPatronal: number;
    plafondSalarial?: number;
    plafondPatronal?: number;
    startDate: string;
    endDate: string;
    description?: string;
  };

  const [activeTab, setActiveTab] = useState<"types" | "cotisations">("types");

  const [types, setTypes] = useState<TypeCotisation[]>([
    {
      id: 1,
      nom: "CNSS",
      description: "Caisse Nationale de Sécurité Sociale",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    },
    {
      id: 2,
      nom: "CIMR",
      description: "Retraite complémentaire",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    },
  ]);

  const [cotisations, setCotisations] = useState<Cotisation[]>([
    {
      id: 1,
      typeId: 1,
      code: "COT_CNSS_SAL",
      nom: "Cotisation CNSS salariale",
      tauxSalarial: 4.29,
      tauxPatronal: 0,
      plafondSalarial: 6000,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      description: "Part salariale CNSS",
    },
    {
      id: 2,
      typeId: 1,
      code: "COT_CNSS_PAT",
      nom: "Cotisation CNSS patronale",
      tauxSalarial: 0,
      tauxPatronal: 8.6,
      plafondPatronal: 6000,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      description: "Part patronale CNSS",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<any>({});
  const [toast, setToast] = useState({ show: false, message: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ id: number } | null>(null);

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
    setFormValues(row);
    setIsModalOpen(true);
  };
  const handleDelete = (id: number) => {
    setToDelete({ id });
    setConfirmOpen(true);
  };
  const executeDelete = () => {
    if (!toDelete) return;
    const id = toDelete.id;
    if (activeTab === "types") setTypes((prev) => prev.filter((r) => r.id !== id));
    if (activeTab === "cotisations")
      setCotisations((prev) => prev.filter((r) => r.id !== id));
    setConfirmOpen(false);
    setToDelete(null);
    setToast({ show: true, message: "Suppression effectuée." });
  };

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
    // Règle: start ≤ nouvelleFin < end
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
      originalEndDate: originalEndDate,
      activeTab: activeTab,
    };

    setIsDelimOpen(false);
    setDelimTarget(null);
    setDelimEndDate("");
    setDelimError("");

    // Ouvre la popup de modif de la "nouvelle version"
    const newStartDate = addOneDay(newEnd);
    const newVersion = {
      ...delimitationData, // info utile si besoin
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
      message:
        "Délimitation effectuée. Modifiez la nouvelle version (popup ouverte).",
    });
  };

  const current = useMemo(() => {
    if (activeTab === "types")
      return {
        key: "types",
        title: "Types de cotisation",
        data: types,
        columns: ["Nom", "Description", "Date début", "Date fin"],
      };
    return {
      key: "cotisations",
      title: "Paramétrage par type",
      data: cotisations,
      columns: [
        "Type",
        "Code",
        "Nom",
        "Taux sal.",
        "Taux pat.",
        "Plafond sal.",
        "Plafond pat.",
        "Description",
        "Date début",
        "Date fin",
      ],
    };
  }, [activeTab, types, cotisations]);

  const dateCell = (value: string) => (
    <span className="inline-flex items-center rounded-md px-2 py-1 text-[11px] md:text-xs font-medium bg-slate-100 text-slate-700">
      {value || "—"}
    </span>
  );

  // ⬇️ Sauvegarde : applique les changements de la popup comme “vraies” valeurs de la 2e entrée
  const saveForm = () => {
    // 1) Cas standard (création / modif simple, hors délimitation)
    if (!formValues._isDelimitation) {
      if (activeTab === "types") {
        if (editingId == null)
          setTypes((prev) => [
            {
              id: Date.now(),
              nom: formValues.nom || "",
              description: formValues.description || "",
              startDate: formValues.startDate || "",
              endDate: formValues.endDate || "",
            },
            ...prev,
          ]);
        else
          setTypes((prev) =>
            prev.map((r) => (r.id === editingId ? { ...r, ...formValues } : r))
          );
      } else {
        if (editingId == null)
          setCotisations((prev) => [
            {
              id: Date.now(),
              typeId: Number(formValues.typeId) || types[0]?.id || 0,
              code: formValues.code || "",
              nom: formValues.nom || "",
              tauxSalarial: Number(formValues.tauxSalarial) || 0,
              tauxPatronal: Number(formValues.tauxPatronal) || 0,
              plafondSalarial: formValues.plafondSalarial
                ? Number(formValues.plafondSalarial)
                : undefined,
              plafondPatronal: formValues.plafondPatronal
                ? Number(formValues.plafondPatronal)
                : undefined,
              startDate: formValues.startDate || "",
              endDate: formValues.endDate || "",
              description: formValues.description || "",
            },
            ...prev,
          ]);
        else
          setCotisations((prev) =>
            prev.map((r) =>
              r.id === editingId ? { ...r, ...formValues, typeId: Number(formValues.typeId) } : r
            )
          );
      }
    }

    // 2) Cas délimitation : appliquer la coupure + créer la nouvelle entrée avec LES VALEURS MODIFIÉES
    if (formValues._isDelimitation && formValues._delimitationData) {
      const { targetId, newEndDate, originalEndDate, activeTab: delimTab } =
        formValues._delimitationData;

      if (delimTab === "types") {
        setTypes((prev) => {
          // a) on coupe l’ancienne entrée à newEndDate
          const updated = prev.map((r) =>
            r.id === targetId ? { ...r, endDate: newEndDate } : r
          );
          // b) on crée la nouvelle entrée à partir des CHAMPS MODIFIÉS (formValues)
          const newEntry: TypeCotisation = {
            id: Date.now(),
            nom: formValues.nom ?? (prev.find((r) => r.id === targetId)?.nom || ""),
            description:
              formValues.description ??
              (prev.find((r) => r.id === targetId)?.description || ""),
            startDate: addOneDay(newEndDate),
            endDate: originalEndDate,
          };
          return [newEntry, ...updated];
        });
      } else {
        setCotisations((prev) => {
          // a) on coupe l’ancienne entrée à newEndDate
          const updated = prev.map((r) =>
            r.id === targetId ? { ...r, endDate: newEndDate } : r
          );
          const base = prev.find((r) => r.id === targetId);
          // b) on crée la nouvelle entrée depuis les VALEURS MODIFIÉES
          const newEntry: Cotisation = {
            id: Date.now(),
              code: formValues.code ?? (base?.code || ""),
            typeId: Number(
              formValues.typeId ?? (base ? base.typeId : types[0]?.id ?? 0)
            ),
          
            nom: formValues.nom ?? (base?.nom || ""),
            tauxSalarial: Number(
              formValues.tauxSalarial ?? (base?.tauxSalarial || 0)
            ),
            tauxPatronal: Number(
              formValues.tauxPatronal ?? (base?.tauxPatronal || 0)
            ),
            plafondSalarial:
              formValues.plafondSalarial !== undefined
                ? Number(formValues.plafondSalarial)
                : base?.plafondSalarial,
            plafondPatronal:
              formValues.plafondPatronal !== undefined
                ? Number(formValues.plafondPatronal)
                : base?.plafondPatronal,
            startDate: addOneDay(newEndDate),
            endDate: originalEndDate,
            description: formValues.description ?? base?.description ?? "",
          };
          return [newEntry, ...updated];
        });
      }
    }

    setIsModalOpen(false);
    setFormValues({});
    setEditingId(null);
    setToast({
      show: true,
      message: "Enregistrement effectué.",
    });
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Paramétrage des cotisations
            </h1>
          </div>

          {/* Onglets */}
          <div className="mb-4 sm:mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("types")}
              className={`px-3 sm:px-4 py-2 text-sm font-semibold rounded-md border transition-colors ${
                activeTab === "types"
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <BadgeEuro className="h-4 w-4 inline mr-2" /> Types de cotisation
            </button>
            <button
              onClick={() => setActiveTab("cotisations")}
              className={`px-3 sm:px-4 py-2 text-sm font-semibold rounded-md border transition-colors ${
                activeTab === "cotisations"
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FileSignature className="h-4 w-4 inline mr-2" /> Paramétrage par type
            </button>
          </div>

          {/* Tableau */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                {activeTab === "types" ? "Types de cotisation" : "Paramétrage par type"}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={openCreate}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 text-sm font-semibold shadow"
                >
                  <Plus className="h-4 w-4" />
                  {activeTab === "types" ? "Créer type" : "Créer cotisation"}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="text-gray-500 bg-gray-50/70">
                  <tr className="[&>th]:py-3 [&>th]:sm:py-3.5 [&>th]:px-3 sm:[&>th]:px-4 [&>th]:font-semibold text-left">
                    {activeTab === "types" ? (
                      <>
                        <th>Nom</th>
                        <th className="hidden md:table-cell">Description</th>
                        <th>Date début</th>
                        <th>Date fin</th>
                      </>
                    ) : (
                      <>
                      
                        <th>Code</th>
                        <th>Type</th>
                        <th>Nom</th>
                        <th className="hidden lg:table-cell">Taux sal.</th>
                        <th className="hidden lg:table-cell">Taux pat.</th>
                        <th className="hidden md:table-cell">Plafond sal.</th>
                        <th className="hidden md:table-cell">Plafond pat.</th>
                        <th className="hidden md:table-cell">Description</th>
                        <th>Date début</th>
                        <th>Date fin</th>
                      </>
                    )}
                    <th className="w-28 sm:w-36 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {activeTab === "types" &&
                    types.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3 sm:px-4 font-semibold text-gray-800">
                          {row.nom}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700 hidden md:table-cell">
                          {row.description}
                        </td>
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

                  {activeTab === "cotisations" &&
                    cotisations.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                         <td className="py-3 px-3 sm:px-4 font-semibold text-gray-800">
                          {row.code}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700">
                          {types.find((t) => t.id === row.typeId)?.nom || "—"}
                        </td>
                       
                        <td className="py-3 px-3 sm:px-4 text-gray-700">{row.nom}</td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700 hidden lg:table-cell">
                          {row.tauxSalarial}%
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700 hidden lg:table-cell">
                          {row.tauxPatronal}%
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700 hidden md:table-cell">
                          {row.plafondSalarial ?? "—"}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700 hidden md:table-cell">
                          {row.plafondPatronal ?? "—"}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700 hidden md:table-cell">
                          {row.description || "—"}
                        </td>
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
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Création/Modification */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 animate__animated animate__fadeIn"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white w-[95%] sm:w-full max-w-3xl rounded-xl shadow-lg p-4 sm:p-6 animate__animated animate__fadeInUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                {editingId ? "Modifier" : "Créer"}{" "}
                {activeTab === "types" ? "type de cotisation" : "cotisation"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100"
                aria-label="Fermer la fenêtre de modification"
                title="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {activeTab === "types" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du type
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full min-h-[88px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.description || ""}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        description: (e.target as HTMLTextAreaElement).value,
                      })
                    }
                  />
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
              </div>
            )}

            {activeTab === "cotisations" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de cotisation
                  </label>
                  <select
                    className="w-full h-11 rounded-lg bg-white border border-gray-200 px-3 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.typeId ?? types[0]?.id ?? ""}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        typeId: Number((e.target as HTMLSelectElement).value),
                      })
                    }
                  >
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nom}
                      </option>
                    ))}
                  </select>
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
                    Nom de la cotisation
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
                    Taux salarial (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.tauxSalarial ?? 0}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        tauxSalarial: Number(
                          (e.target as HTMLInputElement).value
                        ),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taux patronal (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.tauxPatronal ?? 0}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        tauxPatronal: Number(
                          (e.target as HTMLInputElement).value
                        ),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plafond salarial
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.plafondSalarial ?? ""}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        plafondSalarial: Number(
                          (e.target as HTMLInputElement).value
                        ),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plafond patronal
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.plafondPatronal ?? ""}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        plafondPatronal: Number(
                          (e.target as HTMLInputElement).value
                        ),
                      })
                    }
                  />
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full min-h-[88px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.description || ""}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        description: (e.target as HTMLTextAreaElement).value,
                      })
                    }
                  />
                </div>
              </div>
            )}

            <div className="mt-5 sm:mt-6 flex items-center gap-2 sm:gap-3 justify-end">
              <button
                onClick={saveForm}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2.5 font-semibold shadow"
              >
                <Save className="h-4 w-4" />
                Enregistrer
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 sm:px-5 py-2.5 font-semibold"
              >
                <X className="h-4 w-4" />
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Délimitation */}
      {isDelimOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 animate__animated animate__fadeIn"
            onClick={() => setIsDelimOpen(false)}
          />
          <div
            className="relative bg-white w-[95%] sm:w-full max-w-md rounded-xl shadow-lg p-4 sm:p-6 animate__animated animate__fadeInUp max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delim-title"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 id="delim-title" className="text-base sm:text-lg font-semibold text-gray-800">
                Délimiter la période
              </h3>
              <button
                onClick={() => setIsDelimOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100"
                aria-label="Fermer la fenêtre de délimitation"
                title="Fermer"
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
                  max={delimTarget ? toISO(addOneDay(delimTarget.endDate || "")) : undefined}
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
                {delimTarget && (
                  <p className="mt-1 text-[11px] text-gray-500">
                    Période actuelle : <b>{toISO(delimTarget.startDate)}</b> →{" "}
                    <b>{toISO(delimTarget.endDate)}</b>. La date choisie doit
                    être ≥ début et &lt; fin actuelle.
                  </p>
                )}
                {delimError && (
                  <p className="mt-2 text-xs text-red-600">{delimError}</p>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Après validation, l’entrée actuelle s’arrête à cette date et une nouvelle
                version est créée à partir du lendemain. La modification est obligatoire
                et les champs modifiés seront pris en compte pour la 2ᵉ entrée.
              </p>
            </div>
            <div className="mt-5 sm:mt-6 flex items-center gap-2 sm:gap-3 justify-end">
              <button
                onClick={confirmDelimitation}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2.5 font-semibold shadow"
              >
                Valider
              </button>
              <button
                onClick={() => setIsDelimOpen(false)}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 sm:px-5 py-2.5 font-semibold"
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
