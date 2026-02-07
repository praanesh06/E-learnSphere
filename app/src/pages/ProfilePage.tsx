import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, badgeService, userPointsService } from '@/services/mockApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Award, Trophy, Flame, BookOpen, CheckCircle, Save } from 'lucide-react';
import { toast } from 'sonner';
import type { User as UserType, Badge as BadgeType, UserPoints } from '@/types';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [allBadges, setAllBadges] = useState<BadgeType[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setUser(currentUser);
    setFormData({ name: currentUser.name, email: currentUser.email });

    const userPoints = userPointsService.getByUser(currentUser.id);
    setPoints(userPoints);

    const userBadges = badgeService.getUserBadges(currentUser.id);
    setBadges(userBadges);

    const all = badgeService.getAll();
    setAllBadges(all);
  };

  const handleSave = () => {
    // In a real app, this would update the user
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const getBadgeLevel = (points: number) => {
    if (points >= 1000) return { name: 'Expert', color: '#8b5cf6' };
    if (points >= 500) return { name: 'Advanced', color: '#3b82f6' };
    if (points >= 100) return { name: 'Intermediate', color: '#22c55e' };
    return { name: 'Beginner', color: '#6b7280' };
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B5BFF]"></div>
      </div>
    );
  }

  const badgeLevel = points ? getBadgeLevel(points.totalPoints) : null;

  return (
    <div className="min-h-screen bg-[#F6F8FC] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="bg-[#3B5BFF] text-white text-3xl">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl font-bold text-[#0B0E14]">{user.name}</h1>
                <p className="text-gray-500">{user.email}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                  <Badge className="capitalize">{user.role}</Badge>
                  {badgeLevel && (
                    <Badge style={{ backgroundColor: badgeLevel.color }}>
                      {badgeLevel.name}
                    </Badge>
                  )}
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            {points && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#3B5BFF]/10 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-[#3B5BFF]" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#0B0E14]">{points.totalPoints}</p>
                        <p className="text-sm text-gray-500">Total Points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Flame className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#0B0E14]">{points.streakDays}</p>
                        <p className="text-sm text-gray-500">Day Streak</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#0B0E14]">{points.coursesCompleted}</p>
                        <p className="text-sm text-gray-500">Courses Completed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#0B0E14]">{points.quizzesPassed}</p>
                        <p className="text-sm text-gray-500">Quizzes Passed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Badges */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#3B5BFF]" />
                  Recent Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                {badges.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {badges.slice(0, 5).map(badge => (
                      <div 
                        key={badge.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-full"
                        style={{ backgroundColor: `${badge.color}20` }}
                      >
                        <span className="text-xl">{badge.icon}</span>
                        <span className="text-sm font-medium" style={{ color: badge.color }}>
                          {badge.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Complete courses and quizzes to earn badges!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">All Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {allBadges.map(badge => {
                    const hasBadge = badges.some(b => b.id === badge.id);
                    return (
                      <div 
                        key={badge.id}
                        className={`flex items-center gap-4 p-4 rounded-xl ${
                          hasBadge ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <div 
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                            hasBadge ? '' : 'grayscale opacity-50'
                          }`}
                          style={{ backgroundColor: `${badge.color}20` }}
                        >
                          {badge.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-[#0B0E14]">{badge.name}</h4>
                            {hasBadge && (
                              <Badge className="bg-green-100 text-green-700">Earned</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{badge.description}</p>
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500">{badge.pointsRequired} points required</span>
                              <span className="text-gray-700">
                                {points ? Math.min(points.totalPoints, badge.pointsRequired) : 0} / {badge.pointsRequired}
                              </span>
                            </div>
                            <Progress 
                              value={points ? Math.min(100, (points.totalPoints / badge.pointsRequired) * 100) : 0} 
                              className="h-1.5"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Button onClick={handleSave} className="bg-[#3B5BFF] hover:bg-[#2a4aee]">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="font-medium text-[#0B0E14]">{user.name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-[#0B0E14]">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b">
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Role</p>
                          <p className="font-medium text-[#0B0E14] capitalize">{user.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
