import { ColorSchemeScript } from "@paadel/ui";
import type { Metadata } from "next";
import "@paadel/ui/styles.css";
import { Providers } from "./providers";
import "./env-guard";

export const metadata: Metadata = {
  description: "Padel match management for players",
  title: "Paadel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
