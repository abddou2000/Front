// Dans : src/app/mot-de-passe-oublie/confirmation/page.tsx
import { MailCheck } from "lucide-react";
import Link from "next/link";
import 'animate.css'; // Pour l'animation d'entrée

export default function ConfirmationPage() {
  return (
    // On garde le même fond et la même structure pour une transition fluide
    <main
      className="relative min-h-screen flex items-center justify-center p-4 bg-[#061229]
      [background-image:radial-gradient(900px_700px_at_15%_20%,#0b1f3a_0%,transparent_60%),radial-gradient(900px_700px_at_85%_25%,#0a2250_0%,transparent_65%)]"
    >
      {/* Orbes lumineuses et texture de fond */}
      <div className="pointer-events-none absolute inset-0 opacity-[.06] mix-blend-soft-light [background:radial-gradient(1px_1px_at_10px_10px,#fff_50%,transparent_51%)] [background-size:12px_12px]" />
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-32 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-blue-700/20 blur-3xl" />

      {/* Carte de confirmation */}
      <div className="w-full max-w-md text-center animate__animated animate__fadeIn">
        <div className="rounded-[24px] p-[1px] bg-gradient-to-br from-white/15 via-sky-300/25 to-cyan-300/25 drop-shadow-[0_25px_80px_rgba(3,10,26,.65)]">
          <div className="rounded-[23px] bg-[#0b1f3a]/45 backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,.08)]">
            <div className="p-7 md:p-10">

              {/* Icône de succès */}
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-[#3B82F6] to-[#22D3EE] mb-6">
                  <MailCheck className="h-8 w-8 text-white"/>
              </div>

              <h2 className="text-3xl font-bold text-slate-50">Vérifiez vos e-mails</h2>
              <p className="text-slate-400 mt-3 text-sm leading-relaxed">
                Un lien pour réinitialiser votre mot de passe vient de vous être envoyé.
                <br />
                Pensez à vérifier votre dossier de courriers indésirables (spam).
              </p>
              
              <Link href="/" className="mt-8 inline-block text-sky-300 hover:text-sky-100 text-sm font-medium transition-colors">
                Retourner à la connexion
              </Link>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}