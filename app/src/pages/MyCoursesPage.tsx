import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService, authService } from '@/services/mockApi';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BookOpen, Trophy, Flame, Star, ArrowRight, 
  PlayCircle, CheckCircle, GraduationCap, Zap 
} from 'lucide-react';
import type { CourseWithProgress, UserPoints, Activity } from '@/types';

export default function MyCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const dashboard = dashboardService.getLearnerDashboard(currentUser.id);
    setCourses(dashboard.courses);
    setPoints(dashboard.points);
    setActivities(dashboard.activities);
    setIsLoading(false);
  };

  const getBadgeLevel = (points: number) => {
    if (points >= 1000) return { name: 'Expert', color: '#8b5cf6', icon: '🏆' };
    if (points >= 500) return { name: 'Advanced', color: '#3b82f6', icon: '📚' };
    if (points >= 100) return { name: 'Intermediate', color: '#22c55e', icon: '🌱' };
    return { name: 'Beginner', color: '#6b7280', icon: '🎯' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B5BFF]"></div>
      </div>
    );
  }

  const badgeLevel = points ? getBadgeLevel(points.totalPoints) : null;

  return (
    <div className="min-h-screen bg-[#F6F8FC] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0B0E14] mb-2">
            Welcome back, {authService.getCurrentUser()?.name.split(' ')[0]}!
          </h1>
          <p className="text-gray-600">Continue your learning journey</p>
        </div>

        {/* Stats Grid */}
        {points && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
                    <p className="text-sm text-gray-500">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-purple-500" />
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - My Courses */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#0B0E14]">My Courses</h2>
              <Button variant="ghost" onClick={() => navigate('/courses')}>
                Browse more
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {courses.length > 0 ? (
              <div className="space-y-4">
                {courses.map(course => (
                  <Card 
                    key={course.id} 
                    className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/learn/${course.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={course.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300'}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-[#0B0E14] truncate">{course.title}</h3>
                              <p className="text-sm text-gray-500">{course.instructor?.name}</p>
                            </div>
                            <Badge className={`
                              ${course.enrollment?.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                              ${course.enrollment?.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : ''}
                              ${course.enrollment?.status === 'not_started' ? 'bg-gray-100 text-gray-700' : ''}
                            `}>
                              {course.enrollment?.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {course.enrollment?.status === 'in_progress' && <PlayCircle className="w-3 h-3 mr-1" />}
                              {course.enrollment?.status === 'not_started' && <BookOpen className="w-3 h-3 mr-1" />}
                              {course.enrollment?.status === 'completed' ? 'Completed' : 
                               course.enrollment?.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                            </Badge>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-500">{course.progress}% complete</span>
                              <span className="text-gray-500">{course.lessonCount} lessons</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-[#0B0E14] mb-2">No courses yet</h3>
                  <p className="text-gray-500 mb-4">Start your learning journey by enrolling in a course</p>
                  <Button 
                    onClick={() => navigate('/courses')}
                    className="bg-[#3B5BFF] hover:bg-[#2a4aee]"
                  >
                    Browse Courses
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Badge Level */}
            {badgeLevel && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-[#0B0E14] mb-4">Your Level</h3>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                      style={{ backgroundColor: `${badgeLevel.color}20` }}
                    >
                      {badgeLevel.icon}
                    </div>
                    <div>
                      <p className="text-lg font-semibold" style={{ color: badgeLevel.color }}>
                        {badgeLevel.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {points?.totalPoints} points earned
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Progress to next level</span>
                      <span className="text-gray-700">
                        {points ? Math.min(100, Math.round((points.totalPoints % 500) / 5)) : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={points ? Math.min(100, Math.round((points.totalPoints % 500) / 5)) : 0} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <h3 className="font-semibold text-[#0B0E14] mb-4">Recent Activity</h3>
                {activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.slice(0, 5).map(activity => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={`
                          w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                          ${activity.type === 'completion' ? 'bg-green-100 text-green-600' : ''}
                          ${activity.type === 'enrollment' ? 'bg-blue-100 text-blue-600' : ''}
                          ${activity.type === 'quiz' ? 'bg-purple-100 text-purple-600' : ''}
                        `}>
                          {activity.type === 'completion' && <CheckCircle className="w-4 h-4" />}
                          {activity.type === 'enrollment' && <BookOpen className="w-4 h-4" />}
                          {activity.type === 'quiz' && <Star className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#0B0E14]">{activity.title}</p>
                          <p className="text-sm text-gray-500 truncate">{activity.description}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <h3 className="font-semibold text-[#0B0E14] mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/courses')}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Find New Courses
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/profile')}
                  >
                    <GraduationCap className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
