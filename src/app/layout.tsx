import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Inter,
  Montserrat,
  Space_Grotesk,
} from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { contact } from "@/lib/content";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://meroestream.com"),
  title: {
    default: "Meroestream | African Film, Documentary & Theatre",
    template: "%s | Meroestream",
  },
  description:
    "Premium African film, documentary, theatre, and entertainment stories for global audiences.",
  openGraph: {
    title: "Meroestream",
    description:
      "African cinema and live theatre rooted in tradition, speaking to the world.",
    url: "https://meroestream.com",
    siteName: "Meroestream",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Meroestream",
    url: "https://meroestream.com",
    email: contact.email,
    telephone: contact.phone,
    address: [
      {
        "@type": "PostalAddress",
        streetAddress: "14a Hyde Road",
        addressLocality: "Maidstone",
        addressRegion: "Kent",
        postalCode: "ME16 0BW",
        addressCountry: "GB",
      },
      {
        "@type": "PostalAddress",
        streetAddress: "4 Aderemi Akinsipe Street",
        addressLocality: "Ibadan",
        addressRegion: "Oyo State",
        addressCountry: "NG",
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${montserrat.variable} ${cormorant.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="noise min-h-full bg-obsidian text-papyrus">
        <a
          href="#main"
          className="sr-only z-[100] rounded-full bg-sahel px-4 py-3 font-label text-sm font-bold text-obsidian focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
