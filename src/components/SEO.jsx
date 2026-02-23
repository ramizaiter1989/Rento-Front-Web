import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BASE_URL = 'https://rento-lb.com';

const DEFAULT_TITLE = 'Rento LB | Rent & Compare Cars in Lebanon';
const DEFAULT_DESCRIPTION =
  'Compare rental cars in Lebanon from agencies and private owners. Book easily and communicate directly.';

export const SEO = ({
  noIndex = false,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  ogTitle,
  ogDescription,
  ogImage = `${BASE_URL}/og-cover.png`,
}) => {
  const location = useLocation();
  const canonicalUrl = `${BASE_URL}${location.pathname === '/' ? '' : location.pathname}`;

  useEffect(() => {
    document.title = title;

    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        const parts = selector.match(/\[(\w+)="([^"]+)"\]/g);
        if (parts) {
          parts.forEach((p) => {
            const [, a, v] = p.match(/\[(\w+)="([^"]+)"\]/);
            el.setAttribute(a, v);
          });
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    setMeta('meta[name="robots"]', 'content', noIndex ? 'noindex,nofollow' : 'index,follow');
    setMeta('meta[name="description"]', 'content', description);
    setLink('canonical', canonicalUrl);

    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    setMeta('meta[property="og:title"]', 'content', ogTitle || title);
    setMeta('meta[property="og:description"]', 'content', ogDescription || description);
    setMeta('meta[property="og:image"]', 'content', ogImage);
  }, [noIndex, title, description, canonicalUrl, ogTitle, ogDescription, ogImage]);

  const INCLUDE_AGGREGATE_RATING = false;

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

  const unifiedBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "RentalCarAgency",
    "@id": `${BASE_URL}/#organization`,
    name: "Rento LB",
    alternateName: "Rento Lebanon",
    url: `${BASE_URL}/`,
    logo: {
      "@type": "ImageObject",
      "@id": `${BASE_URL}/#logo`,
      url: `${BASE_URL}/rento-512.png`,
      contentUrl: `${BASE_URL}/rento-512.png`,
      width: 512,
      height: 512
    },
    image: `${BASE_URL}/rento-512.png`,

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

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    name: "Rento LB",
    url: `${BASE_URL}/`,
    publisher: {
      "@id": `${BASE_URL}/#organization`
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/search?query={search_term_string}`,
      "query-input": "required name=search_term_string"
    },
    inLanguage: ["en", "fr", "ar"]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${BASE_URL}/#faq`,
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

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${BASE_URL}/`
      }
    ]
  };

  return (
    <>
      <meta
        name="trustpilot-one-time-domain-verification-id"
        content="2ddec9a3-46a7-4ab8-a397-7482d145e508"
      />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#0d9488" />
      <meta name="author" content="Rento LB" />
      <meta
        name="keywords"
        content="car rental Lebanon, rent a car Beirut, private car rental Lebanon"
      />

      <meta property="og:type" content="website" />

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
