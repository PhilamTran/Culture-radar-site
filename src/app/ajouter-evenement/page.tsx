"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import EventForm from "@/components/EventForm";

export default function AjouterEvenementPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    };

    loadUser();
  }, []);

  return <EventForm mode="create" userId={userId} />;
}