export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.housecam.ar");

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

export const defaultSocialImage = {
  url: absoluteUrl("/android-icon-192x192.png"),
  width: 192,
  height: 192,
  alt: "HouseCam",
};
