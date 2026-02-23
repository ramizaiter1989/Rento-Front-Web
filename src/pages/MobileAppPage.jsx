import React from "react";
import { handleMobileAppStoreClick, STORE_URLS } from "@/lib/mobileAppClick";

const PLAY_STORE_URL = STORE_URLS.playstore;
const APP_STORE_URL = STORE_URLS.appstore;

const mobileAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Rento LB",
  operatingSystem: "iOS, Android",
  applicationCategory: "TravelApplication",
  description:
    "Book rental cars in Lebanon on the go. Compare prices from agencies and private owners.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  installUrl: [PLAY_STORE_URL, APP_STORE_URL],
  publisher: {
    "@id": "https://rento-lb.com/#organization",
  },
  image: "https://rento-lb.com/mobileapp.png",
};

export function MobileAppPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mobileAppSchema) }}
      />
      <div className="w-full max-w-5xl mx-auto space-y-2">
        <div className="text-center space-y-5">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Rento LB Mobile App
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Book cars on the go with our mobile app on both{" "}
            <span className="font-semibold">Google Play</span> and{" "}
            <span className="font-semibold">Apple App Store</span>.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {/* Google Play block */}
          <a
            href={STORE_URLS["playstore"]}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-6 p-4"
            onClick={(e) => handleMobileAppStoreClick(e, "playstore")}
          >
            <div className="w-full flex justify-center mobile-phone-3d">
              <img
                src="/mobileapp.png"
                alt="Rento LB mobile app preview for Google Play"
              />
            </div>
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                Get it on
              </p>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Get it on Google Play"
                width="135"
                height="40"
                className="h-10 sm:h-12"
              />
            </div>
          </a>

          {/* App Store block */}
          <a
            href={STORE_URLS["appstore"]}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-6 p-4"
            onClick={(e) => handleMobileAppStoreClick(e, "appstore")}
          >
            <div className="w-full flex justify-center mobile-phone-3d">
              <img
                src="/mobileapp.png"
                alt="Rento LB mobile app preview for App Store"
              />
            </div>
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700 dark:text-sky-400">
                Download on the
              </p>
              <img
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="Download on the App Store"
                width="120"
                height="40"
                className="h-10 sm:h-12"
              />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

export default MobileAppPage;
