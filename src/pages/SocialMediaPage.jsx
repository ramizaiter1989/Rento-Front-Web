import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Instagram, Twitter, Linkedin, Youtube, Globe, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const platforms = [
  { name: 'Instagram', url: 'https://www.instagram.com/rento_lebanon/', icon: Instagram, gradient: 'from-pink-400 to-purple-600' },
  { name: 'Twitter / X', url: 'https://x.com/RENTO_lb', icon: Twitter, gradient: 'from-blue-400 to-cyan-600' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/company/rento-lb/about/', icon: Linkedin, gradient: 'from-blue-600 to-blue-400' },
  { name: 'Pinterest', url: 'https://www.pinterest.com/rento1065/', icon: Bookmark, gradient: 'from-red-400 to-rose-600' },
  { name: 'YouTube', url: 'https://www.youtube.com/channel/UCW1dt_Y0qq0oczELUoGDI7Q', icon: Youtube, gradient: 'from-red-500 to-red-300' },
  { name: 'TikTok', url: 'https://www.tiktok.com/@rentolb', icon: Globe, gradient: 'from-black via-black to-pink-500' },
  { name: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61584938841683', icon: Globe, gradient: 'from-blue-600 to-blue-400' },
];

const text = "Rento Lebanon";

const letterVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.8,
      ease: "easeOut"
    }
  })
};

export function SocialMediaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-black py-20 px-4 overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto max-w-4xl text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge className="mb-6 bg-gradient-to-r from-teal-400 to-cyan-400 text-white border-0 px-8 py-3 text-base font-bold shadow-xl rounded-full animate-pulse">
            Official Rento LB Social Media
          </Badge>

          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
            Stay Connected With
            <motion.span
              className="block text-6xl md:text-8xl font-extrabold tracking-tight"
              initial="hidden"
              animate="visible"
            >
              {text.split("").map((char, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={letterVariants}
                  className="inline-block bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent"
                  style={{ display: 'inline-block' }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
              {/* Optional blinking cursor at the end */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: text.length * 0.1 + 0.5 }}
                className="inline-block w-1 h-16 md:h-20 bg-cyan-400 ml-2"
              />
            </motion.span>
          </h1>
        </motion.div>
      </div>

      {/* Animated Social Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 container mx-auto max-w-6xl">
        {platforms.map((platform, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.7,
              delay: idx * 0.15,
              ease: "easeOut"
            }}
            whileHover={{ y: -12 }}
            className="group"
          >
            <Card className="relative overflow-hidden border-0 shadow-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl hover:shadow-2xl transition-all duration-500">
              {/* Glowing Border Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-teal-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Floating Particles */}
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-teal-400/30 rounded-full blur-2xl animate-float"></div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl animate-float delay-700"></div>
              </div>

              <CardContent className="p-8 text-center relative z-10">
                {/* Icon with Pulse & Spin on Hover */}
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${platform.gradient} p-4 shadow-2xl flex items-center justify-center`}
                >
                  <platform.icon className="w-10 h-10 text-white" strokeWidth={2} />
                </motion.div>

                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 tracking-wide">
                  {platform.name}
                </h2>

                <a href={platform.url} target="_blank" rel="noopener noreferrer">
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-base flex items-center justify-center gap-3 group/btn"
                  >
                    <motion.span
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      Visit Page
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                    </motion.span>
                  </Button>
                </a>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Custom CSS for animations (add to your globals.css or Tailwind config) */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 8s ease infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .delay-700 { animation-delay: 0.7s; }
        .delay-1000 { animation-delay: 1s; }
      `}</style>
    </div>
  );
}