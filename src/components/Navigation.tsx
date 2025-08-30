import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  Shield, 
  MapPin, 
  Camera, 
  Award, 
  BookOpen, 
  BarChart3,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import mangroveIcon from '@/assets/mangrove-shield-icon.png';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navItems = [
    { href: '/', label: 'Home', icon: Shield },
    { href: '/map', label: 'Map', icon: MapPin },
    { href: '/report', label: 'Report', icon: Camera },
    { href: '/leaderboard', label: 'Leaderboard', icon: Award },
    { href: '/education', label: 'Education', icon: BookOpen },
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  ];

  const isActive = (href: string) => location.pathname === href;

  const NavContent = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            to={item.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              isActive(item.href)
                ? 'bg-gradient-ocean text-primary-foreground shadow-ocean'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img 
                src={mangroveIcon} 
                alt="MangroveGuard" 
                className="h-10 w-10 transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-ocean opacity-0 group-hover:opacity-20 rounded-full transition-opacity duration-300" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gradient">MangroveGuard</h1>
              <p className="text-xs text-muted-foreground">Protecting Coastal Ecosystems</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavContent />
            <div className="ml-4 flex items-center gap-2">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user.user_metadata?.display_name || user.email}
                  </span>
                  <Button variant="ghost" size="sm" onClick={signOut}>
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button variant="hero" size="sm" onClick={() => navigate('/auth')}>
                  <User className="h-4 w-4" />
                  Sign In
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  <NavContent />
                  <div className="mt-6 pt-6 border-t border-border">
                    {user ? (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground text-center">
                          {user.user_metadata?.display_name || user.email}
                        </p>
                        <Button variant="ghost" className="w-full" onClick={signOut}>
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <Button variant="hero" className="w-full" onClick={() => navigate('/auth')}>
                        <User className="h-4 w-4" />
                        Sign In
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;