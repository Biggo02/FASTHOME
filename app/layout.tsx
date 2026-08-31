import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FASTHOME — Trouvez votre prochain chez-vous",
  description: "Plateforme immobilière FASTHOME pour rechercher, publier et gérer des logements en toute confiance.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
