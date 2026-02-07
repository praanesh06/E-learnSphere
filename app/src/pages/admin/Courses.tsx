import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, courseService } from '@/services/mockApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { 
  Plus, Search, Grid, List, Edit, Trash2, Eye, Share2, 
  Clock, CheckCircle, XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import type { Course } from '@/types';

export default function AdminCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [courseToShare, setCourseToShare] = useState<Course | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchQuery, courses]);

  const loadCourses = () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const allCourses = courseService.getAll({ instructorId: currentUser.id });
    setCourses(allCourses);
    setFilteredCourses(allCourses);
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredCourses(filtered);
  };

  const handleDelete = () => {
    if (!courseToDelete) return;

    const result = courseService.delete(courseToDelete.id);
    if (result.success) {
      toast.success('Course deleted successfully');
      loadCourses();
    } else {
      toast.error(result.error || 'Failed to delete course');
    }
    setDeleteDialogOpen(false);
    setCourseToDelete(null);
  };

  const handleShare = () => {
    if (!courseToShare) return;
    
    const url = `${window.location.origin}/courses/${courseToShare.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
    setShareDialogOpen(false);
    setCourseToShare(null);
  };

  const handleTogglePublish = (course: Course) => {
    const newStatus = course.status === 'published' ? 'draft' : 'published';
    const result = courseService.update(course.id, { status: newStatus });
    
    if (result.success) {
      toast.success(`Course ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
      loadCourses();
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const draftCourses = filteredCourses.filter(c => c.status === 'draft');
  const publishedCourses = filteredCourses.filter(c => c.status === 'published');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0B0E14]">My Courses</h1>
          <p className="text-gray-500">Manage and organize your courses</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <div className="flex items-center bg-white rounded-lg border p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button 
            onClick={() => navigate('/admin/courses/new')}
            className="bg-[#3B5BFF] hover:bg-[#2a4aee]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Draft Column */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#0B0E14] flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                Draft
                <Badge variant="secondary">{draftCourses.length}</Badge>
              </h3>
            </div>
            <div className="space-y-4">
              {draftCourses.map(course => (
                <Card key={course.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={course.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200'}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[#0B0E14] truncate">{course.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {course.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(course.totalDuration)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {course.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePublish(course)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Publish
                      </Button>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCourseToShare(course);
                            setShareDialogOpen(true);
                          }}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCourseToDelete(course);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {draftCourses.length === 0 && (
                <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl">
                  No draft courses
                </div>
              )}
            </div>
          </div>

          {/* Published Column */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#0B0E14] flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                Published
                <Badge variant="secondary">{publishedCourses.length}</Badge>
              </h3>
            </div>
            <div className="space-y-4">
              {publishedCourses.map(course => (
                <Card key={course.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={course.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200'}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-[#0B0E14] truncate">{course.title}</h4>
                          <Badge className="bg-green-100 text-green-700 text-xs">Live</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {course.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(course.totalDuration)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {course.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePublish(course)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Unpublish
                      </Button>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCourseToShare(course);
                            setShareDialogOpen(true);
                          }}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCourseToDelete(course);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {publishedCourses.length === 0 && (
                <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl">
                  No published courses
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {filteredCourses.length > 0 ? (
              <div className="divide-y">
                {filteredCourses.map(course => (
                  <div 
                    key={course.id}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={course.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200'}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-[#0B0E14]">{course.title}</h4>
                        <Badge className={course.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {course.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {course.views} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(course.totalDuration)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePublish(course)}
                      >
                        {course.status === 'published' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCourseToDelete(course);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No courses found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Are you sure you want to delete "{courseToDelete?.title}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Course</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 mb-4">
            Share this link with your students:
          </p>
          <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
            <code className="flex-1 text-sm truncate">
              {`${window.location.origin}/courses/${courseToShare?.id}`}
            </code>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
