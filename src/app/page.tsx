import type { Metadata } from "next";
import Hero from "@/components/Hero";
import EventSection from "@/components/EventSection";
import HomeDiscovery from "@/components/HomeDiscovery";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Accueil",
  description:
    "Découvrez les événements autour de vous : concerts, expositions, festivals et sorties. CultureRadar vous aide à trouver quoi faire près de chez vous.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CultureRadar - Trouvez des événements près de vous",
    description:
      "Explorez concerts, expositions et événements près de chez vous avec CultureRadar.",
    url: "https://cultureradar.fr",
    images: [
      {
        url: "/images/fond-hero-loop.png",
        width: 1200,
        height: 630,
        alt: "CultureRadar",
      },
    ],
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CultureRadar",
    url: "https://cultureradar.fr",
    description:
      "Découvrez facilement les événements autour de vous : concerts, expositions, sorties et bien plus encore.",
  };
  return (
    <main className="bg-white">

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Hero />

      <div className="mx-auto w-full max-w-[1700px]">
        <EventSection title="Nouveaux événements" variant="newest" />
        <EventSection title="Populaire" variant="default" />
        <EventSection title="Prochains événements" variant="upcoming" />
      </div>

      <div className="bg-white py-6">
        <div className="mx-auto w-full max-w-[1700px]">
          <HomeDiscovery />
        </div>
      </div>

      <Footer />
    </main>
  );
}