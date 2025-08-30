import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Award, 
  Trophy, 
  Medal, 
  Crown,
  TrendingUp,
  Users,
  Star,
  Target,
  Globe,
  Calendar,
  Clock
} from 'lucide-react';

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('global');
  const { leaderboard, userRank, achievements: dbAchievements, loading } = useLeaderboard();

  // Different point systems for each ranking type
  const pointSystems = {
    global: {
      title: 'Global Rankings',
      icon: Globe,
      description: 'Lifetime achievements with maximum rewards',
      multiplier: 1.0, // Full points
      maxPoints: 15000,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    monthly: {
      title: 'Monthly Rankings',
      icon: Calendar,
      description: 'Monthly performance with high rewards',
      multiplier: 0.7, // 70% of global points
      maxPoints: 10500,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    weekly: {
      title: 'Weekly Rankings',
      icon: Clock,
      description: 'Weekly achievements with moderate rewards',
      multiplier: 0.4, // 40% of global points
      maxPoints: 6000,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  };

  const globalLeaders = [
    {
      rank: 1,
      name: 'Dr. Sarah Chen',
      avatar: '👩‍🔬',
      points: 12450,
      reports: 89,
      verified: 76,
      badge: 'Guardian Elite',
      country: 'Singapore',
      change: '+245'
    },
    {
      rank: 2,
      name: 'Ahmed Hassan',
      avatar: '👨‍🎣',
      points: 11230,
      reports: 67,
      verified: 58,
      badge: 'Marine Protector',
      country: 'Egypt',
      change: '+189'
    },
    {
      rank: 3,
      name: 'Maria Santos',
      avatar: '👩‍💼',
      points: 10890,
      reports: 78,
      verified: 71,
      badge: 'Conservation Hero',
      country: 'Philippines',
      change: '+156'
    },
    {
      rank: 4,
      name: 'David Kim',
      avatar: '👨‍🏫',
      points: 9560,
      reports: 54,
      verified: 49,
      badge: 'Ecosystem Defender',
      country: 'South Korea',
      change: '+134'
    },
    {
      rank: 5,
      name: 'Ana Rodriguez',
      avatar: '👩‍🔬',
      points: 8920,
      reports: 43,
      verified: 38,
      badge: 'Coastal Guardian',
      country: 'Colombia',
      change: '+98'
    }
  ];

  // Generate monthly and weekly rankings with adjusted points
  const monthlyLeaders = globalLeaders.map(leader => ({
    ...leader,
    points: Math.round(leader.points * pointSystems.monthly.multiplier),
    change: `+${Math.round(parseInt(leader.change.replace('+', '')) * pointSystems.monthly.multiplier)}`
  }));

  const weeklyLeaders = globalLeaders.map(leader => ({
    ...leader,
    points: Math.round(leader.points * pointSystems.weekly.multiplier),
    change: `+${Math.round(parseInt(leader.change.replace('+', '')) * pointSystems.weekly.multiplier)}`
  }));

  const getCurrentLeaders = () => {
    switch (activeTab) {
      case 'monthly': return monthlyLeaders;
      case 'weekly': return weeklyLeaders;
      default: return globalLeaders;
    }
  };

  const badges = [
    { name: 'First Report', icon: '🥇', description: 'Submit your first incident report', earned: true },
    { name: 'Guardian Elite', icon: '👑', description: 'Reach 10,000 points', earned: true },
    { name: 'Sharp Eye', icon: '👁️', description: 'Have 90% of reports verified', earned: true },
    { name: 'Speed Demon', icon: '⚡', description: 'Submit 5 reports in one day', earned: false },
    { name: 'Marine Protector', icon: '🌊', description: 'Report 50 marine incidents', earned: true },
    { name: 'Ecosystem Defender', icon: '🛡️', description: 'Help prevent 10 major threats', earned: false }
  ];

  const achievements = [
    { title: 'Reports Submitted', value: 23, target: 50, icon: Target },
    { title: 'Verification Rate', value: 87, target: 90, icon: Star },
    { title: 'Conservation Points', value: 3420, target: 5000, icon: Award },
    { title: 'Threats Prevented', value: 5, target: 10, icon: Trophy }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-warning" />;
      case 2: return <Medal className="h-5 w-5 text-muted-foreground" />;
      case 3: return <Medal className="h-5 w-5 text-accent" />;
      default: return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-sunset border-warning/20';
      case 2: return 'bg-gradient-card border-muted-foreground/20';
      case 3: return 'bg-gradient-card border-accent/20';
      default: return 'bg-gradient-card border-border';
    }
  };

  const currentSystem = pointSystems[activeTab as keyof typeof pointSystems];
  const Icon = currentSystem.icon;

  return (
    <>
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-hero text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-accent" />
            <h1 className="text-3xl md:text-4xl font-bold">Leaderboard</h1>
          </div>
          <p className="text-lg text-white/90 max-w-2xl">
            Celebrate the top environmental guardians making a real impact in mangrove conservation worldwide.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Point System Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${currentSystem.color}`} />
              {currentSystem.title}
            </CardTitle>
            <p className="text-muted-foreground">{currentSystem.description}</p>
          </CardHeader>
          <CardContent>
            <div className={`p-4 rounded-lg ${currentSystem.bgColor} ${currentSystem.borderColor} border`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className={`text-2xl font-bold ${currentSystem.color}`}>
                    {currentSystem.maxPoints.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Maximum Points</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${currentSystem.color}`}>
                    {Math.round(currentSystem.multiplier * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Point Multiplier</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${currentSystem.color}`}>
                    {currentSystem.multiplier === 1.0 ? 'Full' : currentSystem.multiplier === 0.7 ? 'High' : 'Moderate'}
                  </div>
                  <div className="text-sm text-muted-foreground">Reward Level</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            const progress = (achievement.value / achievement.target) * 100;
            
            return (
              <Card key={achievement.title} className="relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="h-8 w-8 text-primary" />
                    <Badge variant={progress >= 100 ? 'default' : 'secondary'}>
                      {Math.round(progress)}%
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{achievement.value}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{achievement.title}</p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-ocean h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Goal: {achievement.target}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="global" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Global
                    </TabsTrigger>
                    <TabsTrigger value="monthly" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Monthly
                    </TabsTrigger>
                    <TabsTrigger value="weekly" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Weekly
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value={activeTab} className="space-y-4">
                    {getCurrentLeaders().map((leader) => (
                      <div 
                        key={leader.rank}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02] ${getRankStyle(leader.rank)}`}
                      >
                        <div className="flex-shrink-0 w-8 flex justify-center">
                          {getRankIcon(leader.rank)}
                        </div>
                        
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-ocean flex items-center justify-center text-white text-lg">
                            {leader.avatar}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold">{leader.name}</h3>
                          <p className="text-sm text-muted-foreground">{leader.country}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {leader.badge}
                          </Badge>
                        </div>
                        
                        <div className="text-right">
                          <div className={`font-bold text-lg ${currentSystem.color}`}>
                            {leader.points.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {leader.reports} reports • {leader.verified} verified
                          </div>
                          <div className="flex items-center gap-1 text-xs text-success mt-1">
                            <TrendingUp className="h-3 w-3" />
                            {leader.change}
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Rank */}
            <Card>
              <CardHeader>
                <CardTitle>Your Ranking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-ocean rounded-full flex items-center justify-center text-white text-2xl mx-auto">
                    👤
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">#47</div>
                    <p className="text-sm text-muted-foreground">Global Ranking</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="font-semibold">3,420</div>
                      <div className="text-xs text-muted-foreground">Points</div>
                    </div>
                    <div>
                      <div className="font-semibold">23</div>
                      <div className="text-xs text-muted-foreground">Reports</div>
                    </div>
                  </div>
                  <Button variant="ocean" className="w-full">
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Point System Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Point Systems</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-50 border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Global</span>
                  </div>
                  <Badge variant="secondary" className="text-yellow-700 bg-yellow-100">
                    100% Points
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Monthly</span>
                  </div>
                  <Badge variant="secondary" className="text-blue-700 bg-blue-100">
                    70% Points
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Weekly</span>
                  </div>
                  <Badge variant="secondary" className="text-green-700 bg-green-100">
                    40% Points
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Badges & Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {badges.map((badge) => (
                    <div 
                      key={badge.name}
                      className={`p-3 rounded-lg border text-center transition-all duration-300 hover:scale-105 ${
                        badge.earned ? 'bg-gradient-card border-primary/20' : 'bg-muted/50 border-muted opacity-50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{badge.icon}</div>
                      <div className="text-xs font-medium truncate">{badge.name}</div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Badges
                </Button>
              </CardContent>
            </Card>

            {/* Weekly Challenge */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Challenge</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-sunset rounded-lg flex items-center justify-center">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Submit 5 Reports</h4>
                      <p className="text-sm text-muted-foreground">2/5 completed</p>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-gradient-sunset h-2 rounded-full w-2/5 transition-all duration-500" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-accent">Reward: 500 bonus points</div>
                    <div className="text-xs text-muted-foreground">3 days remaining</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Leaderboard;