import React from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import FeatureCard from '@/components/FeatureCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Eye, 
  Users, 
  Zap, 
  MapPin, 
  Award,
  BookOpen,
  Camera,
  ArrowRight,
  CheckCircle,
  Globe
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const features = [
    {
      icon: Camera,
      title: 'AI-Powered Reporting',
      description: 'Capture incidents with your mobile device. Our AI automatically validates image quality and classifies threats for faster response.',
      gradient: 'ocean' as const
    },
    {
      icon: Eye,
      title: 'Real-Time Monitoring',
      description: 'Track mangrove health in real-time with satellite integration and community reports. Get instant alerts for critical threats.',
      gradient: 'mangrove' as const
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join thousands of environmental guardians worldwide. Collaborate with local communities, NGOs, and government authorities.',
      gradient: 'sunset' as const
    },
    {
      icon: Zap,
      title: 'Instant Alerts',
      description: 'Automated notification system alerts relevant authorities within minutes of threat detection for immediate action.',
      gradient: 'ocean' as const
    },
    {
      icon: Award,
      title: 'Gamified Experience',
      description: 'Earn points, badges, and rewards for your conservation efforts. Compete on leaderboards and unlock achievements.',
      gradient: 'mangrove' as const
    },
    {
      icon: Globe,
      title: 'Global Impact',
      description: 'Your local actions contribute to global conservation efforts. Access worldwide data and research insights.',
      gradient: 'sunset' as const
    }
  ];

  const stats = [
    { value: '2,547', label: 'Active Guardians', change: '+12%' },
    { value: '1,293', label: 'Reports Verified', change: '+8%' },
    { value: '89', label: 'Threats Prevented', change: '+23%' },
    { value: '156', label: 'Areas Protected', change: '+5%' }
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Marine Biologist',
      content: 'MangroveGuard has revolutionized how we monitor coastal ecosystems. The AI validation system catches threats we might have missed.',
      avatar: '👩‍🔬'
    },
    {
      name: 'Ahmed Hassan',
      role: 'Local Guardian',
      content: 'As a fisherman, I see changes in our mangroves daily. This app lets me report issues quickly and help protect our livelihood.',
      avatar: '👨‍🎣'
    },
    {
      name: 'Maria Santos',
      role: 'Environmental Officer',
      content: 'The real-time alerts have helped us respond to illegal activities 60% faster. This is game-changing for conservation efforts.',
      avatar: '👩‍💼'
    }
  ];

  return (
    <>
      <Navigation />
      
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="outline">
              Powered by AI & Community
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Advanced Conservation Technology
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Combining artificial intelligence, satellite monitoring, and community engagement 
              to protect vital coastal ecosystems worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                gradient={feature.gradient}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-hero text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={stat.label} className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold">{stat.value}</div>
                <div className="text-white/80">{stat.label}</div>
                <div className="text-accent text-sm font-medium">{stat.change} this month</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, effective conservation in four steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Capture', description: 'Take photos of incidents using your mobile device', icon: Camera },
              { step: '2', title: 'Validate', description: 'AI analyzes and validates your report automatically', icon: Eye },
              { step: '3', title: 'Alert', description: 'Relevant authorities receive instant notifications', icon: Zap },
              { step: '4', title: 'Protect', description: 'Action is taken to address the threat immediately', icon: Shield }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="text-center group">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-ocean rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-sm">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Conservationists</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join the global community making a real difference
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={testimonial.name} className="group hover:shadow-strong transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-2xl">{testimonial.avatar}</div>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Protect Our Mangroves?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of environmental guardians making a real impact. 
            Start reporting and monitoring today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link to="/report">
                <Camera className="h-5 w-5" />
                Start Reporting
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-white border-white/30 hover:bg-white/10">
              <Link to="/map">
                <MapPin className="h-5 w-5" />
                Explore Map
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">MangroveGuard</h3>
              <p className="text-sm text-background/80 mb-4">
                Protecting coastal ecosystems through technology and community engagement.
              </p>
              <div className="flex items-center gap-2 text-sm text-background/80">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>AI-Powered Conservation</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <div className="space-y-2 text-sm">
                <Link to="/map" className="block text-background/80 hover:text-background transition-colors">
                  Interactive Map
                </Link>
                <Link to="/report" className="block text-background/80 hover:text-background transition-colors">
                  Submit Report
                </Link>
                <Link to="/education" className="block text-background/80 hover:text-background transition-colors">
                  Education
                </Link>
                <Link to="/leaderboard" className="block text-background/80 hover:text-background transition-colors">
                  Leaderboard
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-background/80 hover:text-background transition-colors">
                  Join Network
                </a>
                <a href="#" className="block text-background/80 hover:text-background transition-colors">
                  Events
                </a>
                <a href="#" className="block text-background/80 hover:text-background transition-colors">
                  Guidelines
                </a>
                <a href="#" className="block text-background/80 hover:text-background transition-colors">
                  Support
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-background/80 hover:text-background transition-colors">
                  API Documentation
                </a>
                <a href="#" className="block text-background/80 hover:text-background transition-colors">
                  Research Data
                </a>
                <a href="#" className="block text-background/80 hover:text-background transition-colors">
                  Conservation Guide
                </a>
                <Link to="/admin" className="block text-background/80 hover:text-background transition-colors">
                  Admin Portal
                </Link>
                <a href="#" className="block text-background/80 hover:text-background transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm text-background/60">
            <p>&copy; 2024 MangroveGuard. All rights reserved. Built for environmental conservation.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Index;
