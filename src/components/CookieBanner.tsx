"use client";

import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");

    if (!consent) {
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const refuseCookies = () => {
    localStorage.setItem("cookie-consent", "refused");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[95%] max-w-3xl -translate-x-1/2 rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="mb-1 text-lg font-semibold text-black">
            Gestion des cookies
          </h3>

          <p className="text-sm text-gray-700">
            CultureRadar utilise des cookies afin d’améliorer l’expérience
            utilisateur et assurer le bon fonctionnement du site.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={refuseCookies}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Refuser
          </button>

          <button
            onClick={acceptCookies}
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}