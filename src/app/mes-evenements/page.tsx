"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type EventItem = {
  id: number;
  title: string;
  city: string;
  category: string;
  image: string | null;
  location: string | null;
  address: string | null;
  description: string | null;
  start_time: string | null;
  created_at: string | null;
  created_by: string | null;
};

function formatEventDate(startTime: string | null) {
  if (!startTime) return "Date à venir";

  return new Date(startTime).toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MesEvenementsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!isMounted) return;

      if (!user) {
        setUserId(null);
        setEvents([]);
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        setError(error.message);
      } else {
        setEvents(data || []);
      }

      setLoading(false);
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Supprimer cet événement ? Cette action est irréversible."
    );

    if (!confirmed) return;

    setDeletingId(id);

    const { error } = await supabase.from("events").delete().eq("id", id);

    setDeletingId(null);

    if (error) {
      setError(error.message);
      return;
    }

    setEvents((prev) => prev.filter((event) => event.id !== id));
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10 text-black">
        <p>Chargement...</p>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10 text-black">
        <p>Connecte-toi pour voir tes événements</p>
        <Link href="/connexion">Connexion</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 text-black">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8 rounded-3xl bg-white p-8 shadow">
          <h1 className="mb-2 text-3xl font-bold">Mes événements</h1>
          <p className="text-gray-600">
            Retrouvez ici tous les événements que vous avez publiés.
          </p>
        </div>

        {error && (
          <p className="mb-4 text-red-500">{error}</p>
        )}

        {events.length === 0 ? (
          <p>Aucun événement</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <article
                key={event.id}
                className="overflow-hidden rounded-3xl bg-white shadow"
              >
                <img
                  src={event.image || "/images/fond-a.png"}
                  className="h-52 w-full object-cover"
                />

                <div className="p-5">

                  <div className="mb-3 flex gap-2">
                    <span className="rounded-full bg-black px-3 py-1 text-xs text-white">
                      {event.category}
                    </span>
                    <span className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-700">
                      {event.city}
                    </span>
                  </div>

                  <h2 className="font-bold text-lg">{event.title}</h2>

                  <p className="text-sm text-gray-600">
                    {formatEventDate(event.start_time)}
                  </p>

                  <p className="text-sm text-gray-600">
                    {event.location || event.address || "Lieu à confirmer"}
                  </p>

                  <p className="mt-2 text-sm text-gray-700">
                    {event.description || "Aucune description"}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">

                    <Link
                      href={`/event/${event.id}`}
                      className="flex-1 min-w-[90px] text-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800"
                    >
                      Voir
                    </Link>

                    <Link
                      href={`/modifier-evenement/${event.id}`}
                      className="flex-1 min-w-[110px] text-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800"
                    >
                      Modifier
                    </Link>

                    <button
                      onClick={() => handleDelete(event.id)}
                      disabled={deletingId === event.id}
                      className="flex-1 min-w-[110px] text-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {deletingId === event.id ? "..." : "Supprimer"}
                    </button>

                  </div>

                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}