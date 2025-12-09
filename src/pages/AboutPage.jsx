import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Users, Globe, Heart, Shield, Clock } from 'lucide-react';

export const AboutPage = () => {
  const values = [
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Your satisfaction and experience are at the heart of everything we do.'
    },
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'All vehicles are fully insured and professionally maintained for maximum safety.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We provide premium-quality cars and top-tier customer service across Lebanon.'
    },
    {
      icon: Globe,
      title: 'Accessibility',
      description: 'Car rental services available across Beirut, airport, and major Lebanese cities.'
    }
  ];

  const stats = [
    { value: '15+', label: 'Years in Car Rental in Lebanon' },
    { value: '10,000+', label: 'Happy Clients' },
    { value: '50+', label: 'Premium Rental Cars' },
    { value: '25', label: 'Lebanese Cities Covered' }
  ];

  const team = [
    {
      name: 'Rami Z.',
      role: 'Co-Founder',
      image: 'https://media.licdn.com/dms/image/v2/D4D03AQE-SI2RbsIKJg/profile-displayphoto-scale_400_400/B4DZkR13KuIEAw-/0/1756940957455?e=1766620800&v=beta&t=zeHYUyUBfpn25qt5t5noPx63zsRssAtxFJfix_St0u8',
      bio: 'Expert in the Lebanese car rental industry for over 15 years.'
    },
    {
      name: 'Ali Z.',
      role: 'Operations Director',
      image: 'https://i.pravatar.cc/200?img=1',
      bio: 'Specialist in fleet management and customer satisfaction.'
    },
    {
      name: 'Dib Bailoun',
      role: 'Fleet Manager',
      image: 'https://media.licdn.com/dms/image/v2/D4E03AQG5-k6KT0xAkQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1676234982153?e=1766620800&v=beta&t=9DRUyjBNMmfBBksjIy_xP0VADrIcR6ikoHK2R8bUPjM',
      bio: 'Ensures all cars meet the highest maintenance and safety standards.'
    },
    {
      name: 'Ahmad',
      role: 'Customer Relations',
      image: 'https://i.pravatar.cc/200?img=1',
      bio: 'Dedicated to providing fast and friendly rental service.'
    }
  ];

  return (
    <div className="min-h-screen pt-20">

      {/* SEO Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CarRental",
          "name": "Rento LB",
          "url": "https://rento-lb.com",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "LB",
            "addressLocality": "Beirut",
            "streetAddress": "Beirut, Lebanon"
          },
          "description": "Rent a car in Lebanon – luxury, SUV, sedan, economy cars. Beirut airport delivery. Affordable daily and monthly prices.",
          "openingHours": "Mo-Su 00:00-23:59",
          "telephone": "+961 81 001301",
          "image": "https://rento-lb.com/og-image.jpg",
        })}
      </script>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20">
              About Rento LB
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              The #1 Car Rental Company in Lebanon
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              RENTO LB provides premium, affordable, and reliable car rental services across Lebanon.
              With 15+ years of experience, we offer luxury, SUV, and economy cars with airport pickup,
              24/7 support, and delivery anywhere in Beirut and surrounding cities.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold gradient-text-accent mb-2">
                  {stat.value}
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            <div>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                Our Story
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Leading the Car Rental Industry in Lebanon
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Rento LB started with a mission to offer safe, reliable, and affordable car rental
                  services in Lebanon. Since 2008, we’ve grown into one of the leading rental companies
                  in Beirut, serving thousands of happy clients every year.
                </p>
                <p>
                  We offer a full range of vehicles—from economic cars for everyday use, to SUVs for
                  families, to luxury cars for special occasions.
                </p>
                <p>
                  Whether you're a tourist or a resident, our goal is to deliver the best car rental
                  experience with transparent pricing, clean vehicles, and fast service.
                </p>
              </div>
            </div>

            {/* Right Images with SEO alt text */}
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80"
                alt="Affordable luxury car rental in Beirut Lebanon - Rento LB"
                className="rounded-2xl w-full h-64 object-cover hover-glow"
              />
              <img
                src="https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80"
                alt="Rent a BMW in Beirut Lebanon - Cheap car rental"
                className="rounded-2xl w-full h-64 object-cover hover-glow mt-8"
              />
              <img
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80"
                alt="Best car rental company in Lebanon - Rento LB"
                className="rounded-2xl w-full h-64 object-cover hover-glow"
              />
              <img
                src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80"
                alt="SUV rental in Beirut Lebanon"
                className="rounded-2xl w-full h-64 object-cover hover-glow mt-8"
              />
            </div>

          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-accent/10 text-accent-foreground border-accent/20">
              Our Values
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Customers Choose Rento LB
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We focus on reliability, transparency, and exceptional service across Lebanon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover-glow transition-all">
                <CardContent className="pt-8 pb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20">
              Our Lebanese Team
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Meet the People Behind Rento LB
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our experienced team ensures the highest level of service in the Lebanese car rental industry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="overflow-hidden hover-glow transition-all">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={`${member.name} - Rento LB Car Rental Lebanon`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-secondary font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary-light to-secondary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Book Your Car Rental in Lebanon Today
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Select your car and enjoy fast delivery anywhere in Lebanon.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/cars">
              <button className="px-8 py-3 bg-white text-primary hover:bg-white/90 font-semibold rounded-lg transition-smooth">
                View Available Cars
              </button>
            </a>
            <a href="/contact">
              <button className="px-8 py-3 border-2 border-white text-white hover:bg-white/10 font-semibold rounded-lg transition-smooth">
                Contact Rento LB
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
