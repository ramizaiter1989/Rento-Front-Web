import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Smartphone } from 'lucide-react';
import { handleMobileAppStoreClick } from '@/lib/mobileAppClick';

// Logo colors
const COLORS = {
  darkBlue: '#0A3D6B',
  teal: '#006D73',
  limeGreen: '#4D7C0F',
  darkBlueDim: 'rgba(10, 61, 107, 0.1)',
  tealDim: 'rgba(0, 109, 115, 0.1)',
  limeGreenDim: 'rgba(77, 124, 15, 0.1)',
};

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: 'About Us', to: '/about' },
      { label: 'Our Fleet', to: '/luxury-car-rental-lebanon' },
      { label: 'Contact', to: '/contact' },
      { label: 'Careers', to: '#' }
    ],
    support: [
      { label: 'Help Center', to: '#' },
      { label: 'Safety', to: '#' },
      { label: 'Terms of Service', to: '/Terms-and-Conditions' },
      { label: 'Privacy Policy', to: '/Privacy-Policy' }
    ],
    services: [
      { label: 'Airport Pickup', to: '#' },
      { label: 'Long-term Rental', to: '#' },
      { label: 'Chauffeur Service', to: '#' },
      { label: 'Corporate Plans', to: '#' }
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61585450048575', label: 'Facebook', color: COLORS.darkBlue },
    { icon: Twitter, href: 'https://x.com/RENTO_lb', label: 'Twitter', color: COLORS.teal },
    { icon: Instagram, href: 'https://www.instagram.com/rentolebanon/?hl=en', label: 'Instagram', color: COLORS.limeGreen },
    { icon: Linkedin, href: 'https://www.linkedin.com/company/rento-lb/about/', label: 'LinkedIn', color: COLORS.darkBlue }
  ];

  // Load DMCA helper script
  useEffect(() => {
    const src = 'https://images.dmca.com/Badges/DMCABadgeHelper.min.js';
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) return;

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12">
      <div className="container mx-auto px-4 py-8 sm:py-10">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 lg:gap-8">
          
          {/* Brand Section */}
          <div className="lg:col-span-2 mb-4 sm:mb-0">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <img 
                src="/rentologo.png" 
                alt="Rento Logo" 
                width="40"
                height="40"
                loading="lazy"
                className="rounded-lg w-10 h-10 object-contain" 
              />
              <span 
                className="text-2xl font-bold bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(135deg, ${COLORS.darkBlue}, ${COLORS.teal}, ${COLORS.limeGreen})` }}
              >
                RENTO LB
              </span>
            </Link>

            {/* Contact Info */}
            <div className="space-y-2.5 text-sm">
              {/* Locations */}
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: COLORS.teal }} />
                <div className="flex-1">
                  <p className="text-gray-700 dark:text-gray-300 leading-snug">
                    124-128 City Road, London, England, EC1V 2NX
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: COLORS.teal }} />
                <div className="flex-1">
                  <p className="text-gray-700 dark:text-gray-300 leading-snug">
                    Mount Lebanon, Baouchrieh, Lebanon
                  </p>
                </div>
              </div>

              {/* Phones */}

              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 flex-shrink-0" style={{ color: COLORS.darkBlue }} />
                <a 
                  href="tel:+96181001301" 
                  className="text-gray-700 dark:text-gray-300 hover:underline"
                  style={{ color: COLORS.darkBlue }}
                >
                  +961 (81) 001-301
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 flex-shrink-0" style={{ color: COLORS.limeGreen }} />
                <a 
                  href="mailto:social@rento-lb.com" 
                  className="text-gray-700 dark:text-gray-300 hover:underline"
                  style={{ color: COLORS.limeGreen }}
                >
                  social@rento-lb.com
                </a>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div className="mb-4 sm:mb-0">
            <h3 className="font-bold mb-3 text-base text-gray-900 dark:text-white" style={{ color: COLORS.darkBlue }}>
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.to} 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="mb-4 sm:mb-0">
            <h3 className="font-bold mb-3 text-base text-gray-900 dark:text-white" style={{ color: COLORS.teal }}>
              Support
            </h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.to} 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="font-bold mb-3 text-base text-gray-900 dark:text-white" style={{ color: COLORS.limeGreen }}>
              Services
            </h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.to} 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get the App */}
          <div>
            <h3 className="font-bold mb-3 text-base text-gray-900 dark:text-white flex items-center gap-2" style={{ color: COLORS.teal }}>
              <Smartphone className="w-4 h-4" />
              Get the App
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Book on the go with our mobile app
            </p>
            <Link to="/mobile-app" className="text-xs hover:underline mb-2 block" style={{ color: COLORS.teal }}>
              Download the Rento LB mobile app
            </Link>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#"
                onClick={(e) => handleMobileAppStoreClick(e, "playstore")}
                className="inline-flex items-center justify-center rounded-lg overflow-hidden transition-all hover:scale-105 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                aria-label="Get it on Google Play"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Get it on Google Play"
                  width="135"
                  height="40"
                  className="h-10 w-auto"
                />
              </a>
              <a
                href="#"
                onClick={(e) => handleMobileAppStoreClick(e, "appstore")}
                className="inline-flex items-center justify-center rounded-lg overflow-hidden transition-all hover:scale-105 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                aria-label="Download on the App Store"
              >
                <img
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  alt="Download on the App Store"
                  width="120"
                  height="40"
                  className="h-10 w-auto"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-gray-200 dark:border-gray-800"></div>

        {/* Social Links Section - Mobile Optimized */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 text-center sm:text-left">
            Follow Us
          </h4>
          <div className="flex justify-center sm:justify-start items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-md hover:shadow-lg"
                style={{ background: social.color }}
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5 text-white" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {/* Badges Section - Mobile Optimized */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 text-center sm:text-left">
            Trust & Security
          </h4>
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3">
            
            {/* DMCA Badge */}
            <a
              href="https://www.dmca.com/r/em2gpk5"
              title="DMCA.com Protection Status"
              className="dmca-badge"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://images.dmca.com/Badges/DMCA_logo-std-btn120w.png?ID=25eee832-1169-46e9-9a63-19f82b7e1b01"
                alt="DMCA.com Protection Status"
                width="120"
                height="30"
                className="h-8 w-auto"
              />
            </a>

            {/* Trustpilot Review Button */}
            <a
              href="https://www.trustpilot.com/evaluate/rento-lb.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
              style={{ background: COLORS.teal }}
            >
              ⭐ Trustpilot Review
            </a>

            {/* Google Business Verified */}
            <span 
              className="px-4 py-2 rounded-lg text-white text-xs font-semibold shadow-md"
              style={{ background: COLORS.limeGreen }}
            >
              ✓ Google Verified
            </span>

            {/* UK Company Badge */}
            <a
              href="https://find-and-update.company-information.service.gov.uk/company/16292007"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
              style={{ background: COLORS.darkBlue }}
            >
              🇬🇧 UK Registered
            </a>
          </div>
        </div>

        {/* Bottom Section - Mobile Optimized */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col items-center text-center space-y-3">
            {/* Copyright */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} <span className="font-semibold" style={{ color: COLORS.teal }}>RENTO LB</span>. All rights reserved.
            </p>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
              <Link to="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <Link to="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                Terms of Service
              </Link>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <Link to="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>

            {/* Made with Love */}
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Made with <span className="text-red-500">❤️</span> in Lebanon & UK
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};