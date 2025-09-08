"use client";
import React, { useState } from "react";
import { FileText, ArrowLeft, Save } from "lucide-react";

export default function Page() {
  const [tile, setTile] = useState<null | 'bulletin' | 'journal' | 'attestationSalaire' | 'attestationTravail'>(null);
  const [dirty, setDirty] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // --- états contrôlés pour chaque tuile ---
  const [bulletinInfo, setBulletinInfo] = useState({
    cnssSociete: true,
    idFiscalSociete: true,
    iceSociete: true,
    cnssEmploye: true,
    cimrEmploye: true,
  });
  const [bulletinRubriques, setBulletinRubriques] = useState<
    { name: string; type: "Gain" | "Retenue"; show: boolean }[]
  >([
    { name: "Salaire de base", type: "Gain", show: true },
    { name: "Primes", type: "Gain", show: true },
    { name: "CNSS", type: "Retenue", show: true },
  ]);
  const [bulletinCotisations, setBulletinCotisations] = useState<
    { name: string; show: boolean }[]
  >([
    { name: "CNSS", show: true },
    { name: "CIMR", show: true },
    { name: "AMO", show: true },
  ]);

  const [journalHeader, setJournalHeader] = useState({
    dateGeneration: true,
    heure: true,
    devise: true,
  });
  const [journalRubriques, setJournalRubriques] = useState<
    { name: string; type: "Gain" | "Retenue"; show: boolean }[]
  >([
    { name: "Salaire de base", type: "Gain", show: true },
    { name: "Primes", type: "Gain", show: true },
    { name: "CNSS", type: "Retenue", show: true },
  ]);

  const [attestSalaire, setAttestSalaire] = useState({
    nationalite: true,
    naissance: true,
    adresse: true,
    cin: true,
    cnss: true,
  });
  const [attestTravail, setAttestTravail] = useState({
    nationalite: true,
    naissance: true,
    adresse: true,
    cin: true,
  });

  const markDirty = () => setDirty(true);

  const handleSave = () => {
    // Ici: call API / persist config
    // console.log({ bulletinInfo, bulletinRubriques, bulletinCotisations, journalHeader, journalRubriques, attestSalaire, attestTravail });
    setDirty(false);
    setSaveMsg("Modifications sauvegardées");
    setTimeout(() => setSaveMsg(null), 2000);
  };

  const Tile = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition
                 hover:-translate-y-0.5 p-6 w-[320px] sm:w-[380px] h-[120px] text-left"
      aria-label={label}
    >
      <FileText className="h-7 w-7 text-gray-600 group-hover:text-blue-600" />
      <span className="text-lg font-semibold text-gray-800">{label}</span>
    </button>
  );

  const CheckboxRow = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="flex items-center justify-between py-2">
      <span className="text-gray-700">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          onChange((e.target as HTMLInputElement).checked);
          markDirty();
        }}
      />
    </label>
  );

  return (
    <>
      <div className="p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Paramétrage des états</h1>

            {tile && (
              <button
                type="button"
                onClick={() => {
                  setTile(null);
                  // on ne reset pas 'dirty' pour éviter de perdre un travail non sauvegardé
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 text-sm font-semibold"
                aria-label="Revenir à la liste"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </button>
            )}
          </div>

          {/* Grille 2x2 centrée */}
          {!tile && (
            <section className="flex items-center justify-center min-h-[55vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 place-items-center">
                <Tile label="Bulletin de paie" onClick={() => setTile('bulletin')} />
                <Tile label="Journal de paie" onClick={() => setTile('journal')} />
                <Tile label="Attestation de salaire" onClick={() => setTile('attestationSalaire')} />
                <Tile label="Attestation de travail" onClick={() => setTile('attestationTravail')} />
              </div>
            </section>
          )}

          {tile === 'bulletin' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Bulletin de paie</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Informations société & salarié</h3>
                  <div className="divide-y divide-gray-200">
                    <CheckboxRow
                      label="Numéro CNSS société"
                      checked={bulletinInfo.cnssSociete}
                      onChange={(v) => setBulletinInfo((s) => ({ ...s, cnssSociete: v }))}
                    />
                    <CheckboxRow
                      label="ID Fiscal société"
                      checked={bulletinInfo.idFiscalSociete}
                      onChange={(v) => setBulletinInfo((s) => ({ ...s, idFiscalSociete: v }))}
                    />
                    <CheckboxRow
                      label="Numéro ICE société"
                      checked={bulletinInfo.iceSociete}
                      onChange={(v) => setBulletinInfo((s) => ({ ...s, iceSociete: v }))}
                    />
                    <CheckboxRow
                      label="Numéro CNSS employé"
                      checked={bulletinInfo.cnssEmploye}
                      onChange={(v) => setBulletinInfo((s) => ({ ...s, cnssEmploye: v }))}
                    />
                    <CheckboxRow
                      label="Numéro CIMR employé"
                      checked={bulletinInfo.cimrEmploye}
                      onChange={(v) => setBulletinInfo((s) => ({ ...s, cimrEmploye: v }))}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Rubriques disponibles</h3>
                  <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr className="[&>th]:py-2 [&>th]:px-3 text-left">
                        <th>Nom de la rubrique</th>
                        <th>Type</th>
                        <th>Afficher</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bulletinRubriques.map((r, i) => (
                        <tr key={r.name}>
                          <td className="py-2 px-3">{r.name}</td>
                          <td className="py-2 px-3">{r.type}</td>
                          <td className="py-2 px-3">
                            <input
                              type="checkbox"
                              checked={r.show}
                              onChange={(e) => {
                                const v = (e.target as HTMLInputElement).checked;
                                setBulletinRubriques((arr) => {
                                  const next = [...arr];
                                  next[i] = { ...next[i], show: v };
                                  return next;
                                });
                                markDirty();
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:col-span-2">
                  <h3 className="font-semibold text-gray-700 mb-3">Cotisations</h3>
                  <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr className="[&>th]:py-2 [&>th]:px-3 text-left">
                        <th>Nom de la cotisation</th>
                        <th>Afficher</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bulletinCotisations.map((c, i) => (
                        <tr key={c.name}>
                          <td className="py-2 px-3">{c.name}</td>
                          <td className="py-2 px-3">
                            <input
                              type="checkbox"
                              checked={c.show}
                              onChange={(e) => {
                                const v = (e.target as HTMLInputElement).checked;
                                setBulletinCotisations((arr) => {
                                  const next = [...arr];
                                  next[i] = { ...next[i], show: v };
                                  return next;
                                });
                                markDirty();
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tile === 'journal' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Journal de paie</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">En-tête</h3>
                  <div className="divide-y divide-gray-200">
                    <CheckboxRow
                      label="Date de génération"
                      checked={journalHeader.dateGeneration}
                      onChange={(v) => setJournalHeader((s) => ({ ...s, dateGeneration: v }))}
                    />
                    <CheckboxRow
                      label="Heure"
                      checked={journalHeader.heure}
                      onChange={(v) => setJournalHeader((s) => ({ ...s, heure: v }))}
                    />
                    <CheckboxRow
                      label="Devise"
                      checked={journalHeader.devise}
                      onChange={(v) => setJournalHeader((s) => ({ ...s, devise: v }))}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Rubriques disponibles</h3>
                  <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr className="[&>th]:py-2 [&>th]:px-3 text-left">
                        <th>Nom de la rubrique</th>
                        <th>Type</th>
                        <th>Afficher</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {journalRubriques.map((r, i) => (
                        <tr key={r.name}>
                          <td className="py-2 px-3">{r.name}</td>
                          <td className="py-2 px-3">{r.type}</td>
                          <td className="py-2 px-3">
                            <input
                              type="checkbox"
                              checked={r.show}
                              onChange={(e) => {
                                const v = (e.target as HTMLInputElement).checked;
                                setJournalRubriques((arr) => {
                                  const next = [...arr];
                                  next[i] = { ...next[i], show: v };
                                  return next;
                                });
                                markDirty();
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tile === 'attestationSalaire' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Attestation de salaire</h2>
              <div className="divide-y divide-gray-200">
                <CheckboxRow
                  label="Nationalité du salarié"
                  checked={attestSalaire.nationalite}
                  onChange={(v) => setAttestSalaire((s) => ({ ...s, nationalite: v }))}
                />
                <CheckboxRow
                  label="Date de naissance du salarié"
                  checked={attestSalaire.naissance}
                  onChange={(v) => setAttestSalaire((s) => ({ ...s, naissance: v }))}
                />
                <CheckboxRow
                  label="Adresse du salarié"
                  checked={attestSalaire.adresse}
                  onChange={(v) => setAttestSalaire((s) => ({ ...s, adresse: v }))}
                />
                <CheckboxRow
                  label="CIN du salarié"
                  checked={attestSalaire.cin}
                  onChange={(v) => setAttestSalaire((s) => ({ ...s, cin: v }))}
                />
                <CheckboxRow
                  label="ID CNSS"
                  checked={attestSalaire.cnss}
                  onChange={(v) => setAttestSalaire((s) => ({ ...s, cnss: v }))}
                />
              </div>
            </div>
          )}

          {tile === 'attestationTravail' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Attestation de travail</h2>
              <div className="divide-y divide-gray-200">
                <CheckboxRow
                  label="Nationalité du salarié"
                  checked={attestTravail.nationalite}
                  onChange={(v) => setAttestTravail((s) => ({ ...s, nationalite: v }))}
                />
                <CheckboxRow
                  label="Date de naissance du salarié"
                  checked={attestTravail.naissance}
                  onChange={(v) => setAttestTravail((s) => ({ ...s, naissance: v }))}
                />
                <CheckboxRow
                  label="Adresse du salarié"
                  checked={attestTravail.adresse}
                  onChange={(v) => setAttestTravail((s) => ({ ...s, adresse: v }))}
                />
                <CheckboxRow
                  label="CIN du salarié"
                  checked={attestTravail.cin}
                  onChange={(v) => setAttestTravail((s) => ({ ...s, cin: v }))}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bouton Sauvegarder flottant */}
      {tile && dirty && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 font-semibold shadow-lg"
          >
            <Save className="h-5 w-5" />
            Sauvegarder
          </button>
        </div>
      )}

      {/* Toast simple */}
      {saveMsg && (
        <div className="fixed bottom-24 right-6 z-40">
          <div className="rounded-lg bg-gray-900 text-white text-sm px-4 py-2 shadow-lg">
            {saveMsg}
          </div>
        </div>
      )}
    </>
  );
}
