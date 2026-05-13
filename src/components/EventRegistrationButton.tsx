"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type EventRegistrationButtonProps = {
  eventId: number;
};

type RegistrationState =
  | "loading"
  | "not_connected"
  | "not_registered"
  | "registered";

export default function EventRegistrationButton({
  eventId,
}: EventRegistrationButtonProps) {
  const [state, setState] = useState<RegistrationState>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRegistration = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setState("not_connected");
        return;
      }

      setUserId(user.id);
      setUserEmail(user.email || null);

      const { data: registration, error } = await supabase
        .from("event_registrations")
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        setError(error.message);
        setState("not_registered");
        return;
      }

      if (registration) {
        setState("registered");
      } else {
        setState("not_registered");
      }
    };

    loadRegistration();
  }, [eventId]);

  const handleRegister = async () => {
    if (!userId) return;

    setActionLoading(true);
    setError("");

    const { error: insertError } = await supabase
      .from("event_registrations")
      .insert([
        {
          event_id: eventId,
          user_id: userId,
          user_email: userEmail,
        },
      ]);

    setActionLoading(false);

    if (insertError) {
      if (insertError.message.includes("duplicate")) {
        setState("registered");
        return;
      }

      setError(insertError.message);
      return;
    }

    setState("registered");
  };

  const handleCancel = async () => {
    if (!userId) return;

    setActionLoading(true);
    setError("");

    const { error: deleteError } = await supabase
      .from("event_registrations")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", userId);

    setActionLoading(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setState("not_registered");
  };

  return (
    <section className="mb-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">
      <h2 className="mb-3 text-xl font-semibold text-gray-900">
        Inscription
      </h2>

      {state === "loading" ? (
        <p className="text-sm text-gray-600">
          Vérification de votre inscription...
        </p>
      ) : null}

      {state === "not_connected" ? (
        <div>
          <p className="mb-4 text-sm text-gray-700">
            Connectez-vous pour vous inscrire à cet événement.
          </p>

          <Link
            href="/connexion"
            className="inline-flex rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Se connecter
          </Link>
        </div>
      ) : null}

      {state === "not_registered" ? (
        <div>
          <p className="mb-4 text-sm text-gray-700">
            Vous pouvez vous inscrire à cet événement pour le retrouver plus
            facilement plus tard.
          </p>

          <button
            type="button"
            onClick={handleRegister}
            disabled={actionLoading}
            className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {actionLoading ? "Inscription..." : "S’inscrire à l’événement"}
          </button>
        </div>
      ) : null}

      {state === "registered" ? (
        <div>
          <p className="mb-4 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700">
            Vous êtes inscrit à cet événement.
          </p>

          <button
            type="button"
            onClick={handleCancel}
            disabled={actionLoading}
            className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-800 transition hover:bg-gray-100 disabled:opacity-50"
          >
            {actionLoading ? "Annulation..." : "Annuler mon inscription"}
          </button>
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
    </section>
  );
}