"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import EventForm, { EventFormValues } from "@/components/EventForm";

export default function ModifierEvenementPage() {
  const params = useParams<{ id: string }>();
  const [userId, setUserId] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<EventFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [notAllowed, setNotAllowed] = useState(false);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setUserId(null);
        setNotAllowed(true);
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", Number(params.id))
        .single();

      if (error || !data) {
        setNotFoundState(true);
        setLoading(false);
        return;
      }

      if (data.created_by !== user.id) {
        setNotAllowed(true);
        setLoading(false);
        return;
      }

      setInitialValues({
        title: data.title ?? "",
        description: data.description ?? "",
        city: data.city ?? "",
        category: data.category ?? "",
        location: data.location ?? "",
        address: data.address ?? "",
        start_time: data.start_time ?? "",
        end_time: data.end_time ?? "",
        image: data.image ?? "/images/fond-a.png",
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
      });

      setLoading(false);
    };

    if (params?.id) {
      loadData();
    }
  }, [params]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10 text-black">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow">
          Chargement...
        </div>
      </main>
    );
  }

  if (notFoundState) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10 text-black">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow">
          Événement introuvable.
        </div>
      </main>
    );
  }

  if (notAllowed || !initialValues) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10 text-black">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow">
          Vous n’avez pas accès à la modification de cet événement.
        </div>
      </main>
    );
  }

  return (
    <EventForm
      mode="edit"
      eventId={Number(params.id)}
      userId={userId}
      initialValues={initialValues}
    />
  );
}