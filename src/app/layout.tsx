import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CartProvider } from "@/components/CartProvider";
import { CustomerAuthProvider } from "@/components/CustomerAuthProvider";
import { getRestaurantConfig } from "@/services/api/server";
import { cx } from "@/utils/classNames";
import "@daypicker/react/style.css";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const restaurantConfig = await getRestaurantConfig();
  const restaurantName = restaurantConfig?.name?.trim();
  const logoUrl = restaurantConfig?.logoUrl?.trim();

  return {
    title: restaurantName || "FlyFoods",
    description: "Cardápio e painel admin para delivery.",
    icons: logoUrl
      ? {
          icon: logoUrl,
          shortcut: logoUrl,
        }
      : undefined,
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
      className={cx(plusJakartaSans.variable)}
    >
      <body>
        <ThemeProvider theme={restaurantConfig?.theme}>
          <CustomerAuthProvider>
            <CartProvider>{children}</CartProvider>
          </CustomerAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
