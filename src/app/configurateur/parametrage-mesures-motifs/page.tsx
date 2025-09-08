"use client";
import React, { useMemo, useState } from "react";
import { CalendarClock, ClipboardList, Layers3, Plus, Edit3, Trash2, Save, X } from "lucide-react";
import "animate.css";
import { SuccessToast } from "../../components/SuccessToast";
import { ConfirmDeleteModal } from "../../components/ConfirmDeleteModal";

// --- helpers ---
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
// NEW: affichage JJ-MM-AAAA
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
  type Mesure = { id: number; code: string; nom: string; startDate: string; endDate: string };
  type Motif = { id: number; nom: string; mesureCode: string; startDate: string; endDate: string };

  const [activeTab, setActiveTab] = useState<"mesures" | "motifs">("mesures");
  const [mesures, setMesures] = useState<Mesure[]>([
    { id: 1, code: "EMB", nom: "Mesure d'embauche", startDate: "2024-01-01", endDate: "2024-12-31" },
  ]);
  const [motifs, setMotifs] = useState<Motif[]>([
    { id: 1, nom: "Création de poste", mesureCode: "EMB", startDate: "2024-01-01", endDate: "2024-12-31" },
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
    setFormValues(JSON.parse(JSON.stringify(row))); // clone pour éviter les effets de bord au clavier
    setIsModalOpen(true);
  };
  const handleDelete = (id: number) => {
    setToDelete({ id });
    setConfirmOpen(true);
  };
  const executeDelete = () => {
    if (!toDelete) return;
    if (activeTab === "mesures") setMesures((prev) => prev.filter((r) => r.id !== toDelete.id));
    else setMotifs((prev) => prev.filter((r) => r.id !== toDelete.id));
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

    // Prépare une nouvelle version (la coupe réelle s’applique au save)
    const newVersion = {
      ...delimTarget,
      id: Date.now(),
      startDate: addOneDay(newEnd),
      endDate: originalEndDate,
      _isDelimitation: true,
      _delimitationData: {
        tab: activeTab, // 'mesures' | 'motifs'
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
    const saveStandard = () => {
      if (activeTab === "mesures") {
        if (editingId == null) setMesures((prev) => [{ id: Date.now(), ...formValues }, ...prev]);
        else setMesures((prev) => prev.map((r) => (r.id === editingId ? { ...r, ...formValues } : r)));
      } else {
        if (editingId == null) setMotifs((prev) => [{ id: Date.now(), ...formValues }, ...prev]);
        else setMotifs((prev) => prev.map((r) => (r.id === editingId ? { ...r, ...formValues } : r)));
      }
    };

    const saveDelimitation = () => {
      const data = formValues._delimitationData;
      if (!data) return saveStandard();

      const { tab, targetId, newEndDate, originalEndDate } = data;

      const apply = (setter: React.Dispatch<React.SetStateAction<any[]>>) => {
        setter((prev) => {
          // a) couper l’ancienne entrée
          const updated = prev.map((r) => (r.id === targetId ? { ...r, endDate: newEndDate } : r));
          const base = prev.find((r) => r.id === targetId) || {};
          // b) nouvelle entrée = champs modifiés
          const newEntry = {
            ...(base as any),
            ...formValues,
            id: Date.now(),
            startDate: addOneDay(newEndDate),
            endDate: originalEndDate,
          } as any;
          delete (newEntry as any)._isDelimitation;
          delete (newEntry as any)._delimitationData;
          return [newEntry, ...updated];
        });
      };

      if (tab === "mesures") apply(setMesures);
      else apply(setMotifs);
    };

    if (formValues._isDelimitation) saveDelimitation();
    else saveStandard();

    setIsModalOpen(false);
    setFormValues({});
    setEditingId(null);
    setToast({ show: true, message: "Enregistrement effectué." });
  };

  const current = useMemo(() => {
    if (activeTab === "mesures") return { title: "Mesures", data: mesures };
    return { title: "Motifs de mesures", data: motifs };
  }, [activeTab, mesures, motifs]);

  const dateCell = (value: string) => (
    <span className="inline-flex items-center rounded-md px-2 py-1 text-[11px] md:text-xs font-medium bg-slate-100 text-slate-700">
      {value ? formatDateFR(value) : "—"}
    </span>
  );

  return (
    <>
      <div className="pt-3 sm:pt-0 p-4 sm:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Titre + espace anti-hamburger */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div aria-hidden className="w-10 h-10 shrink-0 sm:hidden" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Paramétrage des mesures & motifs</h1>
            </div>
          </div>

          {/* Onglets */}
          <div className="mb-4 sm:mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("mesures")}
              className={`px-3 sm:px-4 py-2 text-sm font-semibold rounded-md border transition-colors ${
                activeTab === "mesures" ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ClipboardList className="h-4 w-4 inline mr-2" /> Mesures
            </button>
            <button
              onClick={() => setActiveTab("motifs")}
              className={`px-3 sm:px-4 py-2 text-sm font-semibold rounded-md border transition-colors ${
                activeTab === "motifs" ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Layers3 className="h-4 w-4 inline mr-2" /> Motifs
            </button>
          </div>

          {/* Liste */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">{current.title}</h2>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold shadow"
              >
                <Plus className="h-4 w-4" />
                {activeTab === "mesures" ? "Créer une mesure" : "Créer un motif"}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className="text-gray-500 bg-gray-50/70">
                  {activeTab === "mesures" ? (
                    <tr className="[&>th]:py-3 [&>th]:sm:py-3.5 [&>th]:px-3 sm:[&>th]:px-4 [&>th]:font-semibold text-left">
                      <th>Code</th>
                      <th>Nom</th>
                      <th>Date début</th>
                      <th>Date fin</th>
                      <th className="w-28 sm:w-36 text-right">Actions</th>
                    </tr>
                  ) : (
                    <tr className="[&>th]:py-3 [&>th]:sm:py-3.5 [&>th]:px-3 sm:[&>th]:px-4 [&>th]:font-semibold text-left">
                      <th>Nom</th>
                      <th>Mesure (code)</th>
                      <th>Date début</th>
                      <th>Date fin</th>
                      <th className="w-28 sm:w-36 text-right">Actions</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {activeTab === "mesures" &&
                    mesures.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3 sm:px-4 font-semibold text-gray-800">{row.code}</td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700">{row.nom}</td>
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

                  {activeTab === "motifs" &&
                    motifs.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3 sm:px-4 font-semibold text-gray-800">{row.nom}</td>
                        <td className="py-3 px-3 sm:px-4 text-gray-700">{row.mesureCode}</td>
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
                      <td colSpan={5} className="py-8 text-center text-gray-500">
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
          <div className="absolute inset-0 bg-black/40 animate__animated animate__fadeIn" onClick={() => setIsModalOpen(false)} />
          <div
            className="relative bg-white w-[95%] sm:w-full max-w-3xl rounded-xl shadow-lg p-6 animate__animated animate__fadeInUp max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {editingId ? "Modifier" : "Créer"} {activeTab === "mesures" ? "mesure" : "motif"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-md hover:bg-gray-100" aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {activeTab === "mesures" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code de la mesure</label>
                  <input
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.code || ""}
                    onChange={(e) => setFormValues({ ...formValues, code: (e.target as HTMLInputElement).value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.nom || ""}
                    onChange={(e) => setFormValues({ ...formValues, nom: (e.target as HTMLInputElement).value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                  <input
                    type="date"
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.startDate || ""}
                    onChange={(e) => setFormValues({ ...formValues, startDate: (e.target as HTMLInputElement).value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                  <input
                    type="date"
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.endDate || ""}
                    onChange={(e) => setFormValues({ ...formValues, endDate: (e.target as HTMLInputElement).value })}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du motif</label>
                  <input
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.nom || ""}
                    onChange={(e) => setFormValues({ ...formValues, nom: (e.target as HTMLInputElement).value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mesure (code)</label>
                  <input
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.mesureCode || ""}
                    onChange={(e) => setFormValues({ ...formValues, mesureCode: (e.target as HTMLInputElement).value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                  <input
                    type="date"
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.startDate || ""}
                    onChange={(e) => setFormValues({ ...formValues, startDate: (e.target as HTMLInputElement).value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                  <input
                    type="date"
                    className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                    value={formValues.endDate || ""}
                    onChange={(e) => setFormValues({ ...formValues, endDate: (e.target as HTMLInputElement).value })}
                  />
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
              {/* NEW: message sans trou après "le" si aucune date n'est choisie */}
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
