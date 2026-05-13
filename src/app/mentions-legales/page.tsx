import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales du site CultureRadar : éditeur, hébergeur, propriété intellectuelle et données personnelles.",
  alternates: {
    canonical: "/mentions-legales",
  },
};

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12 text-black">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm md:p-10">
        <Link
          href="/"
          className="mb-6 inline-block text-sm font-medium text-gray-600 transition hover:text-black"
        >
          ← Retour à l’accueil
        </Link>

        <h1 className="mb-6 text-4xl font-bold text-gray-900">
          Mentions légales
        </h1>

        <p className="mb-8 text-gray-600">
          Cette page présente les informations légales relatives au site
          CultureRadar.
        </p>

        <section className="mb-8">
          <h2 className="mb-3 text-2xl font-semibold text-gray-900">
            Éditeur du site
          </h2>

          <div className="space-y-2 text-gray-700">
            <p>
              <strong>Nom du site :</strong> CultureRadar
            </p>
            <p>
              <strong>Responsable de publication :</strong> Philam Tran
            </p>
            <p>
              <strong>Nature du projet :</strong> projet étudiant non commercial
            </p>
            <p>
              <strong>Contact :</strong> philamtran2004@gmail.com
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-2xl font-semibold text-gray-900">
            Hébergement
          </h2>

          <div className="space-y-2 text-gray-700">
            <p>
              Le site est hébergé par <strong>Vercel Inc.</strong>
            </p>
            <p>
              <strong>Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA
              91723, États-Unis
            </p>
            <p>
              <strong>Site web :</strong>{" "}
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noreferrer"
                className="text-blue-700 underline"
              >
                https://vercel.com
              </a>
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-2xl font-semibold text-gray-900">
            Propriété intellectuelle
          </h2>

          <p className="leading-7 text-gray-700">
            Les contenus présents sur le site CultureRadar, notamment les textes,
            éléments graphiques, interfaces, logos et visuels, sont utilisés dans
            le cadre du projet. Toute reproduction, diffusion ou réutilisation
            non autorisée des éléments du site est interdite sans accord
            préalable.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-2xl font-semibold text-gray-900">
            Données personnelles
          </h2>

          <p className="mb-4 leading-7 text-gray-700">
            CultureRadar peut collecter certaines données nécessaires au
            fonctionnement du site, notamment lors de la création d’un compte, de
            la connexion ou de la publication d’un événement. Ces données sont
            utilisées uniquement dans le cadre du fonctionnement de la plateforme.
          </p>

          <p className="leading-7 text-gray-700">
            L’authentification et le stockage des données sont assurés par
            Supabase. Les utilisateurs peuvent demander la modification ou la
            suppression de leurs données en contactant l’éditeur du site.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-2xl font-semibold text-gray-900">
            Cookies
          </h2>

          <p className="leading-7 text-gray-700">
            Le site peut utiliser des cookies ou technologies similaires afin
            d’assurer son bon fonctionnement et, le cas échéant, d’améliorer
            l’expérience utilisateur. Un bandeau d’information permet à
            l’utilisateur d’accepter ou de refuser l’utilisation des cookies non
            essentiels.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-gray-900">
            Limitation de responsabilité
          </h2>

          <p className="leading-7 text-gray-700">
            CultureRadar est un projet étudiant. Malgré le soin apporté au
            développement du site et à la présentation des informations, des
            erreurs ou imprécisions peuvent subsister. L’éditeur ne peut garantir
            l’exactitude permanente de l’ensemble des événements publiés sur la
            plateforme.
          </p>
        </section>
      </div>
    </main>
  );
}