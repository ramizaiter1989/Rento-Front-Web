import React from 'react';
import { partners } from './partners';

export const SEO = ({ noIndex = false }) => {

  const INCLUDE_AGGREGATE_RATING = false;

  /* ===============================
     MULTILINGUAL FAQs (UNCHANGED)
     =============================== */
  const faqsByLanguage = {
    en: [
      {
        question: 'How do I rent a car on Rento LB?',
        answer:
          "Rento LB makes car rental easy. Simply browse our selection of vehicles from trusted agencies and private owners, choose your rental dates, and complete your booking online."
      }
    ],
    fr: [
      {
        question: 'Comment louer une voiture sur Rento LB ?',
        answer:
          "Rento LB simplifie la location de voitures en vous connectant directement avec des agences et propriétaires."
      }
    ],
    ar: [
      {
        question: 'كيف أحجز سيارة على Rento LB؟',
        answer:
          'يمكنك تصفح السيارات المتاحة والتواصل مباشرة مع المالك أو الوكالة.'
      }
    ]
  };

  /* ===============================
     UNIFIED BUSINESS SCHEMA (FIXED)
     =============================== */
  const unifiedBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "RentalCarAgency",
    "@id": "https://rento-lb.com/#organization",
    name: "Rento LB",
    alternateName: "Rento Lebanon",
    url: "https://rento-lb.com/",
    logo: {
      "@type": "ImageObject",
      "@id": "https://rento-lb.com/#logo",
      url: "https://rento-lb.com/rento-512.png",
      contentUrl: "https://rento-lb.com/rento-512.png",
      width: 512,
      height: 512
    },
    image: "https://rento-lb.com/rento-512.png",

    telephone: "+96181001301",
    email: "social@rento-lb.com",

    address: {
      "@type": "PostalAddress",
      streetAddress: "City Center",
      addressLocality: "Beirut",
      addressCountry: "LB"
    },

    areaServed: {
      "@type": "Country",
      name: "Lebanon"
    },

    description:
      "Car rental marketplace in Lebanon connecting renters with private owners and agencies. Transparent pricing and direct communication.",

    priceRange: "$$",
    currenciesAccepted: "USD, LBP",
    paymentAccepted: ["Cash"],

    founder: {
      "@type": "Person",
      name: "Rami Zeaiter"
    },

    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+96181001301",
        contactType: "customer support",
        areaServed: "LB",
        availableLanguage: ["English", "French", "Arabic"]
      }
    ],

    sameAs: [
      "https://www.facebook.com/profile.php?id=61585450048575",
      "https://www.instagram.com/rentolebanon",
      "https://www.tiktok.com/@rentolebanon",
      "https://x.com/RENTO_lb",
      "https://www.linkedin.com/company/rento-lb/about/"
    ],

    ...(INCLUDE_AGGREGATE_RATING && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.7",
        reviewCount: "350"
      }
    })
  };

  /* ===============================
     WEBSITE SCHEMA (UNCHANGED)
     =============================== */
  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://rento-lb.com/#website",
    name: "Rento LB",
    url: "https://rento-lb.com/",
    publisher: {
      "@id": "https://rento-lb.com/#organization"
    },
    potentialAction: {
      "@type": "SearchAction",
      target: "https://rento-lb.com/search?query={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    inLanguage: ["en", "fr", "ar"]
  };

  /* ===============================
     FAQ SCHEMA (UNCHANGED)
     =============================== */
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://rento-lb.com/#faq",
    mainEntity: Object.values(faqsByLanguage)
      .flat()
      .map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer
        }
      }))
  };

  /* ===============================
     BREADCRUMB SCHEMA (UNCHANGED)
     =============================== */
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://rento-lb.com/"
      }
    ]
  };

  return (
    <>
      {/* BASIC META */}
      <title>Rento LB | Rent & Compare Cars in Lebanon</title>

      <meta
        name="trustpilot-one-time-domain-verification-id"
        content="2ddec9a3-46a7-4ab8-a397-7482d145e508"
      />

      <meta
        name="description"
        content="Compare rental cars in Lebanon from agencies and private owners. Book easily and communicate directly."
      />

      <meta
        name="keywords"
        content="car rental Lebanon, rent a car Beirut, private car rental Lebanon"
      />

      <meta
        name="robots"
        content={noIndex ? "noindex,nofollow" : "index,follow"}
      />

      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#0d9488" />
      <meta name="author" content="Rento LB" />

      {/* CANONICAL */}
      <link rel="canonical" href="https://rento-lb.com" />

      {/* OPEN GRAPH */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://rento-lb.com" />
      <meta property="og:title" content="Rento LB | Car Rental in Lebanon" />
      <meta property="og:description" content="Find rental cars across Lebanon." />
      <meta property="og:image" content="https://rento-lb.com/og-cover.png" />

      {/* STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(unifiedBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
};
