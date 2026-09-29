import { AdminPrinterView } from "@/views/AdminPrinter";
import { backendBaseUrl } from "@/constants/api";

export default function AdminPrinterPage() {
  const configuredUrl = process.env.PRINT_CONNECTOR_PUBLIC_API_URL?.trim();
  const serverUrl = configuredUrl || (process.env.NODE_ENV === "development" ? backendBaseUrl() : "");
  let connectorServerUrl: string | null = null;

  try {
    const parsed = new URL(serverUrl);
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
    const localhost = loopback || parsed.hostname.endsWith(".localhost");
    const localDevelopment = process.env.NODE_ENV === "development"
      && parsed.protocol === "http:"
      && loopback;
    if (((parsed.protocol === "https:" && !localhost) || localDevelopment)
      && !parsed.username && !parsed.password && !parsed.search && !parsed.hash
      && parsed.pathname === "/") {
      connectorServerUrl = parsed.origin;
    }
  } catch {
    // Missing or invalid public API URL leaves pairing unavailable.
  }

  return <AdminPrinterView connectorServerUrl={connectorServerUrl} />;
}
