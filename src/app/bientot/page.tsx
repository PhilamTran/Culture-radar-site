import Link from "next/link";

export default function BientotPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12 text-black">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 shadow">
        <div className="mb-6 inline-flex rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
          Page en préparation
        </div>

        <h1 className="mb-4 text-4xl font-bold">
          Cette section sera disponible prochainement
        </h1>

        <p className="mb-8 text-lg leading-relaxed text-gray-600">
          Cette fonctionnalité n’est pas encore connectée au site, mais elle
          fait bien partie des évolutions prévues pour CultureRadar.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Retour à l’accueil
          </Link>

          <Link
            href="/recherche"
            className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-800 transition hover:bg-gray-100"
          >
            Explorer les événements
          </Link>
        </div>
      </div>
    </main>
  );
}