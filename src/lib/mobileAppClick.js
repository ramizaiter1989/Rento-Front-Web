/**
 * Track mobile app store click and open store URL.
 * Fetches ipapi.co geolocation, POSTs to backend with store identifier, then opens link.
 * Store values: "appstore" (App Store), "playstore" (Play Store)
 */

import { trackMobileAppClick } from "./api";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.rentolb.app&pcampaignid=web_share";
const APP_STORE_URL = "https://apps.apple.com/us/app/rento-lb/id6756906813?l=en-GB";

export const STORE_URLS = { appstore: APP_STORE_URL, playstore: PLAY_STORE_URL };

export async function handleMobileAppStoreClick(e, store) {
  e?.preventDefault?.();
  const url = STORE_URLS[store] || (store === "appstore" ? APP_STORE_URL : PLAY_STORE_URL);
  try {
    const res = await fetch("https://ipapi.co/json");
    const ipData = await res.json();
    await trackMobileAppClick({ ...ipData, store });
  } catch (_) {}
  window.open(url, "_blank", "noopener,noreferrer");
}
