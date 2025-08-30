import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Users, MapPin, Camera } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import heroImage from '@/assets/hero-mangroves.jpg';

const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const stats = [
    { value: '2.5K+', label: 'Reports Submitted', icon: Camera },
    { value: '850+', label: 'Active Guardians', icon: Users },
    { value: '124', label: 'Protected Areas', icon: Shield },
    { value: '45', label: 'Locations Monitored', icon: MapPin },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Mangrove Forest" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-secondary/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-float">
        <div className="w-3 h-3 bg-accent rounded-full shadow-ocean" />
      </div>
      <div className="absolute top-32 right-20 animate-float" style={{ animationDelay: '1s' }}>
        <div className="w-2 h-2 bg-secondary-light rounded-full shadow-medium" />
      </div>
      <div className="absolute bottom-32 left-20 animate-float" style={{ animationDelay: '2s' }}>
        <div className="w-4 h-4 bg-accent-light rounded-full shadow-medium" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-background/20 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6 animate-shimmer">
            <Shield className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-white">Protecting Coastal Ecosystems Worldwide</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Guard Our
            <span className="block bg-gradient-to-r from-accent via-accent-light to-secondary-light bg-clip-text text-transparent animate-wave">
              Mangroves
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of environmental guardians protecting vital coastal ecosystems through 
            community-driven monitoring, AI-powered validation, and real-time threat detection.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild variant="hero" size="lg" className="group">
              <Link to="/report">
                <Camera className="h-5 w-5" />
                Report Incident
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Link to="/map">
                <MapPin className="h-5 w-5" />
                Explore Map
              </Link>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={stat.label}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className="h-6 w-6 text-accent mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-white/80">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;