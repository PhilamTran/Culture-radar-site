"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type CategoryOption = {
  value: string;
  label: string;
};

const categories: CategoryOption[] = [
  { value: "concert", label: "Concert" },
  { value: "cinema", label: "Cinéma" },
  { value: "exposition", label: "Exposition" },
  { value: "theatre", label: "Théâtre" },
  { value: "restaurant", label: "Restaurant" },
  { value: "bar", label: "Bar / Soirée" },
  { value: "festival", label: "Festival" },
  { value: "sport", label: "Sport" },
  { value: "loisirs", label: "Loisirs" },
  { value: "conference", label: "Conférence" },
  { value: "marche", label: "Marché" },
  { value: "autre", label: "Autre" },
];

type NominatimResult = {
  lat: string;
  lon: string;
};

export type EventFormValues = {
  title: string;
  description: string;
  city: string;
  category: string;
  location: string;
  address: string;
  start_time: string;
  end_time: string;
  image: string;
  latitude: number | null;
  longitude: number | null;
};

type EventFormProps = {
  mode: "create" | "edit";
  initialValues?: EventFormValues;
  eventId?: number;
  userId: string | null;
};

const defaultValues: EventFormValues = {
  title: "",
  description: "",
  city: "",
  category: "",
  location: "",
  address: "",
  start_time: "",
  end_time: "",
  image: "/images/fond-a.png",
  latitude: null,
  longitude: null,
};

function toDatetimeLocal(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function EventForm({
  mode,
  initialValues,
  eventId,
  userId,
}: EventFormProps) {
  const router = useRouter();

  const mergedInitialValues = {
    ...defaultValues,
    ...initialValues,
    start_time: toDatetimeLocal(initialValues?.start_time),
    end_time: toDatetimeLocal(initialValues?.end_time),
  };

  const [form, setForm] = useState<EventFormValues>(mergedInitialValues);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(mergedInitialValues.image || "/images/fond-a.png");
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState("");
  const [geoError, setGeoError] = useState("");
  const [geoSuccess, setGeoSuccess] = useState("");

  const handleUploadClick = () => {
    document.getElementById("fileInput")?.click();
  };

  const handleFile = (file: File) => {
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "address" || name === "city") {
      setGeoError("");
      setGeoSuccess("");
      setForm((prev) => ({
        ...prev,
        latitude: null,
        longitude: null,
      }));
    }
  };

  const buildGeocodeQuery = () => {
    const parts = [form.address.trim(), form.city.trim(), "France"].filter(Boolean);
    return parts.join(", ");
  };

  const geocodeAddress = async () => {
    const query = buildGeocodeQuery();

    if (!query) {
      throw new Error("Veuillez renseigner une adresse avant de rechercher les coordonnées.");
    }

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la recherche d’adresse.");
    }

    const results: NominatimResult[] = await response.json();

    if (!results.length) {
      throw new Error("Aucune coordonnée trouvée pour cette adresse.");
    }

    return {
      latitude: Number(results[0].lat),
      longitude: Number(results[0].lon),
    };
  };

  const handleGeocode = async () => {
    setGeoError("");
    setGeoSuccess("");
    setGeoLoading(true);

    try {
      const coords = await geocodeAddress();

      setForm((prev) => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));

      setGeoSuccess("Adresse localisée avec succès.");
    } catch (err) {
      console.error(err);
      setGeoError(
        err instanceof Error
          ? err.message
          : "Impossible de récupérer les coordonnées pour cette adresse."
      );
    }

    setGeoLoading(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!userId) {
      setError("Vous devez être connecté pour publier un événement.");
      return;
    }

    if (!form.title || !form.city || !form.category) {
      setError("Veuillez remplir les champs obligatoires.");
      return;
    }

    if (!form.address.trim()) {
      setError("Veuillez renseigner une adresse.");
      return;
    }

    let latitude = form.latitude;
    let longitude = form.longitude;

    if (latitude === null || longitude === null) {
      try {
        const coords = await geocodeAddress();
        latitude = coords.latitude;
        longitude = coords.longitude;

        setForm((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de récupérer automatiquement les coordonnées."
        );
        return;
      }
    }

    setLoading(true);

    let imageUrl = form.image || "/images/fond-a.png";

    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        setError("Erreur upload image");
        setLoading(false);
        return;
      }

      const { data } = supabase.storage.from("event-images").getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    const payload = {
      title: form.title,
      description: form.description,
      city: form.city,
      category: form.category,
      location: form.location,
      address: form.address,
      image: imageUrl,
      start_time: form.start_time ? new Date(form.start_time).toISOString() : null,
      end_time: form.end_time ? new Date(form.end_time).toISOString() : null,
      latitude,
      longitude,
      created_by: userId,
    };

    if (mode === "create") {
      const { data, error: insertError } = await supabase
        .from("events")
        .insert([payload])
        .select()
        .single();

      setLoading(false);

      if (insertError) {
        setError(insertError.message);
        return;
      }

      router.push(`/event/${data.id}`);
      return;
    }

    const { error: updateError } = await supabase
      .from("events")
      .update(payload)
      .eq("id", eventId)
      .eq("created_by", userId);

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push(`/event/${eventId}`);
  };

  return (
    <main
      className="min-h-screen bg-gray-50 px-6 py-10 text-black"
      style={{ opacity: 1, filter: "none" }}
    >
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-8 shadow text-black"
        >
          <h1 className="mb-6 text-3xl font-bold">
            {mode === "create" ? "Ajouter un événement" : "Modifier un événement"}
          </h1>

          {!userId ? (
            <div className="mb-4 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              Vous devez être connecté pour publier un événement.
            </div>
          ) : (
            <div className="mb-4 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
              Connecté : vous pouvez {mode === "create" ? "publier" : "modifier"} un événement.
            </div>
          )}

          <input
            name="title"
            placeholder="Titre *"
            onChange={handleChange}
            value={form.title}
            className="mb-4 w-full rounded-xl border border-gray-300 bg-white p-3"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              name="city"
              placeholder="Ville *"
              onChange={handleChange}
              value={form.city}
              className="rounded-xl border border-gray-300 bg-white p-3"
            />

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="rounded-xl border border-gray-300 bg-white p-3 text-black"
            >
              <option value="">Choisir une catégorie *</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <input
            name="location"
            placeholder="Lieu"
            onChange={handleChange}
            value={form.location}
            className="my-4 w-full rounded-xl border border-gray-300 bg-white p-3"
          />

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-black">
              Adresse *
            </label>

            <div className="flex flex-col gap-3 md:flex-row">
              <input
                name="address"
                placeholder="Ex : 12 rue de Rivoli"
                onChange={handleChange}
                value={form.address}
                className="w-full rounded-xl border border-gray-300 bg-white p-3"
              />

              <button
                type="button"
                onClick={handleGeocode}
                disabled={geoLoading}
                className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-black hover:bg-gray-100 disabled:opacity-50"
              >
                {geoLoading ? "Recherche..." : "Trouver les coordonnées"}
              </button>
            </div>

            {geoSuccess ? <p className="mt-3 text-sm text-green-600">{geoSuccess}</p> : null}
            {geoError ? <p className="mt-3 text-sm text-red-500">{geoError}</p> : null}

            {form.latitude !== null && form.longitude !== null ? (
              <p className="mt-3 text-sm text-gray-700">
                Coordonnées détectées : {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="datetime-local"
              name="start_time"
              onChange={handleChange}
              value={form.start_time}
              className="rounded-xl border border-gray-300 bg-white p-3"
            />
            <input
              type="datetime-local"
              name="end_time"
              onChange={handleChange}
              value={form.end_time}
              className="rounded-xl border border-gray-300 bg-white p-3"
            />
          </div>

          <div className="my-6">
            <label className="mb-3 block text-sm font-medium text-black">
              Image
            </label>

            <button
              type="button"
              onClick={handleUploadClick}
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-black hover:bg-gray-100"
            >
              Choisir un fichier
            </button>

            <input
              id="fileInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            {imageFile ? (
              <p className="mt-3 text-sm text-gray-700">Fichier : {imageFile.name}</p>
            ) : (
              <p className="mt-3 text-sm text-gray-500">Aucun fichier sélectionné</p>
            )}
          </div>

          <textarea
            name="description"
            placeholder="Description"
            onChange={handleChange}
            value={form.description}
            className="mb-4 w-full rounded-xl border border-gray-300 bg-white p-3"
          />

          {error ? <p className="mb-4 text-red-500">{error}</p> : null}

          <button
            type="submit"
            disabled={loading || !userId}
            className="rounded-xl bg-black px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? mode === "create"
                ? "Publication..."
                : "Modification..."
              : userId
              ? mode === "create"
                ? "Publier"
                : "Enregistrer les modifications"
              : "Connecte-toi pour publier"}
          </button>
        </form>

        <div className="rounded-3xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">Prévisualisation</h2>

          <img
            src={preview}
            className="mb-4 h-60 w-full rounded-xl object-cover"
            alt="preview"
          />

          <h3 className="font-bold">{form.title || "Titre événement"}</h3>

          <p>{form.city || "Ville"}</p>

          <p>
            {categories.find((c) => c.value === form.category)?.label || "Catégorie"}
          </p>

          <p className="mt-2 text-sm text-gray-600">{form.address || "Adresse"}</p>

          <p className="mt-4 text-sm text-gray-600">
            {form.description || "Description..."}
          </p>
        </div>
      </div>
    </main>
  );
}