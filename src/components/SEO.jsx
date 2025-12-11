import React from 'react';
import { partners } from './partners';

export const SEO = () => {
  // Toggle this to true ONLY if you actually have these ratings visible on the site
  const INCLUDE_AGGREGATE_RATING = false;

  // Category labels for offers
  const OFFER_CATEGORIES = ['Economy', 'SUV', 'Luxury', 'Sports'];

  // Multilingual FAQs
  const faqsByLanguage = {
    en: [
      {
        question: 'How do I rent a car on Rento LB?',
        answer:
          "Rento LB makes car rental easy. Simply browse our selection of 10,000+ vehicles from trusted agencies and private owners, select your preferred car, choose your rental dates, and complete your booking online in just a few clicks. Our platform aggregates options from top providers so you get the best selection and prices in Lebanon.",
      },
      {
        question: 'What types of cars are available for rent in Lebanon?',
        answer:
          'We offer a wide range of vehicles including economy cars (from $50/day), SUVs (from $80/day), luxury cars (from $150/day), and sports cars (from $200/day). Whether you need a compact car for city driving, a spacious SUV for family trips, or a premium vehicle for special occasions, Rento LB has options from agencies and private owners across Lebanon including Beirut, Tripoli, and other major cities.',
      },
      {
        question: 'Can I modify or cancel my car rental booking?',
        answer:
          'Modification and cancellation policies vary by provider. Most bookings can be modified or cancelled free of charge up to 24–48 hours before pickup. We recommend checking your booking confirmation email for specific terms or contacting our 24/7 customer support team at +961-81001301 for assistance with any changes to your reservation.',
      },
    ],
    fr: [
      {
        question: 'Comment louer une voiture sur Rento LB ?',
        answer:
          "Rento LB simplifie la location de voitures. Parcourez notre sélection de plus de 10 000 véhicules proposés par des agences et des propriétaires privés de confiance, choisissez votre voiture préférée, sélectionnez vos dates de location et finalisez votre réservation en ligne en quelques clics. Notre plateforme agrège les options des meilleurs fournisseurs pour vous offrir le meilleur choix et les meilleurs prix au Liban.",
      },
      {
        question: 'Quels types de voitures sont disponibles à la location au Liban ?',
        answer:
          "Nous proposons une large gamme de véhicules incluant des voitures économiques (à partir de 50$/jour), des SUV (à partir de 80$/jour), des voitures de luxe (à partir de 150$/jour) et des voitures de sport (à partir de 200$/jour). Que vous ayez besoin d'une voiture compacte pour la ville, d'un SUV spacieux pour des voyages en famille ou d'un véhicule premium pour des occasions spéciales, Rento LB propose des options d'agences et de particuliers dans tout le Liban.",
      },
    ],
    ar: [
      {
        question: 'كيف أحجز سيارة على Rento LB؟',
        answer:
          'يجعل Rento LB تأجير السيارات سهلاً. ببساطة تصفح اختيارنا الذي يضم أكثر من 10,000 مركبة من وكالات موثوقة ومالكين خاصين، اختر سيارتك المفضلة، حدد تواريخ التأجير، وأكمل حجزك عبر الإنترنت في بضع نقرات فقط. تجمع منصة Rento LB بين خيارات من أفضل مزودي الخدمة لتقدم لك أفضل اختيار وأسعار في لبنان.',
      },
      {
        question: 'ما أنواع السيارات المتاحة للتأجير في لبنان؟',
        answer:
          'نقدم مجموعة واسعة من المركبات بما في ذلك السيارات الاقتصادية (ابتداءً من 50 دولارًا في اليوم)، والسيارات الرياضية متعددة الاستخدامات (ابتداءً من 80 دولارًا في اليوم)، والسيارات الفاخرة (ابتداءً من 150 دولارًا في اليوم)، والسيارات الرياضية (ابتداءً من 200 دولار في اليوم). سواء كنت بحاجة إلى سيارة صغيرة للتنقل في المدينة، أو سيارة رياضية متعددة الاستخدامات لرحلات العائلة، أو سيارة فاخرة لمناسبات خاصة، فإن Rento LB يوفر خيارات من الوكالات والمستأجرين الخاصين في جميع أنحاء لبنان.',
      },
    ],
  };

  // LocalBusiness Schema - PRIMARY for Google Search presence and logo display
  const localBusinessData = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'CarRental', 'RentalCarAgency'],
    '@id': 'https://rento-lb.com/#identity',
    name: 'Rento LB',
    url: 'https://rento-lb.com/',
    image: 'https://rento-lb.com/rentologo.jpg',
    logo: 'https://rento-lb.com/rentologo.png',
    telephone: '+961-81001301',
    email: 'social@rento-lb.com',
    priceRange: '$$',
    description:
      'Car rental Lebanon aggregator connecting travelers with agencies and private owners. 10,000+ vehicles with transparent pricing, real-time availability, and 24/7 support across Beirut, Tripoli, and Sidon.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'city center',
      addressLocality: 'Beirut',
      addressRegion: 'Beirut Governorate',
      postalCode: '1000',
      addressCountry: {
        '@type': 'Country',
        name: 'LB',
        isoCode: 'LB',
      },
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 33.8547,
      longitude: 35.8623,
    },
    areaServed: [
      { '@type': 'City', name: 'Beirut' },
      { '@type': 'City', name: 'Tripoli' },
      { '@type': 'City', name: 'Sidon' },
      { '@type': 'City', name: 'Byblos' },
      { '@type': 'City', name: 'Bekaa' },
      { '@type': 'City', name: 'Mont Liban' },
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+961-81001301',
        contactType: 'customer service',
        areaServed: 'LB',
        availableLanguage: ['en', 'fr', 'ar'],
        contactOption: 'TollFree',
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ],
          opens: '00:00',
          closes: '23:59',
        },
      },
    ],
    sameAs: [
      'https://www.facebook.com/profile.php?id=61584938841683',
      'https://www.instagram.com/rento_lebanon/',
      'https://x.com/RENTO_lb',
      'https://www.linkedin.com/company/rento-lb/about/',
    ],
  };

  // WebSite Schema with Search Action
  const webSiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Rento LB',
    url: 'https://rento-lb.com/',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://rento-lb.com/search?query={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // Organization/Offer Catalog Schema
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://rento-lb.com/#organization',
    name: 'Rento LB',
    url: 'https://rento-lb.com/',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Car Rental in Lebanon',
      // Limit the number of offers to avoid an enormous JSON-LD blob
      itemListElement: partners
        .slice(0, 10)
        .flatMap((p) =>
          OFFER_CATEGORIES.map((type) => ({
            '@type': 'Offer',
            name: `${type} Car Rental from ${p.name}`,
            url: p.url,
            category: `CarRental:${type}`,
            offeredBy: {
              '@type': 'Organization',
              name: p.name,
            },
            priceSpecification: {
              '@type': 'PriceSpecification',
              price:
                type === 'Economy'
                  ? '50'
                  : type === 'SUV'
                  ? '80'
                  : type === 'Luxury'
                  ? '150'
                  : '200',
              priceCurrency: 'USD',
              valueAddedTaxIncluded: 'true',
              validFrom: '2023-01-01',
              validThrough: '2026-12-31',
            },
            availability: 'https://schema.org/InStock',
            areaServed: {
              '@type': 'Country',
              name: 'Lebanon',
              isoCode: 'LB',
            },
            itemOffered: {
              '@type': 'Service',
              name: `${type} Car Rental in Lebanon`,
              description: `Rent a ${type.toLowerCase()} car in Lebanon through ${p.name} via Rento LB's platform with 24/7 support and transparent pricing.`,
            },
          }))
        ),
    },
  };

  if (INCLUDE_AGGREGATE_RATING) {
    organizationData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: '4.7',
      reviewCount: '350',
      worstRating: '1',
      bestRating: '5',
    };
  }

  // Specialized car rental data
  const carRentalData = {
    '@context': 'https://schema.org',
    '@type': 'CarRental',
    name: 'Rento LB',
    description:
      "Lebanon's most comprehensive car rental aggregation platform with 10,000+ vehicles from agencies and private owners, serving all major cities including Beirut, Tripoli, Sidon, and Byblos.",
    vehicleType: ['Economy', 'SUV', 'Luxury', 'Sports', 'Electric', 'Hybrid', 'Van', 'Convertible'],
    vehicleTransmission: ['Automatic', 'Manual'],
    vehicleFuelType: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
    vehicleEngine: {
      '@type': 'QuantitativeValue',
      minValue: '1.0',
      maxValue: '6.0',
      unitCode: 'LTR',
    },
    vehicleSeatingCapacity: {
      '@type': 'QuantitativeValue',
      minValue: '2',
      maxValue: '9',
      unitCode: 'C62',
    },
    vehicleDoorCount: {
      '@type': 'QuantitativeValue',
      minValue: '2',
      maxValue: '5',
    },
    pickupLocation: {
      '@type': 'Place',
      name: 'Lebanon Wide',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'LB',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '33.8547',
        longitude: '35.8623',
      },
    },
    dropOffLocation: {
      '@type': 'Place',
      name: 'Lebanon Wide',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'LB',
      },
    },
    pickupType: ['Airport', 'Hotel', 'CityLocation', 'HomeDelivery', 'Office'],
    dropOffType: ['SameAsPickUp', 'DifferentLocation'],
    advanceBookingRequirement: {
      '@type': 'QuantitativeValue',
      minValue: '0',
      maxValue: '365',
      unitCode: 'DAY',
    },
    paymentMethod: ['CreditCard', 'DebitCard', 'Cash', 'MobilePayment', 'BankTransfer'],
    currencyAccepted: ['USD', 'LBP', 'EUR'],
    areaServed: {
      '@type': 'Country',
      name: 'Lebanon',
      isoCode: 'LB',
      containedInPlace: [
        {
          '@type': 'City',
          name: 'Beirut',
        },
        {
          '@type': 'City',
          name: 'Tripoli',
        },
        {
          '@type': 'City',
          name: 'Sidon',
        },
      ],
    },
  };

  return (
    <>
      {/* Basic Meta Tags */}
      <title>
        Rento LB | Rent & Compare Cars in Lebanon | Agencies & Private Owners
      </title>

      <meta
        name="trustpilot-one-time-domain-verification-id"
        content="2ddec9a3-46a7-4ab8-a397-7482d145e508"
      />

      <meta
        name="title"
        content="Rento LB | Rent & Compare Cars in Lebanon | Agencies & Private Owners"
      />

      <meta
        name="description"
        content="Compare and book rental cars in Lebanon from agencies and private owners. 10,000+ vehicles, transparent pricing, real-time availability, and 24/7 support. Economy cars from $50/day, SUVs from $80/day, luxury from $150/day. Serving Beirut, Tripoli, Sidon and all major cities."
      />

      <meta
        name="keywords"
        content="car rental Lebanon, rent a car Beirut, car rental agencies Lebanon, private car rental Lebanon, SUV rental Lebanon, cheap car hire Lebanon, long term car rental Lebanon, airport car rental Beirut, Tripoli car rental, Sidon car rental"
      />

      <meta
        name="robots"
        content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
      />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, minimum-scale=1.0"
      />
      <meta name="theme-color" content="#0d9488" />

      {/* AI-Style Meta Tags (non-standard, harmless) */}
      <meta name="ai:content-type" content="CarRentalService" />
      <meta name="ai:service-area" content="Lebanon" />
      <meta name="ai:service-type" content="VehicleRental" />
      <meta name="ai:availability" content="24/7" />
      <meta name="ai:price-range" content="USD50-USD300" />
      <meta name="ai:currency" content="USD,LBP,EUR" />
      <meta name="ai:language" content="en,fr,ar" />
      <meta
        name="ai:target-audience"
        content="Travelers,Locals,BusinessProfessionals,Tourists,Expats"
      />
      <meta
        name="ai:service-categories"
        content="Transportation,Travel,CarRental,LuxuryServices"
      />

      {/* Alternate Languages */}
      <link rel="alternate" href="https://rento-lb.com" hrefLang="en" />
      <link rel="alternate" href="https://rento-lb.com" hrefLang="fr" />
      <link rel="alternate" href="https://rento-lb.com" hrefLang="ar" />
      <link rel="alternate" hrefLang="x-default" href="https://rento-lb.com" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://rento-lb.com" />
      <meta
        property="og:title"
        content="Rento LB: Lebanon's Premier Car Rental Aggregator | Agencies & Private Owners"
      />
      <meta
        property="og:description"
        content="Compare and book rental cars in Lebanon from agencies and private owners. 10,000+ vehicles, transparent pricing, real-time availability, and 24/7 customer support. Economy cars from $50/day, SUVs from $80/day, luxury from $150/day."
      />
      <meta property="og:image" content="https://rento-lb.com/rentologo.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta
        property="og:image:alt"
        content="Rento LB - Lebanon's Premier Car Rental Aggregator"
      />
      <meta property="og:site_name" content="Rento LB" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="fr_FR" />
      <meta property="og:locale:alternate" content="ar_AR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@RENTO_lb" />
      <meta name="twitter:creator" content="@RENTO_lb" />
      <meta
        name="twitter:title"
        content="Rento LB: Lebanon's Premier Car Rental Aggregator | Agencies & Private Owners"
      />
      <meta
        name="twitter:description"
        content="Compare and book rental cars in Lebanon from agencies and private owners. 10,000+ vehicles with transparent pricing and 24/7 support."
      />
      <meta name="twitter:image" content="https://rento-lb.com/rentologo.png" />
      <meta
        name="twitter:image:alt"
        content="Rento LB - Lebanon's Premier Car Rental Aggregator"
      />

      {/* Canonical */}
      <link rel="canonical" href="https://rento-lb.com" />

      {/* LocalBusiness Schema - PRIMARY for Google Search & Logo Display */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessData) }}
      />

      {/* WebSite Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteData) }}
      />

      {/* Organization/Offer Catalog Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />

      {/* CarRental Detailed Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(carRentalData) }}
      />

      {/* FAQ Structured Data - Single FAQPage with all languages */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: Object.values(faqsByLanguage)
              .flat()
              .map((f) => ({
                '@type': 'Question',
                name: f.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: f.answer,
                },
              })),
          }),
        }}
      />
    </>
  );
};