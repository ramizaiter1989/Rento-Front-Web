import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Instagram, Twitter, Linkedin, Youtube, Globe, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

const platforms = [
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/rento_lebanon/',
    icon: Instagram,
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
    name: 'YouTube',
    url: 'https://www.youtube.com/channel/UCW1dt_Y0qq0oczELUoGDI7Q',
    icon: Youtube,
    gradient: 'from-red-600 to-red-400'
  },
  {
    name: 'TikTok',
    url: 'https://www.tiktok.com/@rentolb',
    icon: Globe, // You can replace with a TikTok icon if you have one
    gradient: 'from-black to-gray-700'
  },
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/profile.php?id=61584938841683',
    icon: Globe, // Replace with a Facebook icon if available
    gradient: 'from-blue-600 to-blue-400'
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
      </div>

      {/* Social Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 container mx-auto max-w-5xl">
        {platforms.map((platform, idx) => (
            <Card
            key={idx}
            className="group border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-teal-500 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
            <CardContent className="p-4 text-center">

                {/* Icon */}
                <div
                className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br ${platform.gradient} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300`}
                >
                <platform.icon className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {platform.name}
                </h2>

                {/* Button */}
                <a href={platform.url} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 text-sm">
                    Visit Page
                    <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                </a>

            </CardContent>
            </Card>
        ))}
        </div>
    </div>
  );
}
