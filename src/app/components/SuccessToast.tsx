// Dans : src/app/components/SuccessToast.tsx

import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import 'animate.css';

interface SuccessToastProps {
  show: boolean;
  message: string;
  onClose: () => void;
}

export function SuccessToast({ show, message, onClose }: SuccessToastProps) {
  // Cet état nous aide à gérer l'animation de sortie
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Si le toast doit être montré...
    if (show) {
      // On lance un minuteur pour le faire disparaître
      const timer = setTimeout(() => {
        setIsExiting(true); // Déclenche l'animation de sortie
        // On attend la fin de l'animation (500ms) pour vraiment le cacher
        setTimeout(onClose, 500); 
      }, 2500); // Durée de visibilité : 2.5 secondes

      // Nettoyage si le composant est retiré avant la fin
      return () => clearTimeout(timer);
    } else {
      // On s'assure de réinitialiser l'état quand il est caché
      setIsExiting(false);
    }
  }, [show, onClose]);

  // Si le toast ne doit pas être affiché, on ne rend rien
  if (!show) {
    return null;
  }

  // On choisit la classe d'animation : entrée ou sortie
  const animationClass = isExiting 
    ? 'animate__animated animate__fadeOutRight' 
    : 'animate__animated animate__slideInRight';

  return (
    <div className={`fixed top-6 right-6 z-50 ${animationClass}`}>
      <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-2xl border-l-4 border-green-500">
        <CheckCircle2 className="h-7 w-7 text-green-500 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-gray-800">Succès !</h3>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
}