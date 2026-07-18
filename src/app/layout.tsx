import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getRestaurantConfig } from "@/services/api/server";
import { cx } from "@/utils/classNames";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Delivery Web",
  description: "Cardapio e painel admin para delivery.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const restaurantConfig = await getRestaurantConfig();

  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cx(geistSans.variable, geistMono.variable)}
    >
      <body>
        <ThemeProvider theme={restaurantConfig?.theme}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
