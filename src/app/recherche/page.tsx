import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import EventCard from "@/components/EventCard";

type RecherchePageProps = {
  searchParams: Promise<{
    search?: string;
    city?: string;
    category?: string;
    date?: string;
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
  start_time: string | null;
};

export const metadata: Metadata = {
  title: "Recherche d'événements | CultureRadar",
  description:
    "Recherchez des événements par ville, catégorie ou date. Découvrez concerts, expositions et sorties partout en France avec CultureRadar.",
  alternates: {
    canonical: "/recherche",
  },
  openGraph: {
    title: "Recherche d'événements | CultureRadar",
    description:
      "Filtrez et trouvez facilement des événements selon vos envies : concerts, expositions, sorties.",
    url: "https://cultureradar.fr/recherche",
  },
};

function parseMultiValue(value?: string) {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "fr"));
}

function formatEventDate(startTime: string | null) {
  if (!startTime) return "Date à venir";

  return new Date(startTime).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function matchesDateFilter(startTime: string | null, selectedDate: string) {
  if (!selectedDate) return true;
  if (!startTime) return false;

  const eventDate = new Date(startTime);
  const now = new Date();

  if (selectedDate === "Aujourd'hui") {
    return eventDate.toDateString() === now.toDateString();
  }

  if (selectedDate === "Cette semaine") {
    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(now.getDate() + 7);
    return eventDate >= now && eventDate <= sevenDaysLater;
  }

  if (selectedDate === "Ce mois-ci") {
    return (
      eventDate.getMonth() === now.getMonth() &&
      eventDate.getFullYear() === now.getFullYear()
    );
  }

  return true;
}

export default async function RecherchePage({
  searchParams,
}: RecherchePageProps) {
  const params = await searchParams;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Erreur Supabase Recherche :", error);
  }

  const events: SupabaseEvent[] = data || [];

  const search = params?.search || "";
  const selectedCities = parseMultiValue(params?.city);
  const selectedCategories = parseMultiValue(params?.category);
  const selectedDate = params?.date || "";

  const availableCities = uniqueSorted(events.map((event) => event.city));
  const availableCategories = uniqueSorted(events.map((event) => event.category));
  const availableDates = ["Aujourd'hui", "Cette semaine", "Ce mois-ci"];

  const filteredEvents = events.filter((event) => {
    const searchValue = search.toLowerCase();

    const matchSearch = search
      ? event.title.toLowerCase().includes(searchValue) ||
        event.city.toLowerCase().includes(searchValue) ||
        event.category.toLowerCase().includes(searchValue) ||
        (event.description || "").toLowerCase().includes(searchValue) ||
        (event.location || "").toLowerCase().includes(searchValue)
      : true;

    const matchCity =
      selectedCities.length > 0 ? selectedCities.includes(event.city) : true;

    const matchCategory =
      selectedCategories.length > 0
        ? selectedCategories.includes(event.category)
        : true;

    const matchDate = matchesDateFilter(event.start_time, selectedDate);

    return matchSearch && matchCity && matchCategory && matchDate;
  });

  const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: filteredEvents.slice(0, 10).map((event, index) => ({
    "@type": "Event",
    position: index + 1,
    name: event.title,
    startDate: event.start_time,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: event.location || event.city,
      address: {
        "@type": "PostalAddress",
        addressLocality: event.city,
        addressCountry: "FR",
      },
    },
    image: event.image || "/images/fond-a.png",
    description: event.description || event.title,
  })),
};

  const buildUrl = ({
    nextSearch = search,
    nextCities = selectedCities,
    nextCategories = selectedCategories,
    nextDate = selectedDate,
  }: {
    nextSearch?: string;
    nextCities?: string[];
    nextCategories?: string[];
    nextDate?: string;
  }) => {
    const query = new URLSearchParams();

    if (nextSearch.trim()) {
      query.set("search", nextSearch.trim());
    }

    if (nextCities.length > 0) {
      query.set("city", nextCities.join(","));
    }

    if (nextCategories.length > 0) {
      query.set("category", nextCategories.join(","));
    }

    if (nextDate.trim()) {
      query.set("date", nextDate.trim());
    }

    const queryString = query.toString();
    return queryString ? `/recherche?${queryString}` : "/recherche";
  };

  const toggleValue = (list: string[], value: string) => {
    return list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value];
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 md:px-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Recherche</h1>
          <p className="mt-2 text-gray-600">
            Recherche et filtre les événements selon tes envies.
          </p>
        </header>

        <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Filtres de recherche
            </h2>

            <Link
              href="/recherche"
              className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Réinitialiser
            </Link>
          </div>

          <div className="grid gap-6">
            <form action="/recherche" method="GET" className="grid gap-4">
              {selectedCities.length > 0 && (
                <input type="hidden" name="city" value={selectedCities.join(",")} />
              )}

              {selectedCategories.length > 0 && (
                <input
                  type="hidden"
                  name="category"
                  value={selectedCategories.join(",")}
                />
              )}

              {selectedDate && (
                <input type="hidden" name="date" value={selectedDate} />
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Recherche texte
                </label>

                <div className="flex flex-col gap-3 md:flex-row">
                  <input
                    type="text"
                    name="search"
                    defaultValue={search}
                    placeholder="Rechercher un événement, une ville, un thème..."
                    className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-black"
                  />

                  <button
                    type="submit"
                    className="rounded-2xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            </form>

            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Villes
              </label>
              <div className="flex flex-wrap gap-2">
                {availableCities.map((city) => {
                  const isActive = selectedCities.includes(city);

                  return (
                    <Link
                      key={city}
                      href={buildUrl({
                        nextCities: toggleValue(selectedCities, city),
                      })}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-black text-white"
                          : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      {city}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Catégories
              </label>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map((category) => {
                  const isActive = selectedCategories.includes(category);

                  return (
                    <Link
                      key={category}
                      href={buildUrl({
                        nextCategories: toggleValue(selectedCategories, category),
                      })}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-black text-white"
                          : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      {category}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Date
              </label>
              <div className="flex flex-wrap gap-2">
                {availableDates.map((date) => {
                  const isActive = selectedDate === date;

                  return (
                    <Link
                      key={date}
                      href={buildUrl({
                        nextDate: isActive ? "" : date,
                      })}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-black text-white"
                          : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      {date}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Filtres actifs
          </h2>

          <div className="flex flex-wrap gap-3">
            {search ? (
              <span className="rounded-full bg-black px-4 py-2 text-sm text-white">
                Recherche : {search}
              </span>
            ) : null}

            {selectedCities.map((city) => (
              <span
                key={city}
                className="rounded-full bg-black px-4 py-2 text-sm text-white"
              >
                Ville : {city}
              </span>
            ))}

            {selectedCategories.map((category) => (
              <span
                key={category}
                className="rounded-full bg-black px-4 py-2 text-sm text-white"
              >
                Catégorie : {category}
              </span>
            ))}

            {selectedDate ? (
              <span className="rounded-full bg-black px-4 py-2 text-sm text-white">
                Date : {selectedDate}
              </span>
            ) : null}

            {!search &&
              selectedCities.length === 0 &&
              selectedCategories.length === 0 &&
              !selectedDate && (
                <span className="rounded-full bg-gray-200 px-4 py-2 text-sm text-gray-700">
                  Aucun filtre actif
                </span>
              )}
          </div>
        </section>

        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              Résultats ({filteredEvents.length})
            </h2>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  date={formatEventDate(event.start_time)}
                  city={event.city}
                  image={event.image || "/images/fond-a.png"}
                  location={event.location || undefined}
                  category={event.category}
                  description={event.description || undefined}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
              <p className="text-lg font-medium text-gray-800">
                Aucun événement trouvé.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Essaie une autre combinaison de filtres ou réinitialise la recherche.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}