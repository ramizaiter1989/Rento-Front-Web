import React from 'react';
import { Helmet } from 'react-helmet-async';
import { partners } from './partners';

export const SEO = () => {
  const faqsByLanguage = {
    en: [
      { question: "How do I rent a car on Rento LB?", answer: "Browse cars from our trusted partners, select your vehicle, and complete your booking online." },
      { question: "Can I cancel or modify my car rental?", answer: "Cancellation or modification policies depend on the provider. Check your booking details for specific rules." },
    ],
    fr: [
      { question: "Comment louer une voiture sur Rento LB ?", answer: "Parcourez les voitures de nos partenaires de confiance, sélectionnez votre véhicule et finalisez la réservation en ligne." },
      { question: "Puis-je annuler ou modifier ma location de voiture ?", answer: "Les politiques d'annulation ou de modification dépendent du fournisseur. Vérifiez les détails de votre réservation pour connaître les règles spécifiques." },
    ],
    ar: [
      { question: "كيف أحجز سيارة على Rento LB؟", answer: "تصفح السيارات من شركائنا الموثوقين، اختر سيارتك وأكمل الحجز عبر الإنترنت." },
      { question: "هل يمكنني إلغاء أو تعديل الحجز؟", answer: "سياسات الإلغاء أو التعديل تعتمد على المزود. تحقق من تفاصيل حجزك لمعرفة القواعد المحددة." },
    ],
    it: [
      { question: "Come posso noleggiare un'auto su Rento LB?", answer: "Sfoglia le auto dei nostri partner di fiducia, seleziona il veicolo e completa la prenotazione online." },
      { question: "Posso cancellare o modificare il noleggio?", answer: "Le politiche di cancellazione o modifica dipendono dal fornitore. Controlla i dettagli della prenotazione per le regole specifiche." },
    ],
    da: [
      { question: "Hvordan lejer jeg en bil på Rento LB?", answer: "Gennemse biler fra vores betroede partnere, vælg dit køretøj og fuldfør din booking online." },
      { question: "Kan jeg annullere eller ændre min biludlejning?", answer: "Afbestillings- eller ændringspolitikker afhænger af udbyderen. Tjek dine bookingoplysninger for specifikke regler." },
    ],
    de: [
      { question: "Wie miete ich ein Auto bei Rento LB?", answer: "Durchsuchen Sie Autos von unseren vertrauenswürdigen Partnern, wählen Sie Ihr Fahrzeug und schließen Sie die Buchung online ab." },
      { question: "Kann ich meine Autovermietung stornieren oder ändern?", answer: "Stornierungs- oder Änderungsrichtlinien hängen vom Anbieter ab. Überprüfen Sie Ihre Buchungsdetails für spezifische Regeln." },
    ],
    es: [
      { question: "¿Cómo alquilo un coche en Rento LB?", answer: "Explora coches de nuestros socios de confianza, selecciona tu vehículo y completa la reserva en línea." },
      { question: "¿Puedo cancelar o modificar mi alquiler de coche?", answer: "Las políticas de cancelación o modificación dependen del proveedor. Consulta los detalles de tu reserva para reglas específicas." },
    ],
    zh: [
      { question: "如何在Rento LB租车？", answer: "浏览我们可信赖合作伙伴的车辆，选择您的车辆并在线完成预订。" },
      { question: "我可以取消或修改租车吗？", answer: "取消或修改政策取决于提供商。请查看您的预订详情以获取具体规则。" },
    ],
  };

  // Structured Data with detailed services/prices per car type
  const jsonLdCarRental = {
    "@context": "https://schema.org",
    "@type": "CarRental",
    "name": "Rento LB",
    "url": "https://rento-lb.com",
    "logo": "https://rento-lb.com/rentologo.png",
    "image": "https://rento-lb.com/rentologo.jpg",
    "description": "Rento LB aggregates premium car rentals in Lebanon. Choose from over 10,000 vehicles from trusted partners.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Your Street Address",
      "addressLocality": "Beirut",
      "addressRegion": "Lebanon",
      "postalCode": "1000",
      "addressCountry": "LB"
    },
    "telephone": "+961-03520427",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.7",
      "reviewCount": "350"
    },
    "service": partners.map(p => ({
      "@type": "Service",
      "name": `${p.name} Car Rental`,
      "description": `Rent a car from ${p.name} via Rento LB.`,
      "offers": [
        {
          "@type": "Offer",
          "name": "Economy Car",
          "price": "50",
          "priceCurrency": "USD",
          "priceValidUntil": "2026-12-31",
          "url": p.url
        },
        {
          "@type": "Offer",
          "name": "SUV",
          "price": "80",
          "priceCurrency": "USD",
          "priceValidUntil": "2026-12-31",
          "url": p.url
        },
        {
          "@type": "Offer",
          "name": "Luxury Car",
          "price": "150",
          "priceCurrency": "USD",
          "priceValidUntil": "2026-12-31",
          "url": p.url
        },
        {
          "@type": "Offer",
          "name": "Sports Car",
          "price": "200",
          "priceCurrency": "USD",
          "priceValidUntil": "2026-12-31",
          "url": p.url
        }
      ]
    }))
  };

  const jsonLdOriginal = {
    "@context": "https://schema.org",
    "@type": "CarRental",
    "name": "Rento LB",
    "url": "https://rento-lb.com",
    "logo": "https://rento-lb.com/rentologo.png",
    "image": "https://rento-lb.com/rentologo.jpg",
    "description": "Rento LB aggregates premium car rentals in Lebanon. Choose from over 10,000 vehicles from trusted partners.",
    "provider": partners.map(p => ({
      "@type": "CarRental",
      "name": p.name,
      "url": p.url
    }))
  };

  // Main JSON-LD with all necessary information
  const mainJsonLd = {
    "@context": "https://schema.org",
    "@type": "CarRental",
    "name": "Rento LB",
    "url": "https://rento-lb.com",
    "logo": "https://rento-lb.com/rentologo.png",
    "image": "https://rento-lb.com/rentologo.jpg",
    "description": "Rento LB is Lebanon's only web app for premium car rentals. Choose from over 10,000 vehicles, filter and search to find your ideal ride today.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Your Street Address",
      "addressLocality": "Beirut",
      "addressRegion": "Lebanon",
      "postalCode": "1000",
      "addressCountry": "LB"
    },
    "telephone": "+961-03520427",
    "sameAs": [
      "https://www.facebook.com/rento-lb",
      "https://www.instagram.com/rento-lb",
      "https://twitter.com/rento-lb"
    ],
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://rento-lb.com/search?query={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.7",
      "reviewCount": "350"
    }
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang="en" />
      <title>Rento LB | Premium Car Rentals Lebanon – 10,000+ Cars Available</title>
      <meta name="title" content="Rento LB | Premium Car Rentals Lebanon – 10,000+ Cars Available" />
      <meta name="description" content="Rento LB is Lebanon's only web app for premium car rentals. Choose from over 10,000 vehicles, filter and search to find your ideal ride today." />
      <meta name="keywords" content="car rental Lebanon, rent a car Lebanon, luxury cars Lebanon, SUV rental Lebanon, sports cars Lebanon, premium car rentals, 10000+ cars Lebanon, online car booking Lebanon, filter cars Lebanon" />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Alternate Languages */}
      <link rel="alternate" href="https://rento-lb.com" hreflang="en" />
      <link rel="alternate" href="https://rento-lb.com" hreflang="fr" />
      <link rel="alternate" href="https://rento-lb.com" hreflang="ar" />
      <link rel="alternate" href="https://rento-lb.com" hreflang="it" />
      <link rel="alternate" href="https://rento-lb.com" hreflang="da" />
      <link rel="alternate" href="https://rento-lb.com" hreflang="de" />
      <link rel="alternate" href="https://rento-lb.com" hreflang="es" />
      <link rel="alternate" href="https://rento-lb.com" hreflang="zh" />
      <link rel="alternate" hrefLang="x-default" href="https://rento-lb.com" />

      {/* Language-Specific Meta Tags */}
      <meta property="og:locale:alternate" content="fr_FR" />
      <meta property="og:locale:alternate" content="ar_AR" />
      <meta property="og:locale:alternate" content="it_IT" />
      <meta property="og:locale:alternate" content="da_DK" />
      <meta property="og:locale:alternate" content="de_DE" />
      <meta property="og:locale:alternate" content="es_ES" />
      <meta property="og:locale:alternate" content="zh_CN" />

      {/* French Meta */}
      <meta property="og:title:fr" content="Rento LB | Location de voitures premium au Liban – Plus de 10 000 voitures" />
      <meta property="og:description:fr" content="Rento LB est la seule application web au Liban pour la location de voitures premium. Choisissez parmi plus de 10 000 véhicules et réservez votre voiture idéale dès aujourd'hui." />

      {/* Arabic Meta */}
      <meta property="og:title:ar" content="Rento LB | تأجير سيارات فاخرة في لبنان – أكثر من 10000 سيارة" />
      <meta property="og:description:ar" content="Rento LB هو التطبيق الوحيد في لبنان لتأجير السيارات الفاخرة. اختر من بين أكثر من 10,000 سيارة وابحث واحجز سيارتك المثالية اليوم." />

      {/* Italian Meta */}
      <meta property="og:title:it" content="Rento LB | Noleggio Auto di Lusso in Libano – Oltre 10.000 Auto Disponibili" />
      <meta property="og:description:it" content="Rento LB è l'unica web app in Libano per il noleggio di auto di lusso. Scegli tra oltre 10.000 veicoli, filtra e cerca l'auto ideale oggi stesso." />

      {/* Danish Meta */}
      <meta property="og:title:da" content="Rento LB | Premium Biludlejning i Libanon – Over 10.000 Biler Tilgængelige" />
      <meta property="og:description:da" content="Rento LB er Libanons eneste webapp til premium biludlejning. Vælg mellem over 10.000 køretøjer, filtrer og søg for at finde dit ideelle køretøj i dag." />

      {/* German Meta */}
      <meta property="og:title:de" content="Rento LB | Premium Autovermietung im Libanon – Über 10.000 Autos verfügbar" />
      <meta property="og:description:de" content="Rento LB ist die einzige Web-App im Libanon für Premium-Autovermietungen. Wählen Sie aus über 10.000 Fahrzeugen und finden Sie Ihr ideales Auto noch heute." />

      {/* Spanish Meta */}
      <meta property="og:title:es" content="Rento LB | Alquiler de Autos Premium en Líbano – Más de 10.000 Autos Disponibles" />
      <meta property="og:description:es" content="Rento LB es la única aplicación web en Líbano para alquiler de autos premium. Elige entre más de 10,000 vehículos y encuentra tu auto ideal hoy mismo." />

      {/* Chinese Meta */}
      <meta property="og:title:zh" content="Rento LB | 黎巴嫩高端汽车租赁 – 超过10,000辆汽车可选" />
      <meta property="og:description:zh" content="Rento LB是黎巴嫩唯一的高端汽车租赁网络应用。超过10,000辆汽车可供选择，可搜索和筛选找到理想车辆。" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://rento-lb.com" />
      <meta property="og:title" content="Rento LB | Premium Car Rentals Lebanon – 10,000+ Cars Available" />
      <meta property="og:description" content="Rento LB is Lebanon's only web app for premium car rentals. Choose from over 10,000 vehicles, filter and search to find your ideal ride today." />
      <meta property="og:image" content="https://rento-lb.com/rentologo.jpg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Rento LB" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@rento_lb" />
      <meta name="twitter:creator" content="@rento_lb" />
      <meta name="twitter:url" content="https://rento-lb.com" />
      <meta name="twitter:title" content="Rento LB | Premium Car Rentals Lebanon – 10,000+ Cars Available" />
      <meta name="twitter:description" content="Rento LB is Lebanon's only web app for premium car rentals. Choose from over 10,000 vehicles, filter and search to find your ideal ride today." />
      <meta name="twitter:image" content="https://rento-lb.com/twitter-image.jpg" />
      <meta name="twitter:image:alt" content="Rento LB - Premium Car Rentals in Lebanon" />

      {/* Canonical */}
      <link rel="canonical" href="https://rento-lb.com" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(mainJsonLd)}
      </script>

      {/* Car Rental Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLdCarRental)}
      </script>

      {/* Original Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLdOriginal)}
      </script>

      {/* FAQ Structured Data per language */}
      {Object.entries(faqsByLanguage).map(([lang, faqs]) => {
        const faqJsonLd = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(f => ({
            "@type": "Question",
            "name": f.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": f.answer
            }
          }))
        };
        return (
          <script key={lang} type="application/ld+json">
            {JSON.stringify(faqJsonLd)}
          </script>
        );
      })}
    </Helmet>
  );
};
