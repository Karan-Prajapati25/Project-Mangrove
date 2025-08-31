import React, { useState, useEffect } from 'react';
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
  Clock,
  ShoppingCart,
  Coins,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('global');
  const [userPoints, setUserPoints] = useState(3420);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [showAllRewards, setShowAllRewards] = useState(false);
  const { leaderboard, userRank, achievements: dbAchievements, loading } = useLeaderboard();
  const { user } = useAuth();

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

  // Reward shop data
  const rewards = [
    {
      id: 'guardian-badge',
      name: 'Guardian Badge',
      description: 'Exclusive profile badge',
      cost: 500,
      icon: '🏆',
      bgColor: 'bg-gradient-ocean'
    },
    {
      id: 'avatar-frame',
      name: 'Custom Avatar Frame',
      description: 'Unique profile decoration',
      cost: 1000,
      icon: '🎨',
      bgColor: 'bg-gradient-sunset'
    },
    {
      id: 'premium-course',
      name: 'Premium Course Access',
      description: 'Advanced conservation training',
      cost: 2500,
      icon: '📚',
      bgColor: 'bg-gradient-card'
    },
    {
      id: 'vip-status',
      name: 'VIP Status',
      description: 'Priority support & features',
      cost: 5000,
      icon: '🌟',
      bgColor: 'bg-gradient-hero'
    }
  ];

  // Fetch user points from database
  useEffect(() => {
    if (user) {
      fetchUserPoints();
    }
  }, [user]);

  // Handle ESC key press for modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showAllBadges) setShowAllBadges(false);
        if (showAllRewards) setShowAllRewards(false);
      }
    };

    if (showAllBadges || showAllRewards) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [showAllBadges, showAllRewards]);

  const fetchUserPoints = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('coins')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setUserPoints(data.balance);
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const redeemReward = async (reward: any) => {
    if (!user) {
      toast.error('Please log in to redeem rewards');
      return;
    }

    if (userPoints < reward.cost) {
      toast.error(`Insufficient balance! You need ${reward.cost - userPoints} more points to redeem ${reward.name}`);
      return;
    }

    setRedeeming(reward.id);

    try {
      // Record the redemption
      const { error: redemptionError } = await supabase
        .from('user_rewards')
        .insert({
          user_id: user.id,
          reward_name: reward.name,
          reward_cost: reward.cost,
          redeemed_at: new Date().toISOString()
        });

      if (redemptionError) {
        throw redemptionError;
      }

      // Update user's point balance
      const newBalance = userPoints - reward.cost;
      const { error: updateError } = await supabase
        .from('coins')
        .update({ balance: newBalance })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setUserPoints(newBalance);

      // Show success message
      toast.success(`🎉 ${reward.name} redeemed successfully! Check your profile for delivery details.`);

    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error('Failed to redeem reward. Please try again.');
    } finally {
      setRedeeming(null);
    }
  };

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
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => setShowAllBadges(true)}
                >
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

            {/* Rewards Shop */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Rewards Shop
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold text-primary">{userPoints.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Points Available</div>
                  </div>
                  
                  <div className="space-y-3">
                    {rewards.map((reward) => (
                      <div key={reward.id} className="p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 ${reward.bgColor} rounded-lg flex items-center justify-center text-white text-sm`}>
                              {reward.icon}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{reward.name}</div>
                              <div className="text-xs text-muted-foreground">{reward.description}</div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">{reward.cost.toLocaleString()} pts</Badge>
                        </div>
                        <Button 
                          size="sm" 
                          variant={userPoints >= reward.cost ? "ocean" : "outline"}
                          className="w-full"
                          disabled={userPoints < reward.cost || redeeming === reward.id}
                          onClick={() => redeemReward(reward)}
                        >
                          {redeeming === reward.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Redeeming...
                            </>
                          ) : userPoints >= reward.cost ? (
                            <>
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Redeem Now
                            </>
                          ) : (
                            <>
                              <Coins className="h-4 w-4 mr-2" />
                              Need {(reward.cost - userPoints).toLocaleString()} more
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowAllRewards(true)}
                  >
                    View All Rewards
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* All Badges Modal */}
      {showAllBadges && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAllBadges(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-yellow-50 to-orange-50">
              <div>
                <h3 className="text-2xl font-bold text-yellow-900">All Badges & Achievements</h3>
                <p className="text-yellow-700 mt-1">Complete collection of available badges and achievements</p>
              </div>
              <button 
                onClick={() => setShowAllBadges(false)} 
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {badges.map((badge) => (
                  <div 
                    key={badge.name}
                    className={`p-4 rounded-lg border text-center transition-all duration-300 hover:scale-105 ${
                      badge.earned ? 'bg-gradient-card border-primary/20 shadow-lg' : 'bg-muted/50 border-muted opacity-75'
                    }`}
                  >
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <div className="font-medium text-sm mb-1">{badge.name}</div>
                    <div className="text-xs text-muted-foreground mb-2">{badge.description}</div>
                    <Badge variant={badge.earned ? "default" : "outline"} className="text-xs">
                      {badge.earned ? 'Earned' : 'Locked'}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Total Badges: {badges.length} • Click outside or press ESC to close
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Rewards Modal */}
      {showAllRewards && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAllRewards(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h3 className="text-2xl font-bold text-blue-900">Complete Rewards Shop</h3>
                <p className="text-blue-700 mt-1">All available rewards and exclusive items</p>
              </div>
              <button 
                onClick={() => setShowAllRewards(false)} 
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward) => (
                  <div key={reward.id} className="border rounded-lg p-6 hover:shadow-lg transition-all duration-200 bg-white">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 ${reward.bgColor} rounded-lg flex items-center justify-center text-white text-xl`}>
                        {reward.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{reward.name}</h4>
                        <p className="text-sm text-gray-600">{reward.description}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Cost:</span>
                        <Badge variant="outline" className="text-sm font-medium">
                          {reward.cost.toLocaleString()} points
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Your Balance:</span>
                        <span className={`text-sm font-medium ${userPoints >= reward.cost ? 'text-green-600' : 'text-red-600'}`}>
                          {userPoints.toLocaleString()} points
                        </span>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        variant={userPoints >= reward.cost ? "ocean" : "outline"}
                        disabled={userPoints < reward.cost || redeeming === reward.id}
                        onClick={() => redeemReward(reward)}
                      >
                        {redeeming === reward.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Redeeming...
                          </>
                        ) : userPoints >= reward.cost ? (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Redeem Now
                          </>
                        ) : (
                          <>
                            <Coins className="h-4 w-4 mr-2" />
                            Need {(reward.cost - userPoints).toLocaleString()} more
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Total Rewards: {rewards.length} • Click outside or press ESC to close
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Leaderboard;