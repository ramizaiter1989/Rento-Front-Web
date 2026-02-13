/**
 * Meta (Facebook) Pixel helper.
 * Pixel ID is loaded in index.html; use this to track custom events from the app.
 *
 * Standard events: https://developers.facebook.com/docs/meta-pixel/reference
 * e.g. Lead, CompleteRegistration, ViewContent, AddToCart, InitiateCheckout, Purchase
 */

export const META_PIXEL_ID = "882085247864603";

/**
 * Fire a Meta Pixel event (only if fbq is loaded).
 * @param {string} eventName - e.g. 'PageView', 'Lead', 'CompleteRegistration', 'ViewContent'
 * @param {object} [params] - Optional event parameters
 */
export function trackMetaPixel(eventName, params = {}) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", eventName, params);
  }
}

/**
 * Fire a custom Meta Pixel event (for Custom Conversions).
 * @param {string} eventName - Custom event name
 * @param {object} [params] - Optional event parameters
 */
export function trackMetaPixelCustom(eventName, params = {}) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("trackCustom", eventName, params);
  }
}
