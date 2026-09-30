import { ArrowRight, ExternalLink, MapPin, MessageCircle } from "lucide-react";
import type { CSSProperties } from "react";
import type { LandingConfig, LandingImage } from "./config/schema";
import styles from "./LandingPage.module.css";

function imageUrl(slug: string, image: LandingImage) {
  return `/landing-pages/${encodeURIComponent(slug)}/${encodeURIComponent(image.file)}`;
}

function ExternalAction({ href, label, icon }: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a className={styles.secondaryLink} href={href} target="_blank" rel="noopener noreferrer">
      {icon}<span>{label}</span><ExternalLink aria-hidden="true" size={17} />
    </a>
  );
}

export function LandingPage({ config, menuHref = "/" }: {
  config: LandingConfig;
  menuHref?: string;
}) {
  const colors = {
    "--lp-background": config.colors.background,
    "--lp-foreground": config.colors.foreground,
    "--lp-accent": config.colors.accent,
  } as CSSProperties;
  return (
    <main className={styles.page} style={colors}>
      <div className={styles.shell}>
        <header className={styles.brand}>
          {/* Images are pre-optimized and verified during build. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl(config.tenantSlug, config.logo)} alt={`Marca ${config.name}`}
            width={config.logo.width} height={config.logo.height} className={styles.logo} />
          <span>{config.name}</span>
        </header>
        <div className={styles.content}>
          <section className={styles.intro} aria-labelledby="landing-title">
            <p className={styles.eyebrow}>Bem-vindo</p>
            <h1 id="landing-title">{config.headline}</h1>
            <p className={styles.description}>{config.description}</p>
            {config.addressText && <p className={styles.address}>{config.addressText}</p>}
            <nav className={styles.actions} aria-label="Links do restaurante">
              <a className={styles.primaryLink} href={menuHref}>
                <span>{config.menuLabel}</span><ArrowRight aria-hidden="true" size={22} />
              </a>
              {config.mapsUrl && <ExternalAction href={config.mapsUrl} label={config.addressLabel} icon={<MapPin aria-hidden="true" size={20} />} />}
              {config.whatsappUrl && <ExternalAction href={config.whatsappUrl} label="WhatsApp" icon={<MessageCircle aria-hidden="true" size={20} />} />}
              {config.systemUrl && <ExternalAction href={config.systemUrl} label="Conheça o FlyFoods" icon={<ExternalLink aria-hidden="true" size={20} />} />}
              {config.extraLinks.map((link) => <ExternalAction key={`${link.label}:${link.url}`} href={link.url} label={link.label} icon={<ExternalLink aria-hidden="true" size={20} />} />)}
            </nav>
          </section>
          <picture className={styles.hero}>
            <source media="(min-width: 720px)" srcSet={imageUrl(config.tenantSlug, config.heroDesktop)}
              width={config.heroDesktop.width} height={config.heroDesktop.height} />
            <img src={imageUrl(config.tenantSlug, config.heroMobile)} alt={config.heroAlt}
              width={config.heroMobile.width} height={config.heroMobile.height}
              fetchPriority="high" loading="eager" decoding="async" />
          </picture>
        </div>
      </div>
    </main>
  );
}
