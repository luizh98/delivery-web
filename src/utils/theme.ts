export const DEFAULT_THEME = {
  primaryColor: "#f95c09",
  secondaryColor: "#202321",
};

export function themeForeground(color: string): string {
  const hex = color.replace(/^#/, "");
  if (!/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return "#ffffff";
  const expanded = hex.length === 3 ? hex.split("").map((digit) => digit + digit).join("") : hex;
  const [red, green, blue] = [0, 2, 4].map((offset) => {
    const channel = parseInt(expanded.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  const inkLuminance = 0.016189451028328628; // #202321 in linear sRGB.
  if ((luminance + 0.05) / (inkLuminance + 0.05) >= 4.5) return "#202321";
  return 1.05 / (luminance + 0.05) >= 4.5 ? "#ffffff" : "#000000";
}
