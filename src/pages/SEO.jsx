import React from 'react';
import { Helmet } from 'react-helmet';

export const SEO = () => {
  return (
    <Helmet>
      {/* HTML Language */}
      <html lang="en" />

      {/* Primary Meta Tags (English) */}
      <title>Rent a Car in Lebanon | Premium Car Rentals</title>
      <meta name="title" content="Rent a Car in Lebanon | Premium Car Rentals" />
      <meta name="description" content="Rent the best cars in Lebanon with ease. Luxury, SUV, and economy cars available. Book online today for fast and secure car rental." />
      <meta name="keywords" content="rent a car Lebanon, car rental Lebanon, luxury cars Lebanon, SUV rental Lebanon, affordable car rental Lebanon" />

      {/* Alternate languages (hreflang) */}
      <link rel="alternate" href="https://yourwebsite.com/en" hreflang="en" />
      <link rel="alternate" href="https://yourwebsite.com/fr" hreflang="fr" />
      <link rel="alternate" href="https://yourwebsite.com/ar" hreflang="ar" />

      {/* French Meta */}
      <meta name="title:fr" content="Louer une voiture au Liban | Location de voitures premium" />
      <meta name="description:fr" content="Louez les meilleures voitures au Liban facilement. Voitures de luxe, SUV et économiques disponibles. Réservez en ligne dès aujourd'hui pour une location rapide et sécurisée." />

      {/* Arabic Meta */}
      <meta name="title:ar" content="تأجير سيارات في لبنان | تأجير سيارات فاخرة" />
      <meta name="description:ar" content="استأجر أفضل السيارات في لبنان بسهولة. سيارات فاخرة، SUV، واقتصادية متاحة. احجز عبر الإنترنت اليوم لتأجير سريع وآمن." />

      {/* Open Graph / Facebook (English default) */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://yourwebsite.com/en" />
      <meta property="og:title" content="Rent a Car in Lebanon | Premium Car Rentals" />
      <meta property="og:description" content="Rent the best cars in Lebanon with ease. Luxury, SUV, and economy cars available. Book online today for fast and secure car rental." />
      <meta property="og:image" content="https://yourwebsite.com/og-image.jpg" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="https://yourwebsite.com/en" />
      <meta property="twitter:title" content="Rent a Car in Lebanon | Premium Car Rentals" />
      <meta property="twitter:description" content="Rent the best cars in Lebanon with ease. Luxury, SUV, and economy cars available. Book online today for fast and secure car rental." />
      <meta property="twitter:image" content="https://yourwebsite.com/twitter-image.jpg" />

      {/* Canonical */}
      <link rel="canonical" href="https://yourwebsite.com/en" />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "CarRental",
            "name": "Premium Car Rentals Lebanon",
            "url": "https://yourwebsite.com/en",
            "logo": "https://yourwebsite.com/logo.png",
            "image": "https://yourwebsite.com/og-image.jpg",
            "description": "Rent the best cars in Lebanon with ease. Luxury, SUV, and economy cars available. Book online today for fast and secure car rental.",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Beirut",
              "addressRegion": "Lebanon",
              "postalCode": "1000",
              "streetAddress": "Your Street Address"
            },
            "telephone": "+961-XXXXXXXXX",
            "sameAs": [
              "https://www.facebook.com/yourpage",
              "https://www.instagram.com/yourpage",
              "https://twitter.com/yourpage"
            ]
          }
        `}
      </script>
    </Helmet>
  );
};
