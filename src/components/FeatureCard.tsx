import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: 'ocean' | 'mangrove' | 'sunset';
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  gradient = 'ocean',
  delay = 0 
}) => {
  const gradientClasses = {
    ocean: 'bg-gradient-ocean',
    mangrove: 'bg-gradient-mangrove',
    sunset: 'bg-gradient-sunset'
  };

  return (
    <div 
      className="group relative bg-gradient-card border border-border rounded-xl p-6 hover:shadow-strong transition-all duration-500 hover:scale-105"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon */}
      <div className={`w-12 h-12 ${gradientClasses[gradient]} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-6 w-6 text-white" />
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
};

export default FeatureCard;