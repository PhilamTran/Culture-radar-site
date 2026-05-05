"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ConnexionPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Compte créé. Tu peux maintenant te connecter.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push("/");
      }
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 text-black">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow">
        <h1 className="mb-6 text-3xl font-bold">
          {mode === "login" ? "Connexion" : "Créer un compte"}
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-gray-300 p-3"
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-gray-300 p-3"
          />

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          {message ? <p className="text-sm text-green-600">{message}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-black px-6 py-3 text-white"
          >
            {loading
              ? "Chargement..."
              : mode === "login"
              ? "Se connecter"
              : "Créer mon compte"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-4 text-sm text-gray-600 underline"
        >
          {mode === "login"
            ? "Je n’ai pas de compte"
            : "J’ai déjà un compte"}
        </button>
      </div>
    </main>
  );
}