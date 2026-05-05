"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type UserInfo = {
  id: string;
  email: string | null;
};

export default function AuthButton() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? null,
        });
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? null,
        });
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="rounded-full border border-gray-400 bg-white px-4 py-1.5 text-sm font-medium text-black">
        ...
      </div>
    );
  }

  if (user) {
    return (
      <button
        onClick={handleLogout}
        className="rounded-full border border-gray-400 bg-white px-4 py-1.5 text-sm font-medium text-black transition-all duration-200 hover:bg-gray-100"
      >
        Logout
      </button>
    );
  }

  return (
    <Link
      href="/connexion"
      className="rounded-full border border-gray-400 bg-white px-4 py-1.5 text-sm font-medium text-black transition-all duration-200 hover:bg-gray-100"
    >
      Login
    </Link>
  );
}