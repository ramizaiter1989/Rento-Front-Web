import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: 'About Us', to: '/about' },
      { label: 'Our Fleet', to: '/cars' },
      { label: 'Contact', to: '/contact' },
      { label: 'Careers', to: '#' },
    ],
    support: [
      { label: 'Help Center', to: '#' },
      { label: 'Safety', to: '#' },
      { label: 'Terms of Service', to: '#' },
      { label: 'Privacy Policy', to: '#' },
    ],
    services: [
      { label: 'Airport Pickup', to: '#' },
      { label: 'Long-term Rental', to: '#' },
      { label: 'Chauffeur Service', to: '#' },
      { label: 'Corporate Plans', to: '#' },
    ],
  };

  const socialLinks = [
    {
      icon: Facebook,
      href: 'https://www.facebook.com/profile.php?id=61584938841683',
      label: 'Facebook',
    },
    { icon: Twitter, href: 'https://x.com/RENTO_lb', label: 'Twitter' },
    {
      icon: Instagram,
      href: 'https://www.instagram.com/rento_lebanon/',
      label: 'Instagram',
    },
    {
      icon: Linkedin,
      href: 'https://www.linkedin.com/company/rento-lb/about/',
      label: 'LinkedIn',
    },
  ];

  // Load Trustpilot script
  useEffect(() => {
    if (
      !document.querySelector(
        'script[src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"]'
      )
    ) {
      const script = document.createElement('script');
      script.src =
        '//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <footer className="mt-16 bg-gradient-to-t from-black via-[#020617] to-[#0B1120] border-t border-slate-800 text-[#F9FAFB]">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#0B1120] flex items-center justify-center border border-slate-700 shadow-md">
                <img
                  src="/rentologo.png"
                  alt="Rento Logo"
                  className="rounded-lg w-7 h-7 object-contain"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#EAB308] via-[#FACC15] to-[#F97316] bg-clip-text text-transparent">
                RENTO LB
              </span>
            </Link>
            <p className="text-sm text-slate-300 mb-4 max-w-sm">
              Experience luxury on the road with our premium fleet of high-end
              vehicles.
            </p>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <MapPin className="w-3 h-3 text-[#EAB308]" />
                <span>Mount Liban, Hazmieh, Lebanon</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3 h-3 text-[#EAB308]" />
                <span>+961 (70) 041-862</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3 h-3 text-[#EAB308]" />
                <span>+961 (03) 520-427</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3 h-3 text-[#EAB308]" />
                <span>social@rento-lb.com</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-3 text-sm text-[#F9FAFB]">
              Company
            </h3>
            <ul className="space-y-1">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-xs text-slate-400 hover:text-[#EAB308] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-sm text-[#F9FAFB]">
              Support
            </h3>
            <ul className="space-y-1">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-xs text-slate-400 hover:text-[#EAB308] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-sm text-[#F9FAFB]">
              Services
            </h3>
            <ul className="space-y-1">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-xs text-slate-400 hover:text-[#EAB308] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-5 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © {currentYear} RENTO LB. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center space-x-2">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-900 hover:bg-[#EAB308] transition-all flex items-center justify-center border border-slate-700 hover:border-[#EAB308]/80 shadow-md"
                aria-label={social.label}
              >
                <social.icon className="w-4 h-4 text-slate-200 group-hover:text-[#020617]" />
              </a>
            ))}
          </div>

          {/* DMCA & Trustpilot */}
          <div className="flex items-center space-x-3">
            <a
              href="//www.dmca.com/Protection/Status.aspx?ID=25eee832-1169-46e9-9a63-19f82b7e1b01"
              title="DMCA.com Protection Status"
              className="dmca-badge"
            >
              <img
                src="https://images.dmca.com/Badges/dmca_protected_sml_120n.png?ID=25eee832-1169-46e9-9a63-19f82b7e1b01"
                alt="DMCA.com Protection Status"
                className="h-6"
              />
            </a>
            <script src="https://images.dmca.com/Badges/DMCABadgeHelper.min.js"></script>

            <a
              href="https://www.trustpilot.com/evaluate/rento-lb.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-[#EAB308] to-[#FACC15] text-[#020617] hover:from-[#FACC15] hover:to-[#EAB308] shadow-md transition-colors"
            >
              Leave a Trustpilot Review
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
