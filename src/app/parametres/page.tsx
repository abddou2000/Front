// Dans : src/app/parametres/page.tsx
"use client";

import { useState } from "react";
import { Save, LoaderCircle, Check, X } from "lucide-react";
import { SuccessToast } from '../components/SuccessToast';
import 'animate.css';

// --- Composant réutilisable (inchangé) ---
function SettingRow({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row items-start justify-between gap-4 border-b border-gray-100 py-6 transition-colors hover:bg-gray-50/50 -mx-6 px-6 first:pt-0">
      <div className="w-full md:w-1/3">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="w-full md:w-1/2">
        {children}
      </div>
    </div>
  );
}

// --- La page principale ---
export default function SettingsPage() {
  const [toast, setToast] = useState({ show: false, message: "" });
  const [isSaving, setIsSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    timezone: "GMT+1",
    dateFormat: "JJ/MM/AAAA",
    timeFormat: "24h", // J'ai ajouté ce champ manquant dans l'état initial
    systemEmail: "notifications@innovex.ma",
    notificationMessage: "", // Assurez-vous que tous les champs contrôlés ont une valeur initiale
    enableSystemNotifications: true,
  });
  
  // ==========================================================
  // CORRECTION PRINCIPALE : Une fonction unique pour gérer les changements
  // ==========================================================
  const handleChange = (field: keyof typeof settings, value: string | boolean) => {
    setSettings(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    console.log("Paramètres sauvegardés :", settings);

    setTimeout(() => {
      setIsSaving(false);
      setToast({ show: true, message: "Vos paramètres ont été enregistrés." });
    }, 1500);
  };

  return (
    <>
      <div className="p-6 md:p-10">
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 animate__animated animate__fadeInDown">
          <h1 className="text-3xl font-bold text-gray-800">
            Paramètres du système
          </h1>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 w-52 h-[42px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-colors disabled:bg-blue-400 disabled:cursor-wait"
          >
            {isSaving ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Enregistrer</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm animate__animated animate__fadeInUp" style={{animationDelay: '100ms'}}>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800">Général</h2>
            <p className="text-sm text-gray-500 mt-1">
              Configurez les paramètres globaux de l'application.
            </p>

            <div className="mt-2">
              <SettingRow title="Fuseau horaire" description="Définit le fuseau horaire du système.">
                <select 
                  className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800"
                  value={settings.timezone} 
                  onChange={(e) => handleChange('timezone', e.target.value)}
                >
                  <option>GMT+1</option>
                  <option>GMT+0 (UTC)</option>
                </select>
              </SettingRow>

              <SettingRow title="Format de date" description="Choisissez comment les dates sont affichées.">
                <select 
                  className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800"
                  value={settings.dateFormat} 
                  onChange={(e) => handleChange('dateFormat', e.target.value)}
                >
                  <option>JJ/MM/AAAA</option>
                  <option>JJ.MM.AAAA</option>
                </select>
              </SettingRow>

              {/* J'ai enlevé les champs supplémentaires qui n'étaient pas dans votre "useState" pour éviter les erreurs */}

            </div>
            
            <h2 className="text-xl font-semibold text-gray-800 mt-10">Notifications</h2>
            <p className="text-sm text-gray-500 mt-1">
              Gérez les alertes et les communications du système.
            </p>

            <div className="mt-2">
              <SettingRow title="Adresse email système" description="L'email utilisé pour envoyer les notifications.">
                <input 
                  type="email" 
                  className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800"
                  value={settings.systemEmail}
                  onChange={(e) => handleChange('systemEmail', e.target.value)}
                />
              </SettingRow>

               <SettingRow title="Notification interne" description="Message affiché à tous les utilisateurs.">
                <input 
                  type="text" 
                  className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800"
                  value={settings.notificationMessage}
                  onChange={(e) => handleChange('notificationMessage', e.target.value)}
                />
              </SettingRow>

              <SettingRow title="Activer notifications système" description="Emails automatiques et alertes.">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="peer sr-only" 
                      checked={settings.enableSystemNotifications}
                      onChange={(e) => handleChange('enableSystemNotifications', e.target.checked)}
                    />
                    <div className="h-6 w-11 rounded-full bg-red-400 peer-checked:bg-green-500 transition-colors"></div>
                    <div className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5 flex items-center justify-center">
                      {settings.enableSystemNotifications ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <X className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                  </label>
              </SettingRow>
            </div>
          </div>
        </div>
      </div>

      <SuccessToast
        show={toast.show}
        message={toast.message}
        onClose={() => setToast({ show: false, message: "" })}
      />
    </>
  );
}