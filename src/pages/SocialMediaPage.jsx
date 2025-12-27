import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Instagram, Twitter, Linkedin, Youtube, Facebook, Globe, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

const platforms = [
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/rentolebanon/?hl=en',
    icon: Instagram,
    gradient: 'from-pink-500 to-purple-500'
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=61585450048575',
    icon: Facebook,
    gradient: 'from-pink-500 to-purple-500'
  },
  {
    name: 'Twitter / X',
    url: 'https://x.com/RENTO_lb',
    icon: Twitter,
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/company/rento-lb/about/',
    icon: Linkedin,
    gradient: 'from-blue-700 to-blue-500'
  },
  {
    name: 'Pinterest',
    url: 'https://www.pinterest.com/rento1065/',
    icon: Bookmark,
    gradient: 'from-red-500 to-rose-500'
  },
  {
    name: 'Tiktok',
    url: 'https://www.tiktok.com/@rentolebanon',
    icon: Bookmark,
    gradient: 'from-black-500 to-white-500'
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/channel/UCW1dt_Y0qq0oczELUoGDI7Q',
    icon: Youtube,
    gradient: 'from-red-600 to-red-400'
  }
];

export function SocialMediaPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-teal-950 py-20 px-4">
      <div className="container mx-auto max-w-4xl text-center mb-16">
        <Badge className="mb-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0 px-6 py-2 text-sm font-bold shadow-lg">
          Official Rento LB Social Media
        </Badge>

        <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-6">
          Stay Connected With
          <span className="block bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">Rento Lebanon</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Follow us on all platforms for updates, new car listings, offers, and more.
        </p>
      </div>

      {/* Social Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 container mx-auto max-w-5xl">
        {platforms.map((platform, idx) => (
          <Card
            key={idx}
            className="group border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-teal-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <CardContent className="p-6 text-center">

              {/* Icon */}
              <div
                className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${platform.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <platform.icon className="w-12 h-12 text-white" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {platform.name}
              </h2>

              {/* Button */}
              <a href={platform.url} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  Visit Page
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </a>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
