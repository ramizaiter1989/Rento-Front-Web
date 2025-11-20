import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Users, Globe, Heart, Shield, Clock } from 'lucide-react';

export const AboutPage = () => {
  const values = [
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Your satisfaction and experience are at the heart of everything we do'
    },
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'Every vehicle is meticulously maintained and fully insured for your protection'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for perfection in service quality and vehicle condition'
    },
    {
      icon: Globe,
      title: 'Accessibility',
      description: 'Premium vehicles available across multiple locations for your convenience'
    }
  ];

  const stats = [
    { value: '15+', label: 'Years in Business' },
    { value: '10,000+', label: 'Happy Customers' },
    { value: '50+', label: 'Premium Vehicles' },
    { value: '25', label: 'Cities Covered' }
  ];

  const team = [
    {
      name: 'Michael Stevens',
      role: 'CEO & Founder',
      image: 'https://i.pravatar.cc/200?img=12',
      bio: '20+ years in luxury automotive industry'
    },
    {
      name: 'Sarah Chen',
      role: 'Operations Director',
      image: 'https://i.pravatar.cc/200?img=5',
      bio: 'Expert in fleet management and customer service'
    },
    {
      name: 'David Martinez',
      role: 'Fleet Manager',
      image: 'https://i.pravatar.cc/200?img=13',
      bio: 'Automotive specialist with passion for excellence'
    },
    {
      name: 'Emily Johnson',
      role: 'Customer Relations',
      image: 'https://i.pravatar.cc/200?img=1',
      bio: 'Dedicated to delivering exceptional experiences'
    }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20">
              About Us
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Redefining Luxury Car Rental
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              For over 15 years, RENTO LB has been the trusted name in premium vehicle rentals,
              providing discerning customers with access to the world's finest automobiles.
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
                Passion for Automotive Excellence
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  RENTO LB was born from a simple vision: to make the world's most prestigious
                  vehicles accessible to those who appreciate the finer things in life. Founded in
                  2008 by automotive enthusiasts, we've grown from a small boutique operation to
                  a leading name in luxury car rentals.
                </p>
                <p>
                  Every vehicle in our fleet is carefully selected and maintained to the highest
                  standards. We believe that driving a premium vehicle isn't just about
                  transportation—it's about experiencing craftsmanship, performance, and luxury
                  in their purest forms.
                </p>
                <p>
                  Today, we're proud to serve thousands of satisfied customers across 25 cities,
                  offering everything from exotic sports cars to elegant luxury sedans. Our
                  commitment to excellence and customer satisfaction remains as strong as ever.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80"
                alt="Luxury Car 1"
                className="rounded-2xl w-full h-64 object-cover hover-glow"
              />
              <img
                src="https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80"
                alt="Luxury Car 2"
                className="rounded-2xl w-full h-64 object-cover hover-glow mt-8"
              />
              <img
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80"
                alt="Luxury Car 3"
                className="rounded-2xl w-full h-64 object-cover hover-glow"
              />
              <img
                src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80"
                alt="Luxury Car 4"
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
              What Drives Us Forward
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our core values guide every decision we make and every service we provide
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
              Meet Our Team
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The People Behind the Wheels
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our passionate team of automotive experts is dedicated to making your experience exceptional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="overflow-hidden hover-glow transition-all">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
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
            Experience the RENTO LB Difference
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us for their luxury vehicle needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/cars">
              <button className="px-8 py-3 bg-white text-primary hover:bg-white/90 font-semibold rounded-lg transition-smooth">
                Browse Our Fleet
              </button>
            </a>
            <a href="/contact">
              <button className="px-8 py-3 border-2 border-white text-white hover:bg-white/10 font-semibold rounded-lg transition-smooth">
                Contact Us
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};