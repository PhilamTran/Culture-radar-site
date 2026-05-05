"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function HomeDiscovery() {
  const [categories, setCategories] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    const fetchFilters = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("category, city");

      if (error) {
        console.error("Erreur Supabase HomeDiscovery :", error);
        return;
      }

      const safeData = data || [];

      const categoryCount: Record<string, number> = {};
      safeData.forEach((item) => {
        if (!item.category) return;
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      });

      const topCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr"))
        .slice(0, 6)
        .map(([category]) => category);

      const cityCount: Record<string, number> = {};
      safeData.forEach((item) => {
        if (!item.city) return;
        cityCount[item.city] = (cityCount[item.city] || 0) + 1;
      });

      const topCities = Object.entries(cityCount)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr"))
        .slice(0, 6)
        .map(([city]) => city);

      setCategories(topCategories);
      setCities(topCities);
    };

    fetchFilters();
  }, []);

  return (
    <section className="px-6 py-8">
      <div className="mx-auto max-w-[1600px] rounded-3xl bg-gray-100 px-6 py-10 shadow-sm">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900">
            catégories populaires et villes en vogue
          </h2>
          <p className="mt-2 text-gray-600">
            Trouve rapidement des événements selon ton thème ou ta ville.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Catégories */}
          <div className="flex h-full flex-col rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">
              Par catégorie
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <Link
                    key={category}
                    href={`/recherche?category=${encodeURIComponent(category)}`}
                    className="flex h-10 w-full items-center justify-center rounded-full border border-gray-300 bg-white px-4 text-center text-sm font-medium text-gray-800 transition hover:border-black hover:bg-gray-100"
                  >
                    {category}
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  Chargement des catégories...
                </p>
              )}
            </div>
          </div>

          {/* Villes */}
          <div className="flex h-full flex-col rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">
              Par ville
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {cities.length > 0 ? (
                cities.map((city) => (
                  <Link
                    key={city}
                    href={`/recherche?city=${encodeURIComponent(city)}`}
                    className="flex h-10 w-full items-center justify-center rounded-full border border-gray-300 bg-white px-4 text-center text-sm font-medium text-gray-800 transition hover:border-black hover:bg-gray-100"
                  >
                    {city}
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  Chargement des villes...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}