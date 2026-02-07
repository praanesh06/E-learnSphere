import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, coursesApi, enrollmentsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  ArrowLeft, Users, BookOpen, TrendingUp, CheckCircle,
  Clock, Star, Download, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import type { Course, Enrollment, CourseStats } from '@/types';

interface UserInfo {
  id: string;
  _id?: string;
  name: string;
  email: string;
}

export default function AdminReporting() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    email: true,
    progress: true,
    status: true,
    enrolled: true
  });
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCourse && selectedCourse !== 'all') {
      loadCourseStats(selectedCourse);
    } else if (selectedCourse === 'all' && courses.length > 0) {
      // Load all enrollments for all courses
      loadAllEnrollments();
    } else {
      setStats(null);
      setEnrollments([]);
    }
  }, [selectedCourse, courses]);

  const loadAllEnrollments = async () => {
    try {
      const courseIds = courses.map(c => (c as any)._id || c.id);
      const response = await enrollmentsApi.getByMultipleCourses(courseIds);
      if (response.success && response.data) {
        setEnrollments(response.data);
      }
    } catch (error) {
      console.error('Failed to load all enrollments:', error);
    }
  };

  const loadData = async () => {
    const currentUser = authApi.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      const userId = currentUser._id || currentUser.id;
      const response = await coursesApi.getAll({ instructorId: userId });
      if (response.success && response.data) {
        setCourses(response.data);
      }

      // Load users from localStorage for now (could be API in future)
      const storedUsers = JSON.parse(localStorage.getItem('ls_users') || '[]');
      setUsers(storedUsers);
    } catch (error) {
      console.error('Failed to load courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCourseStats = async (courseId: string) => {
    try {
      // Load stats
      const statsResponse = await coursesApi.getStats(courseId);
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      // Load enrollments
      const enrollmentsResponse = await enrollmentsApi.getByCourse(courseId);
      if (enrollmentsResponse.success && enrollmentsResponse.data) {
        setEnrollments(enrollmentsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load course stats:', error);
      toast.error('Failed to load course statistics');
    }
  };

  const filteredEnrollments = enrollments.filter(e => {
    // Use user data from enriched enrollment (from backend)
    const user = (e as any).user;
    if (!user) {
      // Fallback to localStorage users
      const localUser = users.find((u: UserInfo) => u.id === e.userId || u._id === e.userId);
      if (!localUser) return !searchQuery; // Show if no search query, hide if searching
      const query = searchQuery.toLowerCase();
      return localUser.name.toLowerCase().includes(query) ||
        localUser.email.toLowerCase().includes(query);
    }

    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query);
  });

  const getUser = (userId: string, enrollment?: any): UserInfo | undefined => {
    // First try to get user from enriched enrollment data
    if (enrollment?.user) {
      return {
        id: enrollment.user._id,
        _id: enrollment.user._id,
        name: enrollment.user.name || 'Unknown',
        email: enrollment.user.email || 'Unknown'
      };
    }
    // Fallback to localStorage users
    return users.find((u: UserInfo) => u.id === userId || u._id === userId);
  };

  const exportData = () => {
    if (filteredEnrollments.length === 0) {
      toast.error('No data to export');
      return;
    }

    const data = filteredEnrollments.map(e => {
      const user = getUser(e.userId, e);
      return {
        Name: user?.name || 'Unknown',
        Email: user?.email || 'Unknown',
        Progress: `${e.progress}%`,
        Status: e.status,
        Enrolled: new Date(e.enrolledAt).toLocaleDateString()
      };
    });

    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${selectedCourse}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Report exported!');
  };

  // Calculate total stats across all courses
  const [totalStats, setTotalStats] = useState({
    totalParticipants: 0,
    yetToStart: 0,
    inProgress: 0,
    completed: 0
  });

  useEffect(() => {
    const calculateTotalStats = async () => {
      let totals = { totalParticipants: 0, yetToStart: 0, inProgress: 0, completed: 0 };

      for (const course of courses) {
        const courseId = (course as any)._id || course.id;
        try {
          const response = await coursesApi.getStats(courseId);
          if (response.success && response.data) {
            totals.totalParticipants += response.data.totalParticipants || 0;
            totals.yetToStart += response.data.yetToStart || 0;
            totals.inProgress += response.data.inProgress || 0;
            totals.completed += response.data.completed || 0;
          }
        } catch (error) {
          console.error(`Failed to get stats for course ${courseId}`);
        }
      }

      setTotalStats(totals);
    };

    if (courses.length > 0) {
      calculateTotalStats();
    }
  }, [courses]);

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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#0B0E14]">Reporting</h1>
            <p className="text-gray-500">Track student progress and engagement</p>
          </div>
        </div>
        <Button variant="outline" onClick={exportData}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Participants</p>
                <p className="text-3xl font-bold text-[#0B0E14]">{totalStats.totalParticipants}</p>
              </div>
              <div className="w-12 h-12 bg-[#3B5BFF]/10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-[#3B5BFF]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Yet to Start</p>
                <p className="text-3xl font-bold text-[#0B0E14]">{totalStats.yetToStart}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-[#0B0E14]">{totalStats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Completed</p>
                <p className="text-3xl font-bold text-[#0B0E14]">{totalStats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Filter */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map(course => {
                const courseId = (course as any)._id || course.id;
                return (
                  <SelectItem key={courseId} value={courseId}>
                    {course.title}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {stats && (
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="secondary">
                <Star className="w-3 h-3 mr-1" />
                {stats.averageRating.toFixed(1)} avg rating
              </Badge>
              <Badge variant="secondary">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stats.averageProgress.toFixed(0)}% avg progress
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48"
            />
          </div>
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowColumnMenu(!showColumnMenu)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Columns
            </Button>
            {showColumnMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border p-2 z-10">
                {Object.entries(visibleColumns).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setVisibleColumns({ ...visibleColumns, [key]: e.target.checked })}
                    />
                    <span className="capitalize">{key}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Students Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {filteredEnrollments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {visibleColumns.name && (
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Student</th>
                    )}
                    {visibleColumns.email && (
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Email</th>
                    )}
                    {selectedCourse === 'all' && (
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Course</th>
                    )}
                    {visibleColumns.progress && (
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Progress</th>
                    )}
                    {visibleColumns.status && (
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                    )}
                    {visibleColumns.enrolled && (
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Enrolled</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredEnrollments.map(enrollment => {
                    const user = getUser(enrollment.userId, enrollment);
                    const enrollmentId = (enrollment as any)._id || enrollment.id;
                    const courseName = (enrollment as any).course?.title || 'Unknown Course';
                    return (
                      <tr key={enrollmentId} className="hover:bg-gray-50">
                        {visibleColumns.name && (
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#3B5BFF] flex items-center justify-center text-white text-sm font-medium">
                                {user?.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <span className="font-medium text-[#0B0E14]">{user?.name || 'Unknown'}</span>
                            </div>
                          </td>
                        )}
                        {visibleColumns.email && (
                          <td className="py-3 px-4 text-gray-600">{user?.email || 'Unknown'}</td>
                        )}
                        {selectedCourse === 'all' && (
                          <td className="py-3 px-4 text-gray-600">{courseName}</td>
                        )}
                        {visibleColumns.progress && (
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#3B5BFF] rounded-full"
                                  style={{ width: `${enrollment.progress}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600">{enrollment.progress}%</span>
                            </div>
                          </td>
                        )}
                        {visibleColumns.status && (
                          <td className="py-3 px-4">
                            <Badge className={`
                              ${enrollment.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                              ${enrollment.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : ''}
                              ${enrollment.status === 'not_started' ? 'bg-gray-100 text-gray-700' : ''}
                            `}>
                              {enrollment.status.replace('_', ' ')}
                            </Badge>
                          </td>
                        )}
                        {visibleColumns.enrolled && (
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {selectedCourse === 'all'
                  ? 'No students enrolled in any course yet'
                  : 'No students enrolled in this course yet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
