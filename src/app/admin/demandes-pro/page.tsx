"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type ProfessionalRequest = {
  id: number;
  user_id: string;
  account_email: string;
  professional_email: string;
  organization_name: string | null;
  websites: string | null;
  social_links: string | null;
  organization_contact: string | null;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
};

type AccessState = "loading" | "not_connected" | "not_admin" | "allowed";

export default function AdminDemandesProPage() {
  const [accessState, setAccessState] = useState<AccessState>("loading");
  const [adminId, setAdminId] = useState<string | null>(null);
  const [requests, setRequests] = useState<ProfessionalRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadRequests = async () => {
    setLoadingRequests(true);
    setError("");

    const { data, error } = await supabase
      .from("professional_requests")
      .select("*")
      .order("created_at", { ascending: false });

    setLoadingRequests(false);

    if (error) {
      setError(error.message);
      return;
    }

    setRequests(data || []);
  };

  useEffect(() => {
    const loadAdmin = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        setAccessState("not_connected");
        return;
      }

      setAdminId(user.id);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || !profile || profile.role !== "admin") {
        setAccessState("not_admin");
        return;
      }

      setAccessState("allowed");
      loadRequests();
    };

    loadAdmin();
  }, []);

  const approveRequest = async (request: ProfessionalRequest) => {
    if (!adminId) return;

    setActionLoadingId(request.id);
    setError("");

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "professional" })
      .eq("id", request.user_id);

    if (profileError) {
      setError(profileError.message);
      setActionLoadingId(null);
      return;
    }

    const { error: requestError } = await supabase
      .from("professional_requests")
      .update({
        status: "approved",
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", request.id);

    setActionLoadingId(null);

    if (requestError) {
      setError(requestError.message);
      return;
    }

    loadRequests();
  };

  const rejectRequest = async (request: ProfessionalRequest) => {
    if (!adminId) return;

    setActionLoadingId(request.id);
    setError("");

    const { error } = await supabase
      .from("professional_requests")
      .update({
        status: "rejected",
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", request.id);

    setActionLoadingId(null);

    if (error) {
      setError(error.message);
      return;
    }

    loadRequests();
  };

  if (accessState === "loading") {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10 text-black">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-sm">
          Vérification des droits admin...
        </div>
      </main>
    );
  }

  if (accessState === "not_connected") {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10 text-black">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-sm">
          Vous devez être connecté en tant qu’administrateur.
        </div>
      </main>
    );
  }

  if (accessState === "not_admin") {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10 text-black">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-sm">
          Accès réservé aux administrateurs.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 text-black">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Demandes de comptes professionnels
          </h1>
          <p className="text-gray-600">
            Vérifiez les demandes puis acceptez ou refusez le passage en compte professionnel.
          </p>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loadingRequests ? (
          <p>Chargement des demandes...</p>
        ) : requests.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            Aucune demande pour le moment.
          </div>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => (
              <article
                key={request.id}
                className="rounded-3xl bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {request.organization_name || "Organisation non renseignée"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Demande envoyée le{" "}
                      {new Date(request.created_at).toLocaleString("fr-FR")}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                      request.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : request.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {request.status}
                  </span>
                </div>

                <div className="grid gap-3 text-sm text-gray-700">
                  <p>
                    <strong>Email du compte :</strong> {request.account_email}
                  </p>
                  <p>
                    <strong>Email professionnel :</strong>{" "}
                    {request.professional_email}
                  </p>

                  {request.websites ? (
                    <p>
                      <strong>Site web :</strong> {request.websites}
                    </p>
                  ) : null}

                  {request.social_links ? (
                    <p>
                      <strong>Réseaux sociaux :</strong> {request.social_links}
                    </p>
                  ) : null}

                  {request.organization_contact ? (
                    <p>
                      <strong>Contact de vérification :</strong>{" "}
                      {request.organization_contact}
                    </p>
                  ) : null}

                  {request.message ? (
                    <p>
                      <strong>Message :</strong> {request.message}
                    </p>
                  ) : null}
                </div>

                {request.status === "pending" ? (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => approveRequest(request)}
                      disabled={actionLoadingId === request.id}
                      className="rounded-xl bg-green-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoadingId === request.id
                        ? "Traitement..."
                        : "Accepter"}
                    </button>

                    <button
                      type="button"
                      onClick={() => rejectRequest(request)}
                      disabled={actionLoadingId === request.id}
                      className="rounded-xl bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                    >
                      Refuser
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}