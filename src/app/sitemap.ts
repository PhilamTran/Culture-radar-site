import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://cultureradar.fr";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const { data } = await supabase
    .from("events")
    .select("id, created_at");

  const eventUrls =
    data?.map((event) => ({
      url: `${baseUrl}/event/${event.id}`,
      lastModified: event.created_at || new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })) || [];

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/recherche`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/radar`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ma-carte`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/connexion`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/ajouter-evenement`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.5,
    },

    ...eventUrls,
  ];
}