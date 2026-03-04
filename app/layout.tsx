import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leo Studio",
  description: "Studio de criação",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
