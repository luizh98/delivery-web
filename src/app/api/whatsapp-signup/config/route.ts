import { NextResponse } from "next/server";
import { centralSignupConfig } from "@/views/AdminSettings/whatsappCentralSignup";

export const dynamic = "force-dynamic";

export function GET() {
  try {
    return NextResponse.json(centralSignupConfig(process.env.WHATSAPP_SIGNUP_ORIGIN, process.env.WHATSAPP_SIGNUP_TENANT_DOMAIN), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ message: "A conexão centralizada precisa de configuração. Contate o suporte." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
