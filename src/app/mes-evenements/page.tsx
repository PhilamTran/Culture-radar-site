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

type RegistrationItem = {
  id: number;
  event_id: number;
  user_id: string;
  user_email: string | null;
  created_at: string | null;
  events: EventItem | null;
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

function getEventTime(event: EventItem) {
  if (!event.start_time) return Number.MAX_SAFE_INTEGER;
  return new Date(event.start_time).getTime();
}

function isPastEvent(event: EventItem) {
  if (!event.start_time) return false;
  return new Date(event.start_time).getTime() < Date.now();
}

export default function MesEvenementsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [publishedEvents, setPublishedEvents] = useState<EventItem[]>([]);
  const [upcomingRegistrations, setUpcomingRegistrations] = useState<
    RegistrationItem[]
  >([]);
  const [pastRegistrations, setPastRegistrations] = useState<
    RegistrationItem[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [cancelingRegistrationId, setCancelingRegistrationId] = useState<
    number | null
  >(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setError("");

      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!isMounted) return;

      if (!user) {
        setUserId(null);
        setPublishedEvents([]);
        setUpcomingRegistrations([]);
        setPastRegistrations([]);
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (eventsError) {
        setError(eventsError.message);
      } else {
        setPublishedEvents(eventsData || []);
      }

      const { data: registrationsData, error: registrationsError } =
        await supabase
          .from("event_registrations")
          .select(
            `
            id,
            event_id,
            user_id,
            user_email,
            created_at,
            events (*)
          `
          )
          .eq("user_id", user.id);

      if (!isMounted) return;

      if (registrationsError) {
        setError(registrationsError.message);
      } else {
        const registrations = (registrationsData || []).map((registration) => ({
        ...registration,
        events: Array.isArray(registration.events)
          ? registration.events[0] ?? null
          : registration.events,
      })) as RegistrationItem[];

        const upcoming = registrations
          .filter((registration) => {
            if (!registration.events) return false;
            return !isPastEvent(registration.events);
          })
          .sort((a, b) => {
            if (!a.events || !b.events) return 0;
            return getEventTime(a.events) - getEventTime(b.events);
          });

        const past = registrations
          .filter((registration) => {
            if (!registration.events) return false;
            return isPastEvent(registration.events);
          })
          .sort((a, b) => {
            if (!a.events || !b.events) return 0;
            return getEventTime(b.events) - getEventTime(a.events);
          });

        setUpcomingRegistrations(upcoming);
        setPastRegistrations(past);
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
    setError("");

    const { error } = await supabase.from("events").delete().eq("id", id);

    setDeletingId(null);

    if (error) {
      setError(error.message);
      return;
    }

    setPublishedEvents((prev) => prev.filter((event) => event.id !== id));
  };

  const handleCancelRegistration = async (registrationId: number) => {
    const confirmed = window.confirm(
      "Annuler votre inscription à cet événement ?"
    );

    if (!confirmed) return;

    setCancelingRegistrationId(registrationId);
    setError("");

    const { error } = await supabase
      .from("event_registrations")
      .delete()
      .eq("id", registrationId);

    setCancelingRegistrationId(null);

    if (error) {
      setError(error.message);
      return;
    }

    setUpcomingRegistrations((prev) =>
      prev.filter((registration) => registration.id !== registrationId)
    );
    setPastRegistrations((prev) =>
      prev.filter((registration) => registration.id !== registrationId)
    );
  };

  const renderEventCard = ({
    event,
    children,
  }: {
    event: EventItem;
    children?: React.ReactNode;
  }) => {
    return (
      <article
        key={event.id}
        className="overflow-hidden rounded-3xl bg-white shadow"
      >
        <img
          src={event.image || "/images/fond-a.png"}
          alt={event.title}
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

          <h2 className="text-lg font-bold">{event.title}</h2>

          <p className="text-sm text-gray-600">
            {formatEventDate(event.start_time)}
          </p>

          <p className="text-sm text-gray-600">
            {event.location || event.address || "Lieu à confirmer"}
          </p>

          <p className="mt-2 text-sm text-gray-700">
            {event.description || "Aucune description"}
          </p>

          {children}
        </div>
      </article>
    );
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
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="mb-4 text-3xl font-bold">Connexion requise</h1>
          <p className="mb-6 text-gray-700">
            Connecte-toi pour voir tes événements et tes inscriptions.
          </p>
          <Link
            href="/connexion"
            className="inline-flex rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Connexion
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 text-black">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow">
          <h1 className="mb-2 text-3xl font-bold">Mes événements</h1>
          <p className="text-gray-600">
            Retrouvez ici vos événements publiés, vos inscriptions à venir et
            votre historique.
          </p>
        </div>

        {error ? <p className="mb-4 text-red-500">{error}</p> : null}

        <section className="mb-12">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">
              Événements publiés
            </h2>
            <p className="text-sm text-gray-600">
              Les événements que vous avez créés sur CultureRadar.
            </p>
          </div>

          {publishedEvents.length === 0 ? (
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-gray-600">Aucun événement publié.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {publishedEvents.map((event) =>
                renderEventCard({
                  event,
                  children: (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href={`/event/${event.id}`}
                        className="min-w-[90px] flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-800"
                      >
                        Voir
                      </Link>

                      <Link
                        href={`/modifier-evenement/${event.id}`}
                        className="min-w-[110px] flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-800"
                      >
                        Modifier
                      </Link>

                      <button
                        onClick={() => handleDelete(event.id)}
                        disabled={deletingId === event.id}
                        className="min-w-[110px] flex-1 rounded-xl bg-red-600 px-4 py-2 text-center text-sm font-medium text-white disabled:opacity-50"
                      >
                        {deletingId === event.id ? "..." : "Supprimer"}
                      </button>
                    </div>
                  ),
                })
              )}
            </div>
          )}
        </section>

        <section className="mb-12">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">
              Mes inscriptions à venir
            </h2>
            <p className="text-sm text-gray-600">
              Les événements auxquels vous êtes inscrit, classés par date la plus
              proche.
            </p>
          </div>

          {upcomingRegistrations.length === 0 ? (
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-gray-600">
                Vous n’êtes inscrit à aucun événement à venir.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {upcomingRegistrations.map((registration) => {
                if (!registration.events) return null;

                return renderEventCard({
                  event: registration.events,
                  children: (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        href={`/event/${registration.events.id}`}
                        className="min-w-[90px] flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-800"
                      >
                        Voir
                      </Link>

                      <button
                        onClick={() =>
                          handleCancelRegistration(registration.id)
                        }
                        disabled={cancelingRegistrationId === registration.id}
                        className="min-w-[140px] flex-1 rounded-xl bg-red-600 px-4 py-2 text-center text-sm font-medium text-white disabled:opacity-50"
                      >
                        {cancelingRegistrationId === registration.id
                          ? "..."
                          : "Annuler l’inscription"}
                      </button>
                    </div>
                  ),
                });
              })}
            </div>
          )}
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">
              Historique des inscriptions
            </h2>
            <p className="text-sm text-gray-600">
              Les événements passés auxquels vous étiez inscrit.
            </p>
          </div>

          {pastRegistrations.length === 0 ? (
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-gray-600">
                Aucun événement passé dans votre historique.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 opacity-80">
              {pastRegistrations.map((registration) => {
                if (!registration.events) return null;

                return renderEventCard({
                  event: registration.events,
                  children: (
                    <div className="mt-4">
                      <Link
                        href={`/event/${registration.events.id}`}
                        className="inline-flex rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800"
                      >
                        Voir
                      </Link>
                    </div>
                  ),
                });
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}