import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MASE — Codifica Elaborati",
  description:
    "Strumento ufficiale per la generazione e verifica della naming convention dei file MASE secondo le Linee Guida BIMMS.",
  applicationName: "MASE Codifica",
  authors: [{ name: "GPA Partners" }],
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3f5f9",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        {/* Script sincrono per applicare tema/lingua salvati prima del primo paint (anti-FOUC) */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src={`${process.env.GITHUB_PAGES === "true" ? "/cdemase-app" : ""}/theme-init.js`} />
      </head>
      <body>{children}</body>
    </html>
  );
}
