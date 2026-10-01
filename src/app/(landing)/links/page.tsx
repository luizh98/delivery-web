import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { LandingPage } from "@/landing/LandingPage";
import { loadLandingConfigForHost } from "@/landing/config/load";
import { menuHrefFromSearchParams } from "@/landing/menuHref";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const config = await loadLandingConfigForHost(host);
  if (!config || !host) notFound();
  const image = config.seo.image ?? config.heroMobile;
  const imageUrl = `/landing-pages/${config.tenantSlug}/${image.file}`;
  return {
    metadataBase: new URL(`https://${host}`),
    title: config.seo.title,
    description: config.seo.description,
    openGraph: {
      type: "website",
      title: config.seo.title,
      description: config.seo.description,
      images: [{ url: imageUrl, width: image.width, height: image.height }],
    },
    twitter: {
      card: "summary_large_image",
      title: config.seo.title,
      description: config.seo.description,
      images: [imageUrl],
    },
    icons: { icon: `/landing-pages/${config.tenantSlug}/${config.logo.file}` },
  };
}

export default async function LinksPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const requestHeaders = await headers();
  const config = await loadLandingConfigForHost(requestHeaders.get("host"));
  if (!config) notFound();
  return <LandingPage config={config} menuHref={menuHrefFromSearchParams(await searchParams)} />;
}
