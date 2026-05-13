import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import EventMap from "@/components/EventMap";
import EventRegistrationButton from "@/components/EventRegistrationButton";

type EventDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type SupabaseEvent = {
  id: number;
  title: string;
  description: string | null;
  city: string;
  category: string;
  image: string | null;
  location: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  start_time: string | null;
};

const siteUrl = "https://culture-radar-site.vercel.app";

function formatEventDate(startTime: string | null) {
  if (!startTime) return "Date à venir";

  return new Date(startTime).toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function getEvent(id: number) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as SupabaseEvent;
}

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(Number(id));

  if (!event) {
    return {
      title: "Événement introuvable",
      description: "L'événement demandé est introuvable.",
    };
  }

  const description =
    event.description || `${event.title} à ${event.city} sur CultureRadar.`;

  return {
    title: event.title,
    description,
    alternates: {
      canonical: `/event/${event.id}`,
    },
    openGraph: {
      title: `${event.title} | CultureRadar`,
      description,
      url: `${siteUrl}/event/${event.id}`,
      type: "article",
      images: [
        {
          url: event.image || "/images/fond-a.png",
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${event.title} | CultureRadar`,
      description,
      images: [event.image || "/images/fond-a.png"],
    },
  };
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { id } = await params;
  const event = await getEvent(Number(id));

  if (!event) {
    notFound();
  }

  const eventUrl = `${siteUrl}/event/${event.id}`;
  const eventImage = event.image || "/images/fond-a.png";
  const eventDescription =
    event.description || `${event.title} à ${event.city} sur CultureRadar.`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: eventDescription,
    startDate: event.start_time || undefined,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    image: [
      eventImage.startsWith("http") ? eventImage : `${siteUrl}${eventImage}`,
    ],
    url: eventUrl,
    location: {
      "@type": "Place",
      name: event.location || event.title,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.address || undefined,
        addressLocality: event.city || undefined,
        addressCountry: "FR",
      },
      geo:
        event.latitude !== null && event.longitude !== null
          ? {
              "@type": "GeoCoordinates",
              latitude: event.latitude,
              longitude: event.longitude,
            }
          : undefined,
    },
    organizer: {
      "@type": "Organization",
      name: "CultureRadar",
      url: siteUrl,
    },
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 md:px-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <div className="mx-auto max-w-5xl">
        <Link
          href="/recherche"
          className="mb-6 inline-block text-sm font-medium text-gray-600 transition hover:text-black"
        >
          ← Retour à la recherche
        </Link>

        <article className="overflow-hidden rounded-3xl bg-white shadow-lg">
          <div className="h-[320px] w-full overflow-hidden md:h-[420px]">
            <img
              src={event.image || "/images/fond-a.png"}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="p-6 md:p-10">
            <div className="mb-4 flex flex-wrap gap-3">
              <span className="rounded-full bg-black px-4 py-2 text-sm text-white">
                {event.category}
              </span>
              <span className="rounded-full bg-gray-200 px-4 py-2 text-sm text-gray-700">
                {event.city}
              </span>
            </div>

            <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              {event.title}
            </h1>

            <div className="mb-8 space-y-2 text-gray-600">
              <p>
                <span className="font-semibold text-gray-800">Date :</span>{" "}
                {formatEventDate(event.start_time)}
              </p>

              <p>
                <span className="font-semibold text-gray-800">Lieu :</span>{" "}
                {event.location || "Lieu à confirmer"}
              </p>

              <p>
                <span className="font-semibold text-gray-800">Adresse :</span>{" "}
                {event.address || "Adresse à confirmer"}
              </p>
            </div>

            <EventRegistrationButton eventId={event.id} />

            <div className="mb-8 rounded-2xl bg-gray-50 p-5">
              <h2 className="mb-3 text-xl font-semibold text-gray-900">
                Description
              </h2>
              <p className="leading-7 text-gray-700">
                {event.description || "Aucune description disponible."}
              </p>
            </div>

            {event.latitude !== null && event.longitude !== null ? (
              <section>
                <h2 className="mb-4 text-2xl font-bold text-gray-900">
                  Localisation
                </h2>

                <EventMap
                  latitude={event.latitude}
                  longitude={event.longitude}
                  title={event.title}
                  address={event.address}
                />

                <div className="mt-4">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 transition hover:bg-gray-100"
                  >
                    Ouvrir dans Google Maps
                  </a>
                </div>
              </section>
            ) : null}
          </div>
        </article>
      </div>
    </main>
  );
}