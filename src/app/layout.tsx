import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Packetloss",
  description: "Login/cadastro com Discord usando Drizzle ORM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
