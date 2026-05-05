"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Hero() {
  const [totalEvents, setTotalEvents] = useState(0);
  const [weekEvents, setWeekEvents] = useState(0);
  const [users, setUsers] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      // TOTAL EVENTS
      const { count: total } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true });

      // EVENTS CETTE SEMAINE
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);

      const { count: week } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfWeek.toISOString());

      // UTILISATEURS (approximation via events)
      const { data: usersData } = await supabase
        .from("events")
        .select("created_by");

      const uniqueUsers = new Set(
        (usersData || []).map((u) => u.created_by)
      );

      setTotalEvents(total || 0);
      setWeekEvents(week || 0);
      setUsers(uniqueUsers.size || 0);
    };

    loadStats();
  }, []);

  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden md:min-h-[88vh]">

      {/* Background loop */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="hero-track flex h-full w-[200%]">

          <div
            className="h-full w-full flex-shrink-0"
            style={{
              backgroundImage: "url('/images/fond-hero-loop.png')",
              backgroundSize: "auto 100%",
              backgroundPosition: "left center",
              backgroundRepeat: "repeat-x",
            }}
          />

          <div
            className="h-full w-full flex-shrink-0"
            style={{
              backgroundImage: "url('/images/fond-hero-loop.png')",
              backgroundSize: "auto 100%",
              backgroundPosition: "left center",
              backgroundRepeat: "repeat-x",
            }}
          />

        </div>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-black/20" />

      {/* Content */}
      <div className="relative z-10 flex min-h-[80vh] items-center justify-center px-4 pb-28 md:min-h-[88vh] md:pb-20">
        <div className="text-center text-white">
          <h1 className="mb-4 text-5xl font-bold md:text-6xl">
            CultureRadar
          </h1>

          <p className="mx-auto max-w-2xl text-lg md:text-xl leading-relaxed">
            CultureRadar vous permet de découvrir facilement les événements autour de vous : concerts, expositions, sorties entre amis et bien plus encore. Explorez, partagez et créez vos propres expériences en quelques clics.
          </p>
        </div>
      </div>

      {/* KPI */}
      <div className="absolute bottom-6 left-1/2 z-10 flex w-full max-w-[1200px] -translate-x-1/2 flex-wrap justify-center gap-4 px-6">

        <div className="min-w-[220px] rounded-xl bg-white/20 px-6 py-3 text-center text-white backdrop-blur-md">
          <p className="text-2xl font-bold">{totalEvents}</p>
          <p className="text-sm">Événements publiés</p>
        </div>

        <div className="min-w-[220px] rounded-xl bg-white/20 px-6 py-3 text-center text-white backdrop-blur-md">
          <p className="text-2xl font-bold">{weekEvents}</p>
          <p className="text-sm">Cette semaine</p>
        </div>

        <div className="min-w-[220px] rounded-xl bg-white/20 px-6 py-3 text-center text-white backdrop-blur-md">
          <p className="text-2xl font-bold">{users}</p>
          <p className="text-sm">Utilisateurs actifs</p>
        </div>

      </div>

    </section>
  );
}