"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import EventForm from "@/components/EventForm";

type AccessState = "loading" | "not_connected" | "not_professional" | "allowed";

export default function AjouterEvenementPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [accessState, setAccessState] = useState<AccessState>("loading");

  useEffect(() => {
    const loadUserAndProfile = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const user = userData.user;

      console.log("USER:", user);
      console.log("USER ERROR:", userError);

      if (userError || !user) {
        setUserId(null);
        setAccessState("not_connected");
        return;
      }

      setUserId(user.id);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      console.log("USER ID:", user.id);
      console.log("PROFILE:", profile);
      console.log("PROFILE ERROR:", profileError);

      if (profileError || !profile) {
        setAccessState("not_professional");
        return;
      }

      const allowedRoles = ["professional", "admin"];

      if (!allowedRoles.includes(profile.role)) {
        setAccessState("not_professional");
        return;
      }

      setAccessState("allowed");
    };

    loadUserAndProfile();
  }, []);

  if (accessState === "loading") {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10 text-black">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-gray-700">Vérification de vos droits...</p>
        </div>
      </main>
    );
  }

  if (accessState === "not_connected") {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10 text-black">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            Connexion requise
          </h1>

          <p className="mb-6 text-gray-700">
            Vous devez être connecté avec un compte professionnel pour publier un
            événement sur CultureRadar.
          </p>

          <Link
            href="/connexion"
            className="inline-flex rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Aller à la connexion
          </Link>
        </div>
      </main>
    );
  }

  if (accessState === "not_professional") {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10 text-black">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            Accès réservé aux professionnels
          </h1>

          <p className="mb-4 text-gray-700">
            La publication d’événements est réservée aux comptes professionnels,
            comme les lieux culturels, organisateurs, associations ou structures
            partenaires.
          </p>

          <p className="mb-6 text-gray-700">
            Pour devenir professionnel, votre compte doit être vérifié puis
            validé par un administrateur.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/devenir-professionnel"
              className="inline-flex rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Demander un compte professionnel
            </Link>

            <Link
              href="/"
              className="inline-flex rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-800 transition hover:bg-gray-100"
            >
              Retour à l’accueil
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <EventForm mode="create" userId={userId} />;
}