import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useBadges, BADGE_INFO } from '@/hooks/useBadges';
import { useAuth } from '@/hooks/useAuth';
import { Trophy, Lock } from 'lucide-react';

export const BadgeDisplay: React.FC = () => {
  const { user } = useAuth();
  const { badges, loading, getBadgeProgress } = useBadges();

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievement Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Sign in to start earning badges!
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievement Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-2 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progress = getBadgeProgress();
  const earnedBadgeTypes = new Set(badges.map(b => b.badge_type));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievement Badges
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{progress.earned} of {progress.total} badges earned</span>
            <span>{progress.percentage}%</span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {Object.values(BADGE_INFO).map((badgeInfo) => {
            const isEarned = earnedBadgeTypes.has(badgeInfo.type);
            
            return (
              <div
                key={badgeInfo.type}
                className={`relative p-3 rounded-lg border transition-all ${
                  isEarned 
                    ? `bg-gradient-to-r ${badgeInfo.color} text-white shadow-md` 
                    : 'bg-muted/20 border-dashed'
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-1">
                  <div className="text-2xl">
                    {isEarned ? badgeInfo.icon : <Lock className="h-6 w-6 text-muted-foreground" />}
                  </div>
                  <div className={`text-xs font-medium ${isEarned ? 'text-white' : 'text-muted-foreground'}`}>
                    {badgeInfo.name}
                  </div>
                </div>
                
                {!isEarned && (
                  <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                    <Lock className="h-4 w-4 text-white/80" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {progress.earned > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Keep exploring to unlock more badges! 🎯
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};