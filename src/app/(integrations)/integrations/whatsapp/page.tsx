import { headers } from "next/headers";
import { WhatsAppSignupWindow } from "@/views/AdminSettings/WhatsAppSignupWindow";
import { centralSignupConfig } from "@/views/AdminSettings/whatsappCentralSignup";

export const dynamic = "force-dynamic";

export default async function WhatsAppSignupPage() {
  let config = centralSignupConfig();
  try { config = centralSignupConfig(process.env.WHATSAPP_SIGNUP_ORIGIN, process.env.WHATSAPP_SIGNUP_TENANT_DOMAIN); } catch { /* Invalid configuration leaves the page unavailable. */ }
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  if (config.origin && new URL(config.origin).host !== host) config = centralSignupConfig();
  return <WhatsAppSignupWindow config={config} />;
}
