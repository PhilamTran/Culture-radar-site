"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function DevenirProfessionnelPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [accountEmail, setAccountEmail] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    professional_email: "",
    organization_name: "",
    websites: "",
    social_links: "",
    organization_contact: "",
    message: "",
  });

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        setUserId(null);
        setLoadingUser(false);
        return;
      }

      setUserId(user.id);
      setAccountEmail(user.email || "");
      setLoadingUser(false);
    };

    loadUser();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!userId) {
      setError("Vous devez être connecté pour faire une demande.");
      return;
    }

    if (!form.professional_email.trim()) {
      setError("Veuillez renseigner un email professionnel.");
      return;
    }

    setSubmitting(true);

    const { error: insertError } = await supabase
      .from("professional_requests")
      .insert([
        {
          user_id: userId,
          account_email: accountEmail,
          professional_email: form.professional_email.trim(),
          organization_name: form.organization_name.trim() || null,
          websites: form.websites.trim() || null,
          social_links: form.social_links.trim() || null,
          organization_contact: form.organization_contact.trim() || null,
          message: form.message.trim() || null,
          status: "pending",
        },
      ]);

    setSubmitting(false);

    if (insertError) {
      if (insertError.message.includes("duplicate")) {
        setError("Vous avez déjà une demande professionnelle en attente.");
      } else {
        setError(insertError.message);
      }
      return;
    }

    setSuccess(
      "Votre demande a bien été envoyée. Elle sera examinée par un administrateur."
    );

    setForm({
      professional_email: "",
      organization_name: "",
      websites: "",
      social_links: "",
      organization_contact: "",
      message: "",
    });
  };

  if (loadingUser) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10 text-black">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
          Chargement...
        </div>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10 text-black">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="mb-4 text-3xl font-bold">
            Connexion requise
          </h1>

          <p className="mb-6 text-gray-700">
            Vous devez être connecté pour demander un compte professionnel.
          </p>

          <Link
            href="/connexion"
            className="inline-flex rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Aller à la connexion
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 text-black">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          Demander un compte professionnel
        </h1>

        <p className="mb-8 text-gray-600">
          Cette demande permet de vérifier votre lien avec une organisation,
          un lieu culturel ou une structure événementielle avant de vous autoriser
          à publier des événements.
        </p>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email du compte
            </label>
            <input
              value={accountEmail}
              disabled
              className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-sm text-gray-700"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email professionnel *
            </label>
            <input
              name="professional_email"
              type="email"
              value={form.professional_email}
              onChange={handleChange}
              placeholder="ex : contact@mon-lieu-culturel.fr"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Nom de l’organisation
            </label>
            <input
              name="organization_name"
              value={form.organization_name}
              onChange={handleChange}
              placeholder="ex : Théâtre Lumière, Galerie Nova..."
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Site web
            </label>
            <textarea
              name="websites"
              value={form.websites}
              onChange={handleChange}
              placeholder="Ajoutez un ou plusieurs liens vers le site officiel."
              className="min-h-24 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Réseaux sociaux
            </label>
            <textarea
              name="social_links"
              value={form.social_links}
              onChange={handleChange}
              placeholder="Instagram, Facebook, LinkedIn, etc."
              className="min-h-24 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Contact pouvant confirmer votre identité
            </label>
            <textarea
              name="organization_contact"
              value={form.organization_contact}
              onChange={handleChange}
              placeholder="Nom, email, téléphone ou contact officiel de l’organisation."
              className="min-h-24 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Message complémentaire
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Expliquez brièvement pourquoi vous demandez un compte professionnel."
              className="min-h-28 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-black outline-none focus:border-black"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-green-600">{success}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-fit rounded-xl bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? "Envoi..." : "Envoyer la demande"}
          </button>
        </form>
      </div>
    </main>
  );
}