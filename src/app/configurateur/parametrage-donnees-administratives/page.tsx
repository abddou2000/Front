"use client";
import React, { useMemo, useState, useCallback } from "react";
import "animate.css";

import {
  LayoutDashboard,
  Building2,
  FileSignature,
  Layers3,
  ClipboardList,
  CalendarClock,
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

type ActiveTab = "societes" | "contrats" | "categories" | "statuts" | "unites";

export default function Page() {
  // --- types de données ---
  type Base = { id: number; code?: string; nom: string; startDate: string; endDate: string; [k: string]: any };
  type Societe = Base & { ville: string };
  type TypeContrat = Base;
  type Categorie = Base;
  type Statut = Base;
  type UniteOrg = Base;

  // --- états ---
  const [activeTab, setActiveTab] = useState<ActiveTab>("societes");

  const [societes, setSocietes] = useState<Societe[]>([
    { id: 1, nom: "Innovex Consulting", ville: "Casablanca", startDate: "2024-01-01", endDate: "2024-12-31" },
  ]);
  const [contrats, setContrats] = useState<TypeContrat[]>([
    { id: 1, code: "CDI", nom: "Contrat Durée Indéterminée", startDate: "2024-01-01", endDate: "2024-12-31" },
  ]);
  const [categories, setCategories] = useState<Categorie[]>([
    { id: 1, code: "CAD", nom: "Cadre", startDate: "2024-01-01", endDate: "2024-12-31" },
  ]);
  const [statuts, setStatuts] = useState<Statut[]>([
    { id: 1, code: "ACT", nom: "Actif", startDate: "2024-01-01", endDate: "2024-12-31" },
  ]);
  const [unites, setUnites] = useState<UniteOrg[]>([
    { id: 1, code: "RH", nom: "Département RH", startDate: "2024-01-01", endDate: "2024-12-31" },
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

  // --- actions ---
  const openCreate = () => { setEditingId(null); setFormValues({}); setIsModalOpen(true); };
  const openEdit = (row: any) => { setEditingId(row.id); setFormValues(JSON.parse(JSON.stringify(row))); setIsModalOpen(true); };
  const handleDelete = (id: number) => { setToDelete({ id }); setConfirmOpen(true); };

  const executeDelete = () => {
    if (!toDelete) return;
    const id = toDelete.id;
    if (activeTab === "societes") setSocietes(prev => prev.filter(r => r.id !== id));
    if (activeTab === "contrats") setContrats(prev => prev.filter(r => r.id !== id));
    if (activeTab === "categories") setCategories(prev => prev.filter(r => r.id !== id));
    if (activeTab === "statuts") setStatuts(prev => prev.filter(r => r.id !== id));
    if (activeTab === "unites") setUnites(prev => prev.filter(r => r.id !== id));
    setConfirmOpen(false);
    setToDelete(null);
    setToast({ show: true, message: "Suppression effectuée." });
  };

  // ouverture du modal de délimitation
  const openDelimModal = (row: any) => {
    setDelimTarget(row);
    setDelimEndDate("");
    setDelimError("");
    setIsDelimOpen(true);
  };

  // validation & confirmation délimitation
  const validateDelimDate = (newEnd: string, row: any): string | null => {
    if (!newEnd) return "Veuillez choisir une date de fin.";
    const start = toISO(row.startDate);
    const end = toISO(row.endDate);
    if (!isBetweenExclusive(newEnd, start, end)) return `La date doit être ≥ ${start} et strictement < ${end}.`;
    return null;
  };

  const confirmDelimitation = () => {
    if (!delimTarget) return;
    const newEnd = toISO(delimEndDate);
    const err = validateDelimDate(newEnd, delimTarget);
    if (err) { setDelimError(err); setToast({ show: true, message: "Délimitation refusée : " + err }); return; }

    const originalEndDate = delimTarget.endDate;
    const delimitationData = { targetId: delimTarget.id, newEndDate: newEnd, originalEndDate, activeTab };

    setIsDelimOpen(false);
    setDelimTarget(null);
    setDelimEndDate("");
    setDelimError("");

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

    setToast({ show: true, message: "Délimitation effectuée. Modifiez la nouvelle version." });
  };

  // Sauvegarde (inclut cas délimitation)
  const saveForm = () => {
    const withDates = (obj: any) => ({ ...obj, startDate: obj.startDate || "", endDate: obj.endDate || "" });

    if (!formValues._isDelimitation) {
      if (activeTab === "societes") {
        if (editingId == null) setSocietes(prev => [{ id: Date.now(), nom: formValues.nom || "", ville: formValues.ville || "", ...withDates(formValues) }, ...prev]);
        else setSocietes(prev => prev.map(r => (r.id === editingId ? { ...r, ...withDates(formValues) } : r)));
      }
      if (activeTab === "contrats") {
        if (editingId == null) setContrats(prev => [{ id: Date.now(), code: formValues.code || "", nom: formValues.nom || "", ...withDates(formValues) }, ...prev]);
        else setContrats(prev => prev.map(r => (r.id === editingId ? { ...r, ...withDates(formValues) } : r)));
      }
      if (activeTab === "categories") {
        if (editingId == null) setCategories(prev => [{ id: Date.now(), code: formValues.code || "", nom: formValues.nom || "", ...withDates(formValues) }, ...prev]);
        else setCategories(prev => prev.map(r => (r.id === editingId ? { ...r, ...withDates(formValues) } : r)));
      }
      if (activeTab === "statuts") {
        if (editingId == null) setStatuts(prev => [{ id: Date.now(), code: formValues.code || "", nom: formValues.nom || "", ...withDates(formValues) }, ...prev]);
        else setStatuts(prev => prev.map(r => (r.id === editingId ? { ...r, ...withDates(formValues) } : r)));
      }
      if (activeTab === "unites") {
        if (editingId == null) setUnites(prev => [{ id: Date.now(), code: formValues.code || "", nom: formValues.nom || "", ...withDates(formValues) }, ...prev]);
        else setUnites(prev => prev.map(r => (r.id === editingId ? { ...r, ...withDates(formValues) } : r)));
      }
    }

    if (formValues._isDelimitation && formValues._delimitationData) {
      const { targetId, newEndDate, originalEndDate, activeTab: delimTab } = formValues._delimitationData;

      const apply = (setter: React.Dispatch<React.SetStateAction<any[]>>) => {
        setter(prev => {
          const updated = prev.map(r => (r.id === targetId ? { ...r, endDate: newEndDate } : r));
          const base = prev.find(r => r.id === targetId) || {};
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
      };

      if (delimTab === "societes") apply(setSocietes);
      if (delimTab === "contrats") apply(setContrats);
      if (delimTab === "categories") apply(setCategories);
      if (delimTab === "statuts") apply(setStatuts);
      if (delimTab === "unites") apply(setUnites);
    }

    setIsModalOpen(false);
    setFormValues({});
    setEditingId(null);
    setToast({ show: true, message: "Enregistrement effectué." });
  };

  // --- view helpers ---
  const current = useMemo(() => {
    if (activeTab === "societes")
      return { title: "Sociétés", data: societes, columns: ["Nom", "Ville", "Adresse", "ID Fiscal", "CNSS", "ICE", "RC", "Date début", "Date fin"] };
    if (activeTab === "contrats")
      return { title: "Types de contrat", data: contrats, columns: ["Code", "Nom", "Période d’essai", "Conditions", "Date début", "Date fin"] };
    if (activeTab === "categories")
      return { title: "Catégories", data: categories, columns: ["Code", "Nom", "Description", "Date début", "Date fin"] };
    if (activeTab === "statuts")
      return { title: "Statuts", data: statuts, columns: ["Code", "Nom", "Description", "Raison d’inactivité", "Date début", "Date fin"] };
    return { title: "Unités organisationnelles", data: unites, columns: ["Code", "Nom", "Type", "Rattachement", "Description", "Statut", "Date début", "Date fin"] };
  }, [activeTab, societes, contrats, categories, statuts, unites]);

  const handleNomChange = useCallback((v: string) => setFormValues((p: any) => ({ ...p, nom: v })), []);
  const handleVilleChange = useCallback((v: string) => setFormValues((p: any) => ({ ...p, ville: v })), []);
  const handleAdresseChange = useCallback((v: string) => setFormValues((p: any) => ({ ...p, adresse: v })), []);
  const handleIdFiscalChange = useCallback((v: string) => setFormValues((p: any) => ({ ...p, idFiscal: v })), []);
  const handleCnssChange = useCallback((v: string) => setFormValues((p: any) => ({ ...p, cnss: v })), []);
  const handleIceChange = useCallback((v: string) => setFormValues((p: any) => ({ ...p, ice: v })), []);
  const handleRcChange = useCallback((v: string) => setFormValues((p: any) => ({ ...p, rc: v })), []);
  const handleCodeChange = useCallback((v: string) => setFormValues((p: any) => ({ ...p, code: v })), []);
  const handleConditionsChange = useCallback((v: string) => setFormValues((p: any) => ({ ...p, conditions: v })), []);
  const handleDescriptionChange = useCallback((v: string) => setFormValues((p: any) => ({ ...p, description: v })), []);
  const handleRaisonInactiviteChange = useCallback((v: string) => setFormValues((p: any) => ({ ...p, raisonInactivite: v })), []);
  const handleTypeChange = useCallback((v: string) => setFormValues((p: any) => ({ ...p, type: v })), []);
  const handleRattachementChange = useCallback((v: string) => setFormValues((p: any) => ({ ...p, rattachement: v })), []);
  const handleStatutChange = useCallback((v: string) => setFormValues((p: any) => ({ ...p, statut: v })), []);
  const handleStartDateChange = useCallback((v: string) => setFormValues((p: any) => ({ ...p, startDate: v })), []);
  const handleEndDateChange = useCallback((v: string) => setFormValues((p: any) => ({ ...p, endDate: v })), []);

  const TabPill = ({ id, label }: { id: ActiveTab; label: React.ReactNode }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`px-3 sm:px-4 py-2 text-sm font-semibold rounded-md border transition-colors ${
        activeTab === id ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );

  const dateCell = (value: string) => (
    <span className="inline-flex items-center rounded-md px-2 py-1 text-[11px] md:text-xs font-medium bg-slate-100 text-slate-700">
      {value || "—"}
    </span>
  );

  const renderTable = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">{current.title}</h2>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 text-sm font-semibold shadow"
        >
          <Plus className="h-4 w-4" />
          Créer
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead className="text-gray-500 bg-gray-50/70">
            <tr className="[&>th]:py-3 [&>th]:sm:py-3.5 [&>th]:px-3 sm:[&>th]:px-4 [&>th]:font-semibold text-left">
              {activeTab === "societes" && (
                <>
                  <th>Nom</th><th>Ville</th>
                  <th className="hidden md:table-cell">Adresse</th>
                  <th className="hidden lg:table-cell">ID Fiscal</th>
                  <th className="hidden lg:table-cell">CNSS</th>
                  <th className="hidden lg:table-cell">ICE</th>
                  <th className="hidden xl:table-cell">RC</th>
                  <th>Date début</th><th>Date fin</th>
                </>
              )}
              {activeTab === "contrats" && (
                <>
                  <th>Code</th><th>Nom</th>
                  <th className="hidden md:table-cell">Période d’essai</th>
                  <th className="hidden md:table-cell">Conditions</th>
                  <th>Date début</th><th>Date fin</th>
                </>
              )}
              {activeTab === "categories" && (
                <>
                  <th>Code</th><th>Nom</th>
                  <th className="hidden md:table-cell">Description</th>
                  <th>Date début</th><th>Date fin</th>
                </>
              )}
              {activeTab === "statuts" && (
                <>
                  <th>Code</th><th>Nom</th>
                  <th className="hidden md:table-cell">Description</th>
                  <th className="hidden md:table-cell">Raison d’inactivité</th>
                  <th>Date début</th><th>Date fin</th>
                </>
              )}
              {activeTab === "unites" && (
                <>
                  <th>Code</th><th>Nom</th>
                  <th className="hidden md:table-cell">Type</th>
                  <th className="hidden lg:table-cell">Rattachement</th>
                  <th className="hidden lg:table-cell">Description</th>
                  <th className="hidden lg:table-cell">Statut</th>
                  <th>Date début</th><th>Date fin</th>
                </>
              )}
              <th className="w-28 sm:w-36 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {current.data.map((row: any) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                {activeTab === "societes" && (
                  <>
                    <td className="py-3 px-3 sm:px-4 font-semibold text-gray-800">{row.nom}</td>
                    <td className="py-3 px-3 sm:px-4 text-gray-700">{row.ville}</td>
                    <td className="py-3 px-3 sm:px-4 text-gray-700 hidden md:table-cell">{row.adresse || "—"}</td>
                    <td className="py-3 px-3 sm:px-4 text-gray-700 hidden lg:table-cell">{row.idFiscal || "—"}</td>
                    <td className="py-3 px-3 sm:px-4 text-gray-700 hidden lg:table-cell">{row.cnss || "—"}</td>
                    <td className="py-3 px-3 sm:px-4 text-gray-700 hidden lg:table-cell">{row.ice || "—"}</td>
                    <td className="py-3 px-3 sm:px-4 text-gray-700 hidden xl:table-cell">{row.rc || "—"}</td>
                    <td className="py-3 px-3 sm:px-4">{dateCell(row.startDate)}</td>
                    <td className="py-3 px-3 sm:px-4">{dateCell(row.endDate)}</td>
                  </>
                )}

                {activeTab === "contrats" && (
                  <>
                    <td className="py-3 px-3 sm:px-4 font-semibold text-gray-800">{row.code}</td>
                    <td className="py-3 px-3 sm:px-4 text-gray-700">{row.nom}</td>
                    <td className="py-3 px-3 sm:px-4 text-gray-700 hidden md:table-cell">{row.periodeEssai || "—"}</td>
                    <td className="py-3 px-3 sm:px-4 text-gray-700 hidden md:table-cell">{row.conditions || "—"}</td>
                    <td className="py-3 px-3 sm:px-4">{dateCell(row.startDate)}</td>
                    <td className="py-3 px-3 sm:px-4">{dateCell(row.endDate)}</td>
                  </>
                )}

                {activeTab === "categories" && (
                  <>
                    <td className="py-3 px-3 sm:px-4 font-semibold text-gray-800">{row.code}</td>
                    <td className="py-3 px-3 sm:px-4 text-gray-700">{row.nom}</td>
                    <td className="py-3 px-3 sm:px-4 text-gray-700 hidden md:table-cell">{row.description || "—"}</td>
                    <td className="py-3 px-3 sm:px-4">{dateCell(row.startDate)}</td>
                    <td className="py-3 px-3 sm:px-4">{dateCell(row.endDate)}</td>
                  </>
                )}

                {activeTab === "statuts" && (
                  <>
                    <td className="py-3 px-3 sm:px-4 font-semibold text-gray-800">{row.code}</td>
                    <td className="py-3 px-3 sm:px-4 text-gray-700">{row.nom}</td>
                    <td className="py-3 px-3 sm:px-4 text-gray-700 hidden md:table-cell">{row.description || "—"}</td>
                    <td className="py-3 px-3 sm:px-4 text-gray-700 hidden md:table-cell">{row.raisonInactivite || "—"}</td>
                    <td className="py-3 px-3 sm:px-4">{dateCell(row.startDate)}</td>
                    <td className="py-3 px-3 sm:px-4">{dateCell(row.endDate)}</td>
                  </>
                )}

                {activeTab === "unites" && (
                  <>
                    <td className="py-3 px-3 sm:px-4 font-semibold text-gray-800">{row.code}</td>
                    <td className="py-3 px-3 sm:px-4 text-gray-700">{row.nom}</td>
                    <td className="py-3 px-3 sm:px-4 text-gray-700 hidden md:table-cell">{row.type || "—"}</td>
                    <td className="py-3 px-3 sm:px-4 text-gray-700 hidden lg:table-cell">{row.rattachement || "—"}</td>
                    <td className="py-3 px-3 sm:px-4 text-gray-700 hidden lg:table-cell">{row.description || "—"}</td>
                    <td className="py-3 px-3 sm:px-4 text-gray-700 hidden lg:table-cell">{row.statut || "—"}</td>
                    <td className="py-3 px-3 sm:px-4">{dateCell(row.startDate)}</td>
                    <td className="py-3 px-3 sm:px-4">{dateCell(row.endDate)}</td>
                  </>
                )}

                <td className="py-3 px-3 sm:px-4">
                  <div className="flex items-center justify-end gap-1 text-gray-500">
                    <button type="button" onClick={() => openEdit(row)} className="p-2 hover:bg-gray-100 rounded-md hover:text-blue-600" title="Modifier">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => openDelimModal(row)} className="p-2 hover:bg-gray-100 rounded-md hover:text-blue-600" title="Délimiter dates">
                      <CalendarClock className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => handleDelete(row.id)} className="p-2 hover:bg-red-50 rounded-md hover:text-red-600" title="Supprimer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {current.data.length === 0 && (
              <tr>
                <td colSpan={current.columns.length + 1} className="py-8 text-center text-gray-500">
                  Aucune donnée à afficher.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const field = (label: string, value: any, onChange: (v: any) => void, placeholder = "") => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        placeholder={placeholder}
        className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
        value={value || ""}
        onChange={(e) => onChange((e.target as HTMLInputElement).value)}
      />
    </div>
  );

  const dateField = (label: string, value: string, onChange: (v: string) => void) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="date"
        className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
        value={value || ""}
        onChange={(e) => onChange((e.target as HTMLInputElement).value)}
      />
    </div>
  );

  // --- rendu (sans sidebar/outer flex : géré par layout) ---
  return (
    <>
      <div className="p-4 sm:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Paramétrage des données administratives</h1>
          </div>

          <div className="mb-4 sm:mb-6 flex flex-wrap gap-2">
            <TabPill id="societes"   label={<span className="inline-flex items-center gap-2"><Building2 className="h-4 w-4" />Sociétés</span>} />
            <TabPill id="contrats"   label={<span className="inline-flex items-center gap-2"><FileSignature className="h-4 w-4" />Types de contrat</span>} />
            <TabPill id="categories" label={<span className="inline-flex items-center gap-2"><Layers3 className="h-4 w-4" />Catégories de salarié</span>} />
            <TabPill id="statuts"    label={<span className="inline-flex items-center gap-2"><ClipboardList className="h-4 w-4" />Statuts du salarié</span>} />
            <TabPill id="unites"     label={<span className="inline-flex items-center gap-2"><LayoutDashboard className="h-4 w-4" />Unités organisationnelles</span>} />
          </div>

          {renderTable()}
        </div>
      </div>

      {/* Modals overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate__animated animate__fadeIn" onClick={() => setIsModalOpen(false)} />
          <div
            className="relative bg-white w-[95%] sm:w-full max-w-2xl rounded-xl shadow-lg p-4 sm:p-6 animate__animated animate__fadeInUp max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                {editingId ? "Modifier" : "Créer"} {current.title.slice(0, -1)}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 rounded-md hover:bg-gray-100" aria-label="Fermer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); saveForm(); }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4"
            >
              {activeTab === "societes" && (
                <>
                  {field("Nom de la société", formValues.nom, handleNomChange, "Ex: Innovex Consulting")}
                  {field("Ville", formValues.ville, handleVilleChange, "Ville")}
                  <div className="md:col-span-2">{field("Adresse", formValues.adresse, handleAdresseChange, "Adresse complète")}</div>
                  {field("ID Fiscal", formValues.idFiscal, handleIdFiscalChange, "Numéro fiscal")}
                  {field("Numéro CNSS", formValues.cnss, handleCnssChange, "Numéro CNSS")}
                  {field("Numéro ICE", formValues.ice, handleIceChange, "Numéro ICE")}
                  {field("Numéro RC", formValues.rc, handleRcChange, "Numéro RC")}
                  {dateField("Date début", formValues.startDate, handleStartDateChange)}
                  {dateField("Date fin", formValues.endDate, handleEndDateChange)}
                </>
              )}

              {activeTab === "contrats" && (
                <>
                  {field("Code du contrat", formValues.code, handleCodeChange, "Ex: CDI")}
                  {field("Nom du contrat", formValues.nom, handleNomChange, "Contrat Durée Indéterminée")}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Conditions spécifiques (optionnel)</label>
                    <textarea
                      className="w-full min-h-[88px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                      value={formValues.conditions || ""}
                      onChange={(e) => handleConditionsChange((e.target as HTMLTextAreaElement).value)}
                    />
                  </div>
                  {dateField("Date début", formValues.startDate, handleStartDateChange)}
                  {dateField("Date fin", formValues.endDate, handleEndDateChange)}
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={() => setFormValues({ ...formValues, startDate: addOneDay(formValues.endDate || "") })}
                      className="mt-1 inline-flex items-center gap-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 text-sm font-medium"
                    >
                      Délimiter date de Fin/Début
                    </button>
                  </div>
                </>
              )}

              {activeTab === "categories" && (
                <>
                  {field("Code", formValues.code, handleCodeChange, "Code de la catégorie")}
                  {field("Nom", formValues.nom, handleNomChange, "Nom de la catégorie")}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      className="w-full min-h-[88px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                      value={formValues.description || ""}
                      onChange={(e) => handleDescriptionChange((e.target as HTMLTextAreaElement).value)}
                    />
                  </div>
                  {dateField("Date début", formValues.startDate, handleStartDateChange)}
                  {dateField("Date fin", formValues.endDate, handleEndDateChange)}
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={() => setFormValues({ ...formValues, startDate: addOneDay(formValues.endDate || "") })}
                      className="mt-1 inline-flex items-center gap-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 text-sm font-medium"
                    >
                      Délimiter date de Fin/Début
                    </button>
                  </div>
                </>
              )}

              {activeTab === "statuts" && (
                <>
                  {field("Code", formValues.code, (v) => setFormValues({ ...formValues, code: v }), "Code du statut")}
                  {field("Nom", formValues.nom, (v) => setFormValues({ ...formValues, nom: v }), "Nom du statut")}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      className="w-full min-h-[88px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                      value={formValues.description || ""}
                      onChange={(e) => setFormValues({ ...formValues, description: (e.target as HTMLTextAreaElement).value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    {field("Raison d’inactivité", formValues.raisonInactivite, (v) => setFormValues({ ...formValues, raisonInactivite: v }), "Raison si inactif")}
                  </div>
                  {dateField("Date début", formValues.startDate, (v) => setFormValues({ ...formValues, startDate: v }))}
                  {dateField("Date fin", formValues.endDate, (v) => setFormValues({ ...formValues, endDate: v }))}
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={() => setFormValues({ ...formValues, startDate: addOneDay(formValues.endDate || "") })}
                      className="mt-1 inline-flex items-center gap-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 text-sm font-medium"
                    >
                      Délimiter date de Fin/Début
                    </button>
                  </div>
                </>
              )}

              {activeTab === "unites" && (
                <>
                  {field("Code", formValues.code, (v) => setFormValues({ ...formValues, code: v }), "Code de l’unité")}
                  {field("Nom", formValues.nom, (v) => setFormValues({ ...formValues, nom: v }), "Nom de l’unité")}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type d’unité</label>
                    <select
                      className="w-full h-11 rounded-lg bg-white border border-gray-200 px-3 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                      value={formValues.type || ""}
                      onChange={(e) => setFormValues({ ...formValues, type: (e.target as HTMLSelectElement).value })}
                    >
                      <option value="">Sélectionner</option>
                      <option value="Département">Département</option>
                      <option value="Service">Service</option>
                      <option value="Direction">Direction</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rattachement hiérarchique</label>
                    <select
                      className="w-full h-11 rounded-lg bg-white border border-gray-200 px-3 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                      value={formValues.rattachement || ""}
                      onChange={(e) => setFormValues({ ...formValues, rattachement: (e.target as HTMLSelectElement).value })}
                    >
                      <option value="">Aucun</option>
                      <option value="Direction Générale">Direction Générale</option>
                      <option value="Direction RH">Direction RH</option>
                      <option value="Direction IT">Direction IT</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      className="w-full min-h-[88px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                      value={formValues.description || ""}
                      onChange={(e) => setFormValues({ ...formValues, description: (e.target as HTMLTextAreaElement).value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <select
                      className="w-full h-11 rounded-lg bg-white border border-gray-200 px-3 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                      value={formValues.statut || ""}
                      onChange={(e) => setFormValues({ ...formValues, statut: (e.target as HTMLSelectElement).value })}
                    >
                      <option value="">Sélectionner</option>
                      <option value="Actif">Actif</option>
                      <option value="Inactif">Inactif</option>
                    </select>
                  </div>
                  {dateField("Date début", formValues.startDate, (v) => setFormValues({ ...formValues, startDate: v }))}
                  {dateField("Date fin", formValues.endDate, (v) => setFormValues({ ...formValues, endDate: v }))}
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={() => setFormValues({ ...formValues, startDate: addOneDay(formValues.endDate || "") })}
                      className="mt-1 inline-flex items-center gap-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 text-sm font-medium"
                    >
                      Délimiter date de Fin/Début
                    </button>
                  </div>
                </>
              )}

              <div className="mt-5 sm:mt-6 flex items-center gap-2 sm:gap-3 justify-end md:col-span-2">
                <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2.5 font-semibold shadow">
                  <Save className="h-4 w-4" />
                  Enregistrer
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="inline-flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 sm:px-5 py-2.5 font-semibold">
                  <X className="h-4 w-4" />
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDelimOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate__animated animate__fadeIn" onClick={() => setIsDelimOpen(false)} />
          <div
            className="relative bg-white w-[95%] sm:w-full max-w-md rounded-xl shadow-lg p-4 sm:p-6 animate__animated animate__fadeInUp max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delim-title"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 id="delim-title" className="text-base sm:text-lg font-semibold text-gray-800">Délimiter la période</h3>
              <button type="button" onClick={() => setIsDelimOpen(false)} className="p-2 rounded-md hover:bg-gray-100" aria-label="Fermer">
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
            <div className="mt-5 sm:mt-6 flex items-center gap-2 sm:gap-3 justify-end">
              <button type="button" onClick={confirmDelimitation} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2.5 font-semibold shadow">
                Valider
              </button>
              <button type="button" onClick={() => setIsDelimOpen(false)} className="inline-flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 sm:px-5 py-2.5 font-semibold">
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
