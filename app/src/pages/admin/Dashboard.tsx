import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, dashboardService, courseService } from '@/services/mockApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import {
  BookOpen, Users, Eye, Star, Plus, TrendingUp,
  BarChart3, ArrowRight, Clock
} from 'lucide-react';
import type { InstructorStats, Course } from '@/types';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentUser = authService.getCurrentUser();
  const isNewUser = currentUser?.createdAt
    ? (new Date().getTime() - new Date(currentUser.createdAt).getTime()) < 5 * 60 * 1000
    : false;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const instructorStats = dashboardService.getInstructorStats(currentUser.id);
    setStats(instructorStats);

    const courses = courseService.getAll({ instructorId: currentUser.id });
    setRecentCourses(courses.slice(0, 5));
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B5BFF]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0B0E14]">Dashboard</h1>
          <p className="text-gray-500">
            {isNewUser ? 'Welcome to LearnSphere! ' : 'Welcome back! '}
            Here's what's happening with your courses.
          </p>
        </div>
        <Button
          onClick={() => navigate('/admin/courses/new')}
          className="bg-[#3B5BFF] hover:bg-[#2a4aee]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Courses</p>
                  <p className="text-3xl font-bold text-[#0B0E14]">{stats.totalCourses}</p>
                </div>
                <div className="w-12 h-12 bg-[#3B5BFF]/10 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-[#3B5BFF]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Students</p>
                  <p className="text-3xl font-bold text-[#0B0E14]">{stats.totalStudents}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Views</p>
                  <p className="text-3xl font-bold text-[#0B0E14]">{stats.totalViews.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Avg Rating</p>
                  <p className="text-3xl font-bold text-[#0B0E14]">{stats.averageRating.toFixed(1)}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Courses */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Courses</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/courses')}>
                View all
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentCourses.length > 0 ? (
                <div className="space-y-4">
                  {recentCourses.map(course => (
                    <div
                      key={course.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
                    >
                      <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={course.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200'}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[#0B0E14] truncate">{course.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {course.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.floor(course.totalDuration / 60)}h
                          </span>
                        </div>
                      </div>
                      <Badge className={course.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {course.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No courses yet</p>
                  <Button
                    variant="outline"
                    className="mt-3"
                    onClick={() => navigate('/admin/courses/new')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create your first course
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/admin/courses/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Course
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/admin/courses')}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Manage Courses
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/admin/reporting')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Reports
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-[#3B5BFF] to-[#2a4aee] text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">Pro Tip</p>
                  <p className="text-sm text-white/80">Grow your audience</p>
                </div>
              </div>
              <p className="text-sm text-white/90 mb-4">
                Courses with video content get 3x more engagement. Add videos to your lessons!
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/admin/courses')}
              >
                Update Courses
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
