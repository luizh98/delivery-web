import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";

const font = Plus_Jakarta_Sans({ variable: "--font-plus-jakarta-sans", subsets: ["latin"] });
export const metadata: Metadata = { title: "Conectar WhatsApp | FlyFoods", referrer: "no-referrer", robots: { index: false, follow: false } };

export default function IntegrationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" className={font.variable}><body>{children}</body></html>;
}
