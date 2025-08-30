import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Coins, Gift, ShoppingCart, Award, Package, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Reward {
  id: string;
  name: string;
  description: string;
  cost_in_coins: number;
  category: string;
  image_url?: string;
  stock_quantity: number;
}

interface UserCoins {
  balance: number;
}

const CoinsWidget = () => {
  const [coins, setCoins] = useState<UserCoins | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserCoins();
      fetchRewards();
    }
  }, [user]);

  const fetchUserCoins = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('coins')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // No coins record exists, create one
      const { data: newCoins, error: insertError } = await supabase
        .from('coins')
        .insert({ user_id: user.id, balance: 50 }) // Welcome bonus
        .select('balance')
        .single();

      if (!insertError) {
        setCoins(newCoins);
        toast({
          title: "Welcome bonus!",
          description: "You've received 50 coins for joining Mangrove Guardian!",
        });
      }
    } else if (!error && data) {
      setCoins(data);
    }

    setLoading(false);
  };

  const fetchRewards = async () => {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('is_active', true)
      .order('cost_in_coins', { ascending: true });

    if (!error && data) {
      setRewards(data);
    }
  };

  const redeemReward = async (reward: Reward) => {
    if (!user || !coins || coins.balance < reward.cost_in_coins) {
      toast({
        title: "Insufficient coins",
        description: "You don't have enough coins for this reward.",
        variant: "destructive",
      });
      return;
    }

    // Start a transaction to deduct coins and record purchase
    const { error: purchaseError } = await supabase
      .from('user_rewards')
      .insert({
        user_id: user.id,
        reward_id: reward.id,
        coins_spent: reward.cost_in_coins,
      });

    if (purchaseError) {
      toast({
        title: "Purchase failed",
        description: "Failed to process your reward purchase.",
        variant: "destructive",
      });
      return;
    }

    // Update user's coin balance
    const newBalance = coins.balance - reward.cost_in_coins;
    const { error: updateError } = await supabase
      .from('coins')
      .update({ balance: newBalance })
      .eq('user_id', user.id);

    if (!updateError) {
      setCoins({ balance: newBalance });
      toast({
        title: "Reward redeemed!",
        description: `You've successfully redeemed ${reward.name}. Check your profile for delivery details.`,
      });
      setIsRewardsOpen(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lifestyle': return <Package className="h-4 w-4" />;
      case 'environmental': return <Award className="h-4 w-4" />;
      case 'merchandise': return <Gift className="h-4 w-4" />;
      case 'education': return <Star className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'lifestyle': return 'secondary';
      case 'environmental': return 'success';
      case 'merchandise': return 'primary';
      case 'education': return 'warning';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4">
          <div className="h-6 bg-muted rounded mb-2"></div>
          <div className="h-4 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-full">
              <Coins className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{coins?.balance || 0}</h3>
              <p className="text-sm text-muted-foreground">Guardian Coins</p>
            </div>
          </div>
          
          <Dialog open={isRewardsOpen} onOpenChange={setIsRewardsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Redeem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Rewards Store
                </DialogTitle>
                <DialogDescription>
                  Redeem your Guardian Coins for exclusive rewards and contribute to conservation efforts.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {rewards.map((reward) => (
                  <Card key={reward.id} className="hover:shadow-medium transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(reward.category)}
                          <Badge variant={getCategoryColor(reward.category) as any} className="text-xs">
                            {reward.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-primary font-bold">
                          <Coins className="h-4 w-4" />
                          <span>{reward.cost_in_coins}</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{reward.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {reward.description}
                      </p>
                      <Button 
                        className="w-full" 
                        variant={coins && coins.balance >= reward.cost_in_coins ? "ocean" : "outline"}
                        disabled={!coins || coins.balance < reward.cost_in_coins}
                        onClick={() => redeemReward(reward)}
                      >
                        {coins && coins.balance >= reward.cost_in_coins ? (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Redeem Now
                          </>
                        ) : (
                          <>
                            <Coins className="h-4 w-4 mr-2" />
                            Need {reward.cost_in_coins - (coins?.balance || 0)} more
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {rewards.length === 0 && (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No rewards available</h3>
                  <p className="text-muted-foreground">Check back later for new rewards!</p>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="mt-3 text-xs text-muted-foreground">
          💡 Earn coins by submitting verified reports and completing educational activities
        </div>
      </CardContent>
    </Card>
  );
};

export default CoinsWidget;