import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { toast } from 'sonner';

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock form submission
    toast.success('Message sent successfully! We\'ll get back to you soon.', {
      duration: 5000
    });
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Us',
      details: ['Mount Liban', 'Baouchrieh, Lebanon'],
      color: 'from-primary to-primary-light'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+961 (70) 041-862', '+961 (81) 001-301'],
      color: 'from-secondary to-secondary-light'
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['social@rento-lb.com'],
      color: 'from-accent to-accent-light'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: ['24/7'],
      color: 'from-primary-dark to-secondary'
    }
  ];

  const locations = [
    {
      city: 'London',
      address: '124-128 City Road, London, England, EC1V 2NX',
      phone: 'Not available'
    },
    {
      city: 'Mount Liban',
      address: 'Baouchrieh, Lebanon',
      phone: '+961 (81) 001-301'
    }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20">
              Contact Us
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions? We're here to help. Reach out to our team for any inquiries about our vehicles or services.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactInfo.map((info, index) => (
            <Card key={index} className="hover-glow transition-all">
              <CardContent className="pt-6 text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${info.color} flex items-center justify-center mx-auto mb-4`}>
                  <info.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-3">{info.title}</h3>
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-muted-foreground text-sm">
                    {detail}
                  </p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+96181001301"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="How can we help you?"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-secondary hover:bg-secondary-light text-secondary-foreground font-semibold"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Map & Locations */}
         <div className="space-y-6">
  {/* Map Placeholder */}
  <Card className="overflow-hidden">
    <a
      href="https://www.google.com/maps?q=33.8861985,35.5591084"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="aspect-video bg-muted relative cursor-pointer">
        <img
          src="https://www.mountain-forecast.com/locationmaps/Mount-Lebanon.10.gif"
          alt="Map Location"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <p className="font-bold text-lg">Main Office</p>
          <p className="text-sm">Mount Liban, Baouchrieh, Lebanon</p>
        </div>
      </div>
    </a>
  </Card>



            {/* Locations */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Our Locations</h3>
                <div className="space-y-4">
                  {locations.map((location, index) => (
                    <div key={index} className="pb-4 border-b border-border last:border-0 last:pb-0">
                      <h4 className="font-semibold text-lg mb-1">{location.city}</h4>
                      <p className="text-sm text-muted-foreground mb-1">{location.address}</p>
                      <p className="text-sm text-secondary font-medium">{location.phone}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-20">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-accent/10 text-accent-foreground border-accent/20">
              FAQ
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find quick answers to common questions about our services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">What documents do I need to rent?</h3>
                <p className="text-muted-foreground text-sm">
                  You'll need a valid driver's license, a major credit card in your name, and proof of insurance. International customers may need additional documentation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">What's your cancellation policy?</h3>
                <p className="text-muted-foreground text-sm">
                  Free cancellation up to 48 hours before pickup. Cancellations within 48 hours may incur a fee. Please contact us for specific details.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">Is insurance included?</h3>
                <p className="text-muted-foreground text-sm">
                  Basic insurance is included with all rentals. Additional coverage options are available for purchase during booking.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">Can I extend my rental period?</h3>
                <p className="text-muted-foreground text-sm">
                  Yes! Contact us at least 24 hours before your scheduled return to extend your rental, subject to vehicle availability.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">Do you offer airport pickup?</h3>
                <p className="text-muted-foreground text-sm">
                  Absolutely! We offer complimentary airport pickup and drop-off at major airports. Please specify this when booking.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">What's the minimum rental period?</h3>
                <p className="text-muted-foreground text-sm">
                  Our minimum rental period is 24 hours. We also offer attractive rates for weekly and monthly rentals.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};