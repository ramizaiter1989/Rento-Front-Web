import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: 'About Us', to: '/about' },
      { label: 'Our Fleet', to: '/cars' },
      { label: 'Contact', to: '/contact' },
      { label: 'Careers', to: '#' }
    ],
    support: [
      { label: 'Help Center', to: '#' },
      { label: 'Safety', to: '#' },
      { label: 'Terms of Service', to: '#' },
      { label: 'Privacy Policy', to: '#' }
    ],
    services: [
      { label: 'Airport Pickup', to: '#' },
      { label: 'Long-term Rental', to: '#' },
      { label: 'Chauffeur Service', to: '#' },
      { label: 'Corporate Plans', to: '#' }
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61584938841683", label: "Facebook" },
    { icon: Twitter, href: "https://x.com/RENTO_lb", label: "Twitter" },
    { icon: Instagram, href: "https://www.instagram.com/rento_lebanon/", label: "Instagram" },
    { icon: Linkedin, href: "https://www.linkedin.com/company/rento-lb/about/", label: "LinkedIn" }
  ];

  // Optional: Load Trustpilot script for advanced widget (if needed)
  useEffect(() => {
    if (!document.querySelector('script[src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"]')) {
      const script = document.createElement('script');
      script.src = '//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-3">
              <img src="/rentologo.png" alt="Rento Logo" className="rounded-lg w-8 h-8 object-contain" />
              <span className="text-xl font-bold gradient-text">RENTO LB</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Experience luxury on the road with our premium fleet of high-end vehicles.
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center space-x-2">
                <MapPin className="w-3 h-3 text-secondary" />
                <span>Mount Liban, Hazmieh, Lebanon</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3 h-3 text-secondary" />
                <span>+961 (70) 041-862</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3 h-3 text-secondary" />
                <span>+961 (03) 520-427</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3 h-3 text-secondary" />
                <span>social@rento-lb.com</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-2 text-sm">Company</h3>
            <ul className="space-y-1">
              {footerLinks.company.map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-muted-foreground hover:text-secondary transition-colors text-xs">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-sm">Support</h3>
            <ul className="space-y-1">
              {footerLinks.support.map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-muted-foreground hover:text-secondary transition-colors text-xs">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-sm">Services</h3>
            <ul className="space-y-1">
              {footerLinks.services.map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-muted-foreground hover:text-secondary transition-colors text-xs">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-4 border-t border-border flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
          <p className="text-xs text-muted-foreground">
            © {currentYear} RENTO LB. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center space-x-2">
            {socialLinks.map(social => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-muted hover:bg-secondary transition-all flex items-center justify-center"
                aria-label={social.label}
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>

          {/* DMCA & Trustpilot */}
          <div className="flex items-center space-x-2">
            <a href="https://www.dmca.com/r/em2gpk5" title="DMCA.com Protection Status" className="dmca-badge">
              <img
                src="https://images.dmca.com/Badges/dmca_protected_sml_120aj.png?ID=25eee832-1169-46e9-9a63-19f82b7e1b01"
                alt="DMCA.com Protection Status"
              />
            </a>
            <script src="https://images.dmca.com/Badges/DMCABadgeHelper.min.js"></script>

            {/* Trustpilot Button */}
            <a
              href="https://www.trustpilot.com/evaluate/rento-lb.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-xs font-medium shadow-md"
            >
              Leave a Trustpilot Review
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
