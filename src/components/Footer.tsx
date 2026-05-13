import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-neutral-500 px-6 py-10 text-black">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow-md">
            <h3 className="mb-3 text-2xl font-semibold">Produit</h3>
            <div className="flex flex-col gap-1 text-sm">
              <Link href="/ajouter-evenement" className="text-blue-700 hover:underline">
                Créer un événement
              </Link>
              <Link href="/bientot" className="text-blue-700 hover:underline">
                Calendrier
              </Link>
              <Link href="/radar" className="text-blue-700 hover:underline">
                Radar
              </Link>
              <Link href="/ma-carte" className="text-blue-700 hover:underline">
                Ma carte
              </Link>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-md">
            <h3 className="mb-3 text-2xl font-semibold">Découverte</h3>
            <div className="flex flex-col gap-1 text-sm">
              <Link href="/recherche" className="text-blue-700 hover:underline">
                Toutes catégories
              </Link>
              <Link href="/recherche" className="text-blue-700 hover:underline">
                Recherche par villes
              </Link>
              <Link href="/bientot" className="text-blue-700 hover:underline">
                Nouveaux événements
              </Link>
              <Link href="/bientot" className="text-blue-700 hover:underline">
                Événements populaires
              </Link>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-md">
            <h3 className="mb-3 text-2xl font-semibold">Support</h3>
            <div className="flex flex-col gap-1 text-sm">
              <Link href="/bientot" className="text-blue-700 hover:underline">
                FAQ
              </Link>
              <Link href="/bientot" className="text-blue-700 hover:underline">
                Contact
              </Link>
              <Link href="/bientot" className="text-blue-700 hover:underline">
                Signaler un événement
              </Link>
              <Link href="/bientot" className="text-blue-700 hover:underline">
                Signaler un bug
              </Link>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-md">
            <h3 className="mb-3 text-2xl font-semibold">Légale</h3>
            <div className="flex flex-col gap-1 text-sm">
              <Link href="/mentions-legales" className="text-blue-700 hover:underline">
                Conditions d’utilisation
              </Link>
              <Link href="/mentions-legales" className="text-blue-700 hover:underline">
                Politique de confidentialité
              </Link>
              <Link href="/mentions-legales" className="text-blue-700 hover:underline">
                Mentions légales
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 h-4 w-full rounded-full bg-neutral-300" />

        <p className="mt-3 text-sm text-black/80">
          © 2026 CultureRadar — Tous droits réservés
        </p>
      </div>
    </footer>
  );
}