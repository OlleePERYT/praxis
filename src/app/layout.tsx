import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "praxis-kennzahlen.de",
  description:
    "Wirtschaftlicher Szenario-Simulator für Therapiepraxen: Erlöse, Kosten und Überschuss in Echtzeit modellieren.",
  icons: {
    icon: "/assets/favicon-32x32.png",
    apple: "/assets/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className={`${manrope.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
