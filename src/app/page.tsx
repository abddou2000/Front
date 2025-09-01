"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import Link from "next/link";
// ⬇️ Import du contexte d'auth (ajuste le chemin si besoin)
import { useAuth } from "@/context/AuthContext";

/** Slogan typewriter, effet unique (lettre par lettre) */
function TypewriterOnce({
  text,
  speed = 50,
  className = "",
}: {
  text: string;
  speed?: number;
  className?: string;
}) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (displayedText.length < text.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timeoutId);
    }
  }, [displayedText, text, speed]);

  return (
    <p
      className={`mt-2 text-4xl md:text-5xl font-semibold tracking-tight leading-tight ${className}`}
      aria-label={text}
    >
      {displayedText}
      {displayedText.length < text.length && (
        <span className="ml-1 inline-block h-6 w-[2px] bg-sky-300 animate-pulse align-baseline" />
      )}
    </p>
  );
}

export default function LoginPage() {
  const [show, setShow] = useState(false);

  // ⬇️ États formulaire + UI
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ⬇️ Récupération de la fonction login depuis le contexte
  const { login } = useAuth();

  // ✅ Nouvelle version plus intelligente
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // On tente de lire en JSON
        try {
          const data = await response.json();
          if (data.user && data.token) {
            login(data.user, data.token);
          } else {
            throw new Error("Réponse du serveur invalide après succès.");
          }
        } catch {
          // Si pas du JSON, on lit en texte brut
          const text = await response.text();
          throw new Error(text || "Réponse inattendue du serveur.");
        }
      } else {
        // Si status = 4xx/5xx
        const errorText = await response.text();
        throw new Error(
          errorText || "Le nom d'utilisateur ou le mot de passe est incorrect."
        );
      }
    } catch (err: any) {
      setError(err.message || "Une erreur inattendue s’est produite.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main
      className="relative min-h-screen grid lg:grid-cols-[46%_54%] overflow-hidden text-slate-100 bg-[#061229]
      [background-image:radial-gradient(900px_700px_at_15%_20%,#0b1f3a_0%,transparent_60%),radial-gradient(900px_700px_at_85%_25%,#0a2250_0%,transparent_65%)]"
    >
      {/* grain / texture douce */}
      <div className="pointer-events-none absolute inset-0 opacity-[.06] mix-blend-soft-light [background:radial-gradient(1px_1px_at_10px_10px,#fff_50%,transparent_51%)] [background-size:12px_12px]" />
      {/* orbes lumineuses */}
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-32 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-blue-700/20 blur-3xl" />

      {/* Colonne gauche : marque */}
      <section className="hidden lg:flex items-center justify-center p-10">
        <div className="max-w-md">
          {/* Logo placeholder */}
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600/20 ring-1 ring-sky-400/30">
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7 text-sky-400"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M4 6a2 2 0 0 1 2-2h6v4H8v8H4V6zm10-2h4a2 2 0 0 1 2 2v4h-4V8h-2V4zM8 14h4v4H8v-4zm10-2h2v6a2 2 0 0 1-2 2h-6v-4h4v-4z" />
            </svg>
          </div>

          {/* Slogan avec effet machine à écrire unique */}
          <TypewriterOnce text="Innovex, la plateforme RH marocaine qui centralise vos processus." />
        </div>
      </section>

      {/* Colonne droite : carte login */}
      <section className="flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="rounded-[24px] p-[1px] bg-gradient-to-br from-white/15 via-sky-300/25 to-cyan-300/25 drop-shadow-[0_25px_80px_rgba(3,10,26,.65)]">
            <div className="rounded-[23px] bg-[#0b1f3a]/45 backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,.08)]">
              <div className="p-7 md:p-10">
                <h2 className="relative mx-auto w-fit text-center text-4xl md:text-5xl font-bold tracking-tight text-slate-50">
                  <span
                    className="absolute -top-4 left-1/2 h-[3px] w-24 -translate-x-1/2 rounded-full
                                   bg-gradient-to-r from-sky-400 to-cyan-300 shadow-[0_0_18px_rgba(56,189,248,.55)]"
                  />
                  Connexion
                </h2>

                <form onSubmit={onSubmit} className="space-y-4" noValidate>
                  {/* Erreur API */}
                  {error && (
                    <div className="p-3 text-center text-sm text-red-300 bg-red-900/40 border border-red-500/30 rounded-lg">
                      {error}
                    </div>
                  )}

                  {/* Username (l’API attend 'username') */}
                  <div className="relative">
                    <input
                      id="username"
                      type="text"
                      placeholder=" "
                      required
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="peer h-12 w-full rounded-2xl bg-[#0c203e]/60 border border-sky-300/25 px-4 text-sm text-slate-100
                                 placeholder-transparent outline-none focus:ring-2 focus:ring-sky-400
                                 focus:border-sky-400/40 focus:ring-offset-1 focus:ring-offset-[#0b1f3a]"
                    />
                    <label
                      htmlFor="username"
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm transition-all
                                 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm
                                 peer-focus:top-2 peer-focus:text-xs peer-focus:text-sky-200"
                    >
                      Nom d’utilisateur
                    </label>
                  </div>

                  {/* Mot de passe */}
                  <div className="relative">
                    <input
                      id="password"
                      type={show ? "text" : "password"}
                      placeholder=" "
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="peer h-12 w-full rounded-2xl bg-[#0c203e]/60 border border-sky-300/25 px-4 pr-10 text-sm text-slate-100
                                 placeholder-transparent outline-none focus:ring-2 focus:ring-sky-400
                                 focus:border-sky-400/40 focus:ring-offset-1 focus:ring-offset-[#0b1f3a]"
                    />
                    <label
                      htmlFor="password"
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm transition-all
                                 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm
                                 peer-focus:top-2 peer-focus:text-xs peer-focus:text-sky-200"
                    >
                      Mot de passe
                    </label>
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      className="absolute inset-y-0 right-0 px-3 text-slate-300 hover:text-white"
                    >
                      {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  {/* Se souvenir de moi + Mot de passe oublié */}
                  <div className="flex items-center justify-between text-sm pt-2">
                    <label className="flex items-center gap-2 text-sky-200/80 select-none cursor-pointer">
                      <input type="checkbox" className="size-4 accent-sky-600" />
                      Se souvenir de moi
                    </label>
                    <Link
                      href="/mot-de-passe-oublie"
                      className="text-sky-300 hover:text-sky-100 hover:underline"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>

                  {/* CTA */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative h-12 w-full flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#22D3EE]
                               text-slate-900 font-semibold shadow-[0_10px_35px_rgba(34,211,238,.35)]
                               transition-all disabled:opacity-70 disabled:cursor-not-allowed
                               before:content-[''] before:absolute before:inset-0 before:rounded-2xl
                               before:bg-[linear-gradient(180deg,rgba(255,255,255,.25),transparent_45%)] before:opacity-0
                               hover:before:opacity-100 hover:shadow-[0_16px_50px_rgba(34,211,238,.45)]"
                  >
                    {isLoading ? (
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                    ) : (
                      "Se connecter"
                    )}
                  </button>

                  {/* Socials */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      className="h-12 w-full rounded-2xl border border-white/12 bg-white/[.06] hover:bg-white/[.12]
                                 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,.06)]"
                    >
                      <span className="inline-flex items-center gap-3 font-medium">
                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-[3px] bg-white text-[10px] font-bold text-slate-900">
                          G
                        </span>
                        Se connecter avec Google
                      </span>
                    </button>
                  </div>

                  {/* Footer de carte */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
                    <a href="#" className="hover:underline">
                      Mentions légales
                    </a>
                    <button type="button" className="inline-flex items-center gap-1 hover:underline">
                      FR ▸
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
