"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import AuthButton from "@/components/AuthButton";

const navItems = [
  { label: "Recherche", href: "/recherche" },
  { label: "Radar", href: "/radar" },
  { label: "Ma Carte", href: "/ma-carte" },
  { label: "Mes événements", href: "/mes-evenements" },
  { label: "Ajouter", href: "/ajouter-evenement" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [searchValue, setSearchValue] = useState("");

  const getNavLinkClass = (href: string) => {
    const isActive = pathname === href;

    return `rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-black text-white shadow-md"
        : "bg-white text-black border border-gray-400 hover:bg-gray-100"
    }`;
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();

    const trimmedValue = searchValue.trim();

    if (!trimmedValue) {
      router.push("/recherche");
      return;
    }

    router.push(`/recherche?search=${encodeURIComponent(trimmedValue)}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-gray-300/95 px-6 py-3 backdrop-blur">
      <div className="flex items-center justify-between gap-4">

        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-white/40"
        >
          <div
            className="flex items-center justify-center overflow-hidden rounded-full bg-slate-700"
            style={{
              width: "50px",
              height: "50px",
              minWidth: "50px",
              minHeight: "50px",
              maxWidth: "50px",
              maxHeight: "50px",
            }}
          >
            <img
              src="/images/logo.png"
              alt="CultureRadar"
              style={{
                width: "50px",
                height: "50px",
                objectFit: "contain",
              }}
            />
          </div>

          <span className="text-lg font-bold text-black">
            CultureRadar
          </span>
        </Link>

        {/* NAVIGATION */}
        <nav className="flex items-center gap-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={getNavLinkClass(item.href)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* SEARCH */}
        <form
          onSubmit={handleSearch}
          className="mx-4 flex max-w-md flex-1 items-center gap-2"
        >
          <input
            type="text"
            placeholder="Recherche ..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full rounded-full border border-gray-400 bg-white px-4 py-2 text-sm text-black outline-none placeholder:text-gray-500 focus:border-black"
          />

          <button
            type="submit"
            className="rounded-full border border-gray-400 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-gray-100"
          >
            Rechercher
          </button>
        </form>

        <AuthButton />
      </div>
    </header>
  );
}