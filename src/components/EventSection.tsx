"use client";

import { useEffect, useState } from "react";
import EventCard from "./EventCard";
import { supabase } from "@/lib/supabaseClient";

type EventSectionProps = {
  title: string;
  variant?: "newest" | "upcoming" | "default";
};

type SupabaseEvent = {
  id: number;
  title: string;
  city: string;
  category: string;
  image: string | null;
  location: string | null;
  description: string | null;
  start_time: string | null;
  created_at: string | null;
};

function formatEventDate(startTime: string | null) {
  if (!startTime) return "Date à venir";

  return new Date(startTime).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function EventSection({
  title,
  variant = "default",
}: EventSectionProps) {
  const [events, setEvents] = useState<SupabaseEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      let query = supabase.from("events").select("*");

      if (variant === "newest") {
        query = query.order("created_at", { ascending: false });
      } else if (variant === "upcoming") {
        query = query
          .gte("start_time", new Date().toISOString())
          .order("start_time", { ascending: true });
      } else {
        query = query.order("start_time", { ascending: true });
      }

      const { data, error } = await query.limit(10);

      if (error) {
        console.error(`Erreur Supabase EventSection (${variant}) :`, error);
      } else {
        setEvents(data || []);
      }

      setLoading(false);
    };

    fetchEvents();
  }, [variant]);

  return (
    <section className="px-6 py-8">
      <div className="mx-auto max-w-[1600px] rounded-3xl bg-gray-100 px-6 py-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-black">{title}</h2>

        <div
          className="overflow-x-auto scrollbar-hide overscroll-contain"
          onWheelCapture={(e) => {
            const container = e.currentTarget;

            const canScrollLeft = container.scrollLeft > 0;
            const canScrollRight =
              container.scrollLeft + container.clientWidth < container.scrollWidth;

            const canScroll =
              (e.deltaY < 0 && canScrollLeft) ||
              (e.deltaY > 0 && canScrollRight);

            if (canScroll) {
              e.preventDefault();
              container.scrollLeft += e.deltaY;
            }
          }}
        >
          <div className="flex w-max gap-6 pb-2 snap-x snap-mandatory">
            {loading ? (
              <p className="text-gray-600">Chargement des événements...</p>
            ) : events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className="w-[240px] flex-shrink-0 snap-start">
                  <EventCard
                    id={event.id}
                    title={event.title}
                    city={event.city}
                    date={formatEventDate(event.start_time)}
                    image={event.image || "/images/fond-a.png"}
                    location={event.location || undefined}
                    category={event.category}
                    description={event.description || undefined}
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-600">Aucun événement disponible.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}