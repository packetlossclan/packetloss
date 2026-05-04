import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "PacketLoss",
  description: "Login/cadastro com Discord usando Drizzle ORM",
  openGraph: {
    title: "PacketLoss",
    description: "Login/cadastro com Discord usando Drizzle ORM",
      images: [
        {
          url: "https://packetloss.com.br/og-image.png",
          width: 256,
          height: 256,
          alt: "PacketLoss - Login/cadastro com Discord usando Drizzle ORM",
        },
      ],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="bg-neutral-950 text-neutral-100 font-(family-name:--font-geist) antialiased">
        {children}
      </body>
    </html>
  );
}
