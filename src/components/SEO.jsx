import React from 'react';
import { partners } from './partners';

export const SEO = () => {
  // Toggle this to true ONLY if you actually have these ratings visible on the site
  const INCLUDE_AGGREGATE_RATING = false;

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

  // UNIFIED Primary Business Schema - RentalCarAgency
  const unifiedBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'RentalCarAgency',
    '@id': 'https://rento-lb.com/#organization',
    name: 'Rento LB',
    alternateName: 'Rento Lebanon',
    legalName: 'RENTO TECHNOLOGIES SOLUTION LTD',
    url: 'https://rento-lb.com/',
    logo: {
      '@type': 'ImageObject',
      '@id': 'https://rento-lb.com/#logo',
      url: 'https://rento-lb.com/rentologo.png',
      contentUrl: 'https://rento-lb.com/rentologo.png',
      width: 1200,
      height: 630,
      caption: 'Rento LB - Lebanon Car Rental Aggregator'
    },
    image: {
      '@type': 'ImageObject',
      url: 'https://rento-lb.com/rentologo.jpg',
      width: 1200,
      height: 630
    },
    
    // Contact Information
    telephone: '+961-81001301',
    email: 'social@rento-lb.com',
    
    // Address & Location
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'city center',
      addressLocality: 'Beirut',
      addressRegion: 'Beirut Governorate',
      postalCode: '1000',
      addressCountry: {
        '@type': 'Country',
        name: 'Lebanon',
        alternateName: 'LB'
      }
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 33.8547,
      longitude: 35.8623
    },
    
    // Service Areas
    areaServed: [
      { 
        '@type': 'City', 
        name: 'Beirut',
        containedInPlace: { '@type': 'Country', name: 'Lebanon' }
      },
      { 
        '@type': 'City', 
        name: 'Tripoli',
        containedInPlace: { '@type': 'Country', name: 'Lebanon' }
      },
      { 
        '@type': 'City', 
        name: 'Sidon',
        containedInPlace: { '@type': 'Country', name: 'Lebanon' }
      },
      { 
        '@type': 'City', 
        name: 'Byblos',
        containedInPlace: { '@type': 'Country', name: 'Lebanon' }
      },
      { 
        '@type': 'City', 
        name: 'Bekaa',
        containedInPlace: { '@type': 'Country', name: 'Lebanon' }
      },
      { 
        '@type': 'AdministrativeArea', 
        name: 'Mont Liban',
        containedInPlace: { '@type': 'Country', name: 'Lebanon' }
      }
    ],
    
    // Business Details
    description:
      'Car rental Lebanon aggregator connecting travelers with agencies and private owners. 10,000+ vehicles with transparent pricing, real-time availability, and 24/7 support across Beirut, Tripoli, and Sidon.',
    priceRange: '$$',
    currenciesAccepted: 'USD, LBP, EUR',
    paymentAccepted: ['Cash', 'Credit Card', 'Debit Card', 'Mobile Payment', 'Bank Transfer'],
    
    // Company Information
    foundingDate: '2024-03-04', // Update this to your actual founding date
    founder: {
      '@type': 'Person',
      name: 'Rami Zeaiter'
    },
    
    // Legal Registration
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'UK Company Registration Number',
      value: '16292007'
    },
    
    // Contact Points
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+961-81001301',
        contactType: 'customer service',
        areaServed: 'LB',
        availableLanguage: ['English', 'French', 'Arabic'],
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
            'Sunday'
          ],
          opens: '00:00',
          closes: '23:59'
        }
      },
      {
        '@type': 'ContactPoint',
        telephone: '+961-81001301',
        contactType: 'reservations',
        areaServed: 'LB',
        availableLanguage: ['English', 'French', 'Arabic']
      }
    ],
    
    // Services Offered - Offer Catalog
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Car Rental Services in Lebanon',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'Economy Car Rentals',
          itemListElement: [
            {
              '@type': 'Offer',
              name: 'Economy Car Rental in Lebanon',
              description: 'Affordable economy cars perfect for city driving and daily commutes across Lebanon.',
              url: 'https://rento-lb.com/search?category=economy',
              category: 'Economy Cars',
              itemOffered: {
                '@type': 'Car',
                name: 'Economy Car',
                vehicleConfiguration: 'Economy',
                fuelType: ['Petrol', 'Diesel', 'Hybrid'],
                vehicleTransmission: ['Automatic', 'Manual'],
                vehicleSeatingCapacity: {
                  '@type': 'QuantitativeValue',
                  value: 5,
                  unitCode: 'C62'
                }
              },
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: '50.00',
                priceCurrency: 'USD',
                unitText: 'DAY',
                minPrice: '50.00',
                maxPrice: '75.00'
              },
              availability: 'https://schema.org/InStock',
              areaServed: { '@type': 'Country', name: 'Lebanon' },
              validFrom: '2024-01-01',
              validThrough: '2026-12-31'
            }
          ]
        },
        {
          '@type': 'OfferCatalog',
          name: 'SUV Rentals',
          itemListElement: [
            {
              '@type': 'Offer',
              name: 'SUV Rental in Lebanon',
              description: 'Spacious SUVs ideal for family trips and mountain adventures in Lebanon.',
              url: 'https://rento-lb.com/search?category=suv',
              category: 'SUV',
              itemOffered: {
                '@type': 'Car',
                name: 'SUV',
                vehicleConfiguration: 'SUV',
                fuelType: ['Petrol', 'Diesel', 'Hybrid'],
                vehicleTransmission: ['Automatic', 'Manual'],
                vehicleSeatingCapacity: {
                  '@type': 'QuantitativeValue',
                  value: 7,
                  unitCode: 'C62'
                }
              },
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: '80.00',
                priceCurrency: 'USD',
                unitText: 'DAY',
                minPrice: '80.00',
                maxPrice: '120.00'
              },
              availability: 'https://schema.org/InStock',
              areaServed: { '@type': 'Country', name: 'Lebanon' },
              validFrom: '2024-01-01',
              validThrough: '2026-12-31'
            }
          ]
        },
        {
          '@type': 'OfferCatalog',
          name: 'Luxury Car Rentals',
          itemListElement: [
            {
              '@type': 'Offer',
              name: 'Luxury Car Rental in Lebanon',
              description: 'Premium luxury vehicles for special occasions and business travel in Lebanon.',
              url: 'https://rento-lb.com/search?category=luxury',
              category: 'Luxury Cars',
              itemOffered: {
                '@type': 'Car',
                name: 'Luxury Car',
                vehicleConfiguration: 'Luxury',
                fuelType: ['Petrol', 'Diesel', 'Hybrid', 'Electric'],
                vehicleTransmission: 'Automatic',
                vehicleSeatingCapacity: {
                  '@type': 'QuantitativeValue',
                  value: 5,
                  unitCode: 'C62'
                }
              },
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: '150.00',
                priceCurrency: 'USD',
                unitText: 'DAY',
                minPrice: '150.00',
                maxPrice: '250.00'
              },
              availability: 'https://schema.org/InStock',
              areaServed: { '@type': 'Country', name: 'Lebanon' },
              validFrom: '2024-01-01',
              validThrough: '2026-12-31'
            }
          ]
        },
        {
          '@type': 'OfferCatalog',
          name: 'Sports Car Rentals',
          itemListElement: [
            {
              '@type': 'Offer',
              name: 'Sports Car Rental in Lebanon',
              description: 'High-performance sports cars for unforgettable driving experiences in Lebanon.',
              url: 'https://rento-lb.com/search?category=sports',
              category: 'Sports Cars',
              itemOffered: {
                '@type': 'Car',
                name: 'Sports Car',
                vehicleConfiguration: 'Sports',
                fuelType: ['Petrol', 'Electric'],
                vehicleTransmission: 'Automatic',
                vehicleSeatingCapacity: {
                  '@type': 'QuantitativeValue',
                  value: 2,
                  unitCode: 'C62'
                }
              },
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: '200.00',
                priceCurrency: 'USD',
                unitText: 'DAY',
                minPrice: '200.00',
                maxPrice: '350.00'
              },
              availability: 'https://schema.org/InStock',
              areaServed: { '@type': 'Country', name: 'Lebanon' },
              validFrom: '2024-01-01',
              validThrough: '2026-12-31'
            }
          ]
        }
      ]
    },
    
    // Social Media Profiles
    sameAs: [
      'https://www.facebook.com/profile.php?id=61584938841683',
      'https://www.instagram.com/rento_lebanon/',
      'https://x.com/RENTO_lb',
      'https://www.linkedin.com/company/rento-lb/about/',
      'https://find-and-update.company-information.service.gov.uk/company/16292007'
    ],
    
    // Aggregate Rating (only if visible on site)
    ...(INCLUDE_AGGREGATE_RATING && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.7',
        reviewCount: '350',
        worstRating: '1',
        bestRating: '5'
      }
    })
  };

  // WebSite Schema with Search Action
  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://rento-lb.com/#website',
    name: 'Rento LB',
    url: 'https://rento-lb.com/',
    description: "Lebanon's premier car rental aggregation platform",
    publisher: {
      '@id': 'https://rento-lb.com/#organization'
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://rento-lb.com/search?query={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    inLanguage: ['en', 'fr', 'ar']
  };

  // FAQ Schema - All languages combined
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': 'https://rento-lb.com/#faq',
    mainEntity: Object.values(faqsByLanguage)
      .flat()
      .map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
  };

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': 'https://rento-lb.com/#breadcrumb',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://rento-lb.com/'
      }
    ]
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
        name="description"
        content="Compare 10,000+ rental cars in Lebanon from agencies & private owners. Economy from $50/day, SUVs from $80/day. Book instantly with 24/7 support across Beirut, Tripoli & all major cities."
      />

      <meta
        name="keywords"
        content="car rental Lebanon, rent a car Beirut, car rental agencies Lebanon, private car rental Lebanon, SUV rental Lebanon, cheap car hire Lebanon, long term car rental Lebanon, airport car rental Beirut, Tripoli car rental, Sidon car rental"
      />

      <meta
        name="robots"
        content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
      />
      
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, minimum-scale=1.0"
      />
      <meta name="theme-color" content="#0d9488" />
      
      <meta name="author" content="Rento LB" />
      <meta name="geo.region" content="LB" />
      <meta name="geo.placename" content="Beirut, Lebanon" />
      <meta name="geo.position" content="33.8547;35.8623" />
      <meta name="ICBM" content="33.8547, 35.8623" />

      {/* Alternate Languages */}
      <link rel="alternate" href="https://rento-lb.com" hrefLang="en" />
      <link rel="alternate" href="https://rento-lb.com" hrefLang="fr" />
      <link rel="alternate" href="https://rento-lb.com" hrefLang="ar" />
      <link rel="alternate" hrefLang="x-default" href="https://rento-lb.com" />

      {/* Canonical */}
      <link rel="canonical" href="https://rento-lb.com" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://rento-lb.com" />
      <meta
        property="og:title"
        content="Rento LB: Lebanon's Premier Car Rental Aggregator | Agencies & Private Owners"
      />
      <meta
        property="og:description"
        content="Compare 10,000+ rental cars in Lebanon from agencies & private owners. Economy from $50/day, SUVs from $80/day. Book instantly with 24/7 support."
      />
      <meta property="og:image" content="https://rento-lb.com/rentologo.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
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
        content="Rento LB: Lebanon's Premier Car Rental Aggregator"
      />
      <meta
        name="twitter:description"
        content="Compare 10,000+ rental cars in Lebanon from agencies & private owners. Book instantly with 24/7 support."
      />
      <meta name="twitter:image" content="https://rento-lb.com/rentologo.png" />
      <meta
        name="twitter:image:alt"
        content="Rento LB - Lebanon Car Rental Platform"
      />

      {/* Structured Data Schemas */}
      
      {/* 1. Unified Business Schema - PRIMARY */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(unifiedBusinessSchema) }}
      />

      {/* 2. WebSite Schema with Search */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />

      {/* 3. FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* 4. Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
};
