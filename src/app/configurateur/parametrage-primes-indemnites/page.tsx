"use client";
import React, { useState } from "react";
import "animate.css";
import { SuccessToast } from "../../components/SuccessToast";
import { ConfirmDeleteModal } from "../../components/ConfirmDeleteModal";
// Sidebar handled by layout.tsx
import { CalendarClock, Plus, Edit3, Trash2, Save, X } from "lucide-react";

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
  type Prime = {
    id: number;
    nom: string;
    code: string;
    typeMontant: "Nombre" | "Montant" | "Pourcentage";
    montantFixe?: number;
    taux?: number;
    rubriqueSource?: string;
    valeurUnitaire?: number;
    soumisCotisation: boolean;
    soumisIR: boolean;
    startDate: string;
    endDate: string;
  };

  const [primes, setPrimes] = useState<Prime[]>([
    {
      id: 1,
      nom: "Prime de transport",
      code: "PR_TRANSP",
      typeMontant: "Montant",
      montantFixe: 500,
      soumisCotisation: false,
      soumisIR: true,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<any>({ typeMontant: "Montant" });
  const [toast, setToast] = useState({ show: false, message: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ id: number } | null>(null);

  // Délimitation
  const [isDelimOpen, setIsDelimOpen] = useState(false);
  const [delimTarget, setDelimTarget] = useState<any>(null);
  const [delimEndDate, setDelimEndDate] = useState<string>("");
  const [delimError, setDelimError] = useState<string>("");

  const openCreate = () => {
    setEditingId(null);
    setFormValues({ typeMontant: "Montant" });
    setIsModalOpen(true);
  };
  const openEdit = (row: Prime) => {
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
    setPrimes((prev) => prev.filter((r) => r.id !== toDelete.id));
    setConfirmOpen(false);
    setToDelete(null);
    setToast({ show: true, message: "Suppression effectuée." });
  };

  // Délimitation
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

    // Ouvrir l’édition de la nouvelle version (pré-remplie)
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
    // Normalisation des champs numériques selon typeMontant
    const normalized = {
      ...formValues,
      montantFixe:
        formValues.typeMontant === "Montant"
          ? Number(formValues.montantFixe) || 0
          : undefined,
      taux:
        formValues.typeMontant === "Pourcentage"
          ? Number(formValues.taux) || 0
          : undefined,
      valeurUnitaire:
        formValues.typeMontant === "Nombre"
          ? Number(formValues.valeurUnitaire) || 0
          : undefined,
    };

    // Création / édition standard
    if (editingId == null) {
      setPrimes((prev) => [{ id: Date.now(), ...normalized }, ...prev]);
    } else {
      setPrimes((prev) =>
        prev.map((r) => (r.id === editingId ? { ...r, ...normalized } : r))
      );
    }

    // Cas délimitation : couper + créer 2e entrée avec les MODIFS saisies
    if (formValues._isDelimitation && formValues._delimitationData) {
      const { targetId, newEndDate, originalEndDate } =
        formValues._delimitationData;

      setPrimes((prev) => {
        // a) Couper l’ancienne entrée
        const updated = prev.map((r) =>
          r.id === targetId ? { ...r, endDate: newEndDate } : r
        );
        const base = prev.find((r) => r.id === targetId) || {};
        // b) Nouvelle entrée = base fusionnée avec les CHAMPS MODIFIÉS
        const newEntry: Prime = {
          ...(base as any),
          ...normalized,
          id: Date.now(),
          startDate: addOneDay(newEndDate),
          endDate: originalEndDate,
        };
        // Nettoyer flags internes si traînent
        (newEntry as any)._isDelimitation && delete (newEntry as any)._isDelimitation;
        (newEntry as any)._delimitationData && delete (newEntry as any)._delimitationData;
        return [newEntry, ...updated];
      });
    }

    setIsModalOpen(false);
    setFormValues({ typeMontant: "Montant" });
    setEditingId(null);
    setToast({
      show: true,
      message: editingId == null ? "Création effectuée." : "Modification enregistrée.",
    });
  };

  const dateCell = (value: string) => (
    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700">
      {value || "—"}
    </span>
  );

  return (
    <>
      <div className="pt-3 sm:pt-0 p-4 sm:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {/* En-tête avec spacer mobile pour éviter que le hamburger recouvre le titre */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div aria-hidden className="w-10 h-10 shrink-0 sm:hidden" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Paramétrage des primes et indemnités
              </h1>
            </div>
          </div>

          {/* Bouton d'action SOUS le titre */}
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
                    <th>Type</th>
                    <th>Montant/Taux/Valeur</th>
                    <th>Soumis cotisation</th>
                    <th>Soumis IR</th>
                    <th>Date début</th>
                    <th>Date fin</th>
                    <th className="w-36 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {primes.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-800">{row.nom}</td>
                      <td className="py-3 px-4 text-gray-700">{row.code}</td>
                      <td className="py-3 px-4 text-gray-700">{row.typeMontant}</td>
                      <td className="py-3 px-4 text-gray-700">
                        {row.typeMontant === "Montant"
                          ? `${row.montantFixe ?? 0} DH`
                          : row.typeMontant === "Pourcentage"
                          ? `${row.taux ?? 0}% (${row.rubriqueSource || "—"})`
                          : `${row.valeurUnitaire ?? 0} /unité`}
                      </td>
                      <td className="py-3 px-4 text-gray-700">{row.soumisCotisation ? "Oui" : "Non"}</td>
                      <td className="py-3 px-4 text-gray-700">{row.soumisIR ? "Oui" : "Non"}</td>
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
                  {primes.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-gray-500">
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
                {editingId ? "Modifier" : "Créer"} prime/indemnité
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
                  Nom
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
                  Code interne
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
                  Type de montant
                </label>
                <select
                  className="w-full h-11 rounded-lg bg-white border border-gray-200 px-3 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formValues.typeMontant}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      typeMontant: (e.target as HTMLSelectElement).value,
                      // On ne vide pas nécessairement les autres, la normalisation gère
                    })
                  }
                >
                  <option>Nombre</option>
                  <option>Montant</option>
                  <option>Pourcentage</option>
                </select>
              </div>

              {formValues.typeMontant === "Montant" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant fixe
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.montantFixe ?? ""}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        montantFixe: Number(
                          (e.target as HTMLInputElement).value
                        ),
                      })
                    }
                  />
                </div>
              )}

              {formValues.typeMontant === "Pourcentage" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Taux (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                      value={formValues.taux ?? ""}
                      onChange={(e) =>
                        setFormValues({
                          ...formValues,
                          taux: Number((e.target as HTMLInputElement).value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rubrique source
                    </label>
                    <select
                      className="w-full h-11 rounded-lg bg-white border border-gray-200 px-3 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                      value={formValues.rubriqueSource || "Salaire de base"}
                      onChange={(e) =>
                        setFormValues({
                          ...formValues,
                          rubriqueSource: (e.target as HTMLSelectElement).value,
                        })
                      }
                    >
                      <option>Salaire de base</option>
                      <option>Prime d'ancienneté</option>
                      <option>Heures supplémentaires</option>
                    </select>
                  </div>
                </>
              )}

              {formValues.typeMontant === "Nombre" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valeur unitaire
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.valeurUnitaire ?? ""}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        valeurUnitaire: Number(
                          (e.target as HTMLInputElement).value
                        ),
                      })
                    }
                  />
                </div>
              )}

              <div>
                <label className="block text_sm font-medium text-gray-700 mb-1">
                  Soumis à cotisation
                </label>
                <select
                  className="w-full h-11 rounded-lg bg-white border border-gray-200 px-3 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formValues.soumisCotisation ? "Oui" : "Non"}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      soumisCotisation:
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
                  Soumis à l’IR
                </label>
                <select
                  className="w-full h-11 rounded-lg bg-white border border-gray-200 px-3 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formValues.soumisIR ? "Oui" : "Non"}
                  onChange={(e) =>
                    setFormValues({
                      ...formValues,
                      soumisIR:
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
                {delimTarget && (
                  <p className="mt-1 text-[11px] text-gray-500">
                    Période actuelle : <b>{toISO(delimTarget.startDate)}</b> →
                    <b> {toISO(delimTarget.endDate)}</b>. La date choisie doit
                    être ≥ début et &lt; fin actuelle.
                  </p>
                )}
                {delimError && (
                  <p className="mt-2 text-xs text-red-600">{delimError}</p>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Un nouvel enregistrement démarrera le{" "}
                <b>{addOneDay(delimEndDate || "")}</b>. Vous pourrez le modifier
                immédiatement.
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
