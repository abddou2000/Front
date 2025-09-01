"use client";
import React, { useState } from "react";
import { FileText } from "lucide-react";
// Sidebar handled by layout.tsx

// Sidebar handled by layout.tsx


export default function Page() {
  const [tile, setTile] = useState<null | 'bulletin' | 'journal' | 'attestationSalaire' | 'attestationTravail'>(null);

  const Tile = ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button onClick={onClick} className="flex items-center gap-3 p-5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 shadow-sm text-left">
      <FileText className="h-6 w-6 text-gray-600" />
      <span className="font-semibold text-gray-800">{label}</span>
    </button>
  );

  const CheckboxRow = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="flex items-center justify-between py-2">
      <span className="text-gray-700">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange((e.target as HTMLInputElement).checked)} />
    </label>
  );

  return (
    <>
      <div className="p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Paramétrage des états</h1>
          </div>

          {!tile && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Tile label="Bulletin de paie" onClick={() => setTile('bulletin')} />
              <Tile label="Journal de paie" onClick={() => setTile('journal')} />
              <Tile label="Attestation de salaire" onClick={() => setTile('attestationSalaire')} />
              <Tile label="Attestation de travail" onClick={() => setTile('attestationTravail')} />
            </div>
          )}

          {tile === 'bulletin' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Bulletin de paie</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Informations société & salarié</h3>
                  <div className="divide-y divide-gray-200">
                    <CheckboxRow label="Numéro CNSS société" checked={true} onChange={() => {}} />
                    <CheckboxRow label="ID Fiscal société" checked={true} onChange={() => {}} />
                    <CheckboxRow label="Numéro ICE société" checked={true} onChange={() => {}} />
                    <CheckboxRow label="Numéro CNSS employé" checked={true} onChange={() => {}} />
                    <CheckboxRow label="Numéro CIMR employé" checked={true} onChange={() => {}} />
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
                      {['Salaire de base','Primes','CNSS'].map((r, i) => (
                        <tr key={i}>
                          <td className="py-2 px-3">{r}</td>
                          <td className="py-2 px-3">{r === 'CNSS' ? 'Retenue' : 'Gain'}</td>
                          <td className="py-2 px-3"><input type="checkbox" defaultChecked /></td>
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
                      {['CNSS','CIMR','AMO'].map((c, i) => (
                        <tr key={i}>
                          <td className="py-2 px-3">{c}</td>
                          <td className="py-2 px-3"><input type="checkbox" defaultChecked /></td>
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
                    <CheckboxRow label="Date de génération" checked={true} onChange={() => {}} />
                    <CheckboxRow label="Heure" checked={true} onChange={() => {}} />
                    <CheckboxRow label="Devise" checked={true} onChange={() => {}} />
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
                      {['Salaire de base','Primes','CNSS'].map((r, i) => (
                        <tr key={i}>
                          <td className="py-2 px-3">{r}</td>
                          <td className="py-2 px-3">{r === 'CNSS' ? 'Retenue' : 'Gain'}</td>
                          <td className="py-2 px-3"><input type="checkbox" defaultChecked /></td>
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
                <CheckboxRow label="Nationalité du salarié" checked={true} onChange={() => {}} />
                <CheckboxRow label="Date de naissance du salarié" checked={true} onChange={() => {}} />
                <CheckboxRow label="Adresse du salarié" checked={true} onChange={() => {}} />
                <CheckboxRow label="CIN du salarié" checked={true} onChange={() => {}} />
                <CheckboxRow label="ID CNSS" checked={true} onChange={() => {}} />
              </div>
            </div>
          )}

          {tile === 'attestationTravail' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Attestation de travail</h2>
              <div className="divide-y divide-gray-200">
                <CheckboxRow label="Nationalité du salarié" checked={true} onChange={() => {}} />
                <CheckboxRow label="Date de naissance du salarié" checked={true} onChange={() => {}} />
                <CheckboxRow label="Adresse du salarié" checked={true} onChange={() => {}} />
                <CheckboxRow label="CIN du salarié" checked={true} onChange={() => {}} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}



