export async function shareTableAccess(
  text: string,
  device: Pick<Navigator, "share" | "clipboard">,
): Promise<"shared" | "copied" | "manual" | "canceled"> {
  if (device.share) {
    try { await device.share({ title: "Código da mesa/comanda", text }); return "shared"; }
    catch (error) { if (error instanceof Error && error.name === "AbortError") return "canceled"; }
  }
  try { await device.clipboard.writeText(text); return "copied"; }
  catch { return "manual"; }
}
