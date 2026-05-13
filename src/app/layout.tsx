import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const nunito = localFont({
  src: [
    {
      path: "../../public/fonts/Nunito-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Nunito-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-nunito",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Packet Loss — Clã de Elite Among Us",
  description: "Clã de elite Among Us. Fundado em 21 de agosto de 2021.",
  openGraph: {
    title: "Packet Loss — Clã de Elite Among Us",
    description: "Clã de elite Among Us. Fundado em 21 de agosto de 2021.",
    images: [
      {
        url: "https://packetloss.com.br/og-image.png",
        width: 256,
        height: 256,
        alt: "Packet Loss — Clã de Elite Among Us",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${nunito.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link rel="icon" type="image/png" href="/images/logo.png" />
      </head>
      <body style={{ fontFamily: "var(--font-nunito, var(--font-display))" }}>
        {children}
      </body>
    </html>
  );
}
