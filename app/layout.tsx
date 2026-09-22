import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Roulette Predictor - Analyse & Statistiques',
  description: "Analyseur de probabilités, suivi des séries, calcul des écarts et prédictions pour la Roulette Française.",
  openGraph: {
    title: 'Roulette Predictor - Analyse & Statistiques',
    description: "Analyseur de probabilités, suivi des séries, calcul des écarts et prédictions pour la Roulette Française.",
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roulette Predictor - Analyse & Statistiques',
    description: "Analyseur de probabilités, suivi des séries, calcul des écarts et prédictions pour la Roulette Française.",
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
