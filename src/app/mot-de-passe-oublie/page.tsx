// Dans : src/app/mot-de-passe-oublie/page.tsx
"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Plus tard, vous enverrez l'email à votre API ici.
    // Pour l'instant, on redirige vers la page de confirmation.
    router.push("/confirmation");
  }

  return (
    // On réutilise le même fond magnifique que la page de login
    <main
      className="relative min-h-screen flex items-center justify-center p-4 bg-[#061229]
      [background-image:radial-gradient(900px_700px_at_15%_20%,#0b1f3a_0%,transparent_60%),radial-gradient(900px_700px_at_85%_25%,#0a2250_0%,transparent_65%)]"
    >
      {/* On peut remettre les décorations visuelles */}
      <div className="pointer-events-none absolute inset-0 opacity-[.06] mix-blend-soft-light [background:radial-gradient(1px_1px_at_10px_10px,#fff_50%,transparent_51%)] [background-size:12px_12px]" />
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-32 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-blue-700/20 blur-3xl" />

      {/* La carte centrale */}
      <div className="w-full max-w-md animate__animated animate__fadeIn">
        <div className="rounded-[24px] p-[1px] bg-gradient-to-br from-white/15 via-sky-300/25 to-cyan-300/25 drop-shadow-[0_25px_80px_rgba(3,10,26,.65)]">
          <div className="rounded-[23px] bg-[#0b1f3a]/45 backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,.08)]">
            <div className="p-7 md:p-10">

              <Link href="/" className="inline-flex items-center gap-2 text-sky-300 hover:text-sky-100 mb-6 text-sm">
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>

              <h2 className="text-3xl font-bold tracking-tight text-slate-50">Récupérer le compte</h2>
              <p className="text-slate-400 mt-2 text-sm">
                Entrez l'adresse e-mail associée à votre compte pour recevoir les instructions.
              </p>

              <form onSubmit={onSubmit} className="space-y-6 mt-8">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-sky-200/80 mb-1">
                    Adresse e-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="h-12 w-full rounded-2xl bg-[#0c203e]/60 border border-sky-300/25 px-4 text-sm text-slate-100 placeholder-transparent outline-none shadow-inner/10 focus:ring-2 focus:ring-sky-400"
                  />
                </div>
                
                <button
                  type="submit"
                  className="relative h-12 w-full rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#22D3EE] text-slate-900 font-semibold shadow-[0_10px_35px_rgba(34,211,238,.35)]"
                >
                  Envoyer les instructions
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}