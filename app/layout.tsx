import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Natural Writer",
  description: "Trasforma testi rigidi in contenuti più naturali e adatti al contesto.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
