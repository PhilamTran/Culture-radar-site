import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cultureradar.fr"),
  title: {
    default: "CultureRadar",
    template: "%s | CultureRadar",
  },
  description:
    "CultureRadar vous permet de découvrir facilement les événements autour de vous : concerts, expositions, sorties, festivals et bien plus encore.",
  applicationName: "CultureRadar",
  keywords: [
    "événements",
    "sorties",
    "concerts",
    "festivals",
    "expositions",
    "agenda culturel",
    "loisirs",
    "CultureRadar",
  ],
  authors: [{ name: "CultureRadar" }],
  creator: "CultureRadar",
  publisher: "CultureRadar",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://cultureradar.fr",
    siteName: "CultureRadar",
    title: "CultureRadar",
    description:
      "Découvrez facilement les événements autour de vous : concerts, expositions, sorties et bien plus encore.",
    images: [
      {
        url: "/images/fond-hero-loop.png",
        width: 1200,
        height: 630,
        alt: "CultureRadar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CultureRadar",
    description:
      "Découvrez facilement les événements autour de vous : concerts, expositions, sorties et bien plus encore.",
    images: ["/images/fond-hero-loop.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-neutral-200 text-black antialiased`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}