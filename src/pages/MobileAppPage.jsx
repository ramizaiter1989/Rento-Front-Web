import React from "react";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.rentolb.app&pcampaignid=web_share";
const APP_STORE_URL = "https://apps.apple.com/us/app/rento-lb/id6756906813?l=en-GB";

export function MobileAppPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Rento LB Mobile App
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Book cars on the go with our mobile app on both{" "}
            <span className="font-semibold">Google Play</span> and{" "}
            <span className="font-semibold">Apple App Store</span>.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Google Play block */}
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-6 p-4"
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
                className="h-10 sm:h-12"
              />
            </div>
          </a>

          {/* App Store block */}
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-6 p-4"
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
                className="h-10 sm:h-12"
              />
            </div>
          </a>
        </div>

        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Note: Make sure the image file is available at <code>/mobile-app.png</code> in your{" "}
          <code>public</code> folder so that the preview renders correctly.
        </p>
      </div>
    </div>
  );
}

export default MobileAppPage;