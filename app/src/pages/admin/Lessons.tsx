import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService, lessonService } from '@/services/mockApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { 
  ArrowLeft, Plus, Edit2, Trash2, GripVertical, PlayCircle, 
  FileText, Image, CheckCircle, Clock, Upload, Save
} from 'lucide-react';
import { toast } from 'sonner';
import type { Course, Lesson, LessonType } from '@/types';

export default function AdminLessons() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null);
  
  const [formData, setFormData] = useState<Partial<Lesson>>({
    title: '',
    type: 'video',
    description: '',
    content: '',
    duration: 0,
    allowDownload: false
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = () => {
    const courseData = courseService.getById(id!);
    if (courseData) {
      setCourse(courseData);
      const lessonsData = lessonService.getByCourse(id!);
      setLessons(lessonsData);
    } else {
      toast.error('Course not found');
      navigate('/admin/courses');
    }
  };

  const handleSaveLesson = () => {
    if (!formData.title?.trim()) {
      toast.error('Title is required');
      return;
    }

    const data = {
      ...formData,
      courseId: id!
    };

    let result;
    if (editingLesson) {
      result = lessonService.update(editingLesson.id, data);
    } else {
      result = lessonService.create(data);
    }

    if (result.success) {
      toast.success(editingLesson ? 'Lesson updated!' : 'Lesson created!');
      setLessonDialogOpen(false);
      setEditingLesson(null);
      setFormData({
        title: '',
        type: 'video',
        description: '',
        content: '',
        duration: 0,
        allowDownload: false
      });
      loadData();
    } else {
      toast.error(result.error || 'Failed to save lesson');
    }
  };

  const handleDelete = () => {
    if (!lessonToDelete) return;

    const result = lessonService.delete(lessonToDelete.id);
    if (result.success) {
      toast.success('Lesson deleted');
      loadData();
    } else {
      toast.error(result.error || 'Failed to delete lesson');
    }
    setDeleteDialogOpen(false);
    setLessonToDelete(null);
  };

  const openEditDialog = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      type: lesson.type,
      description: lesson.description,
      content: lesson.content,
      duration: lesson.duration,
      allowDownload: lesson.allowDownload
    });
    setLessonDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingLesson(null);
    setFormData({
      title: '',
      type: 'video',
      description: '',
      content: '',
      duration: 0,
      allowDownload: false
    });
    setLessonDialogOpen(true);
  };

  const getLessonIcon = (type: LessonType) => {
    switch (type) {
      case 'video': return <PlayCircle className="w-5 h-5" />;
      case 'document': return <FileText className="w-5 h-5" />;
      case 'image': return <Image className="w-5 h-5" />;
      case 'quiz': return <CheckCircle className="w-5 h-5" />;
      default: return <PlayCircle className="w-5 h-5" />;
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

  if (!course) {
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
          <Button variant="ghost" onClick={() => navigate('/admin/courses')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#0B0E14]">Course Content</h1>
            <p className="text-gray-500">{course.title}</p>
          </div>
        </div>
        <Button onClick={openCreateDialog} className="bg-[#3B5BFF] hover:bg-[#2a4aee]">
          <Plus className="w-4 h-4 mr-2" />
          Add Lesson
        </Button>
      </div>

      {/* Lessons List */}
      <div className="bg-white rounded-xl shadow-sm">
        {lessons.length > 0 ? (
          <div className="divide-y">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="text-gray-400 cursor-move">
                  <GripVertical className="w-5 h-5" />
                </div>
                <div className="w-8 h-8 rounded-full bg-[#3B5BFF]/10 flex items-center justify-center text-[#3B5BFF] font-medium text-sm">
                  {index + 1}
                </div>
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                  {getLessonIcon(lesson.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-[#0B0E14]">{lesson.title}</h4>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {lesson.type}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(lesson.duration)}
                    </span>
                    {lesson.allowDownload && (
                      <Badge variant="outline" className="text-xs">
                        Downloadable
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(lesson)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setLessonToDelete(lesson);
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
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-[#0B0E14] mb-2">No lessons yet</h3>
            <p className="text-gray-500 mb-4">Start building your course by adding lessons</p>
            <Button onClick={openCreateDialog} className="bg-[#3B5BFF] hover:bg-[#2a4aee]">
              <Plus className="w-4 h-4 mr-2" />
              Add First Lesson
            </Button>
          </div>
        )}
      </div>

      {/* Lesson Dialog */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Add Lesson'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Lesson Type</Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'video', label: 'Video', icon: PlayCircle },
                  { value: 'document', label: 'Doc', icon: FileText },
                  { value: 'image', label: 'Image', icon: Image },
                  { value: 'quiz', label: 'Quiz', icon: CheckCircle }
                ].map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value as LessonType })}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                      formData.type === type.value
                        ? 'border-[#3B5BFF] bg-[#3B5BFF]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <type.icon className={`w-5 h-5 ${formData.type === type.value ? 'text-[#3B5BFF]' : 'text-gray-500'}`} />
                    <span className={`text-xs ${formData.type === type.value ? 'text-[#3B5BFF]' : 'text-gray-600'}`}>
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-title">Lesson Title</Label>
              <Input
                id="lesson-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter lesson title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-description">Description</Label>
              <Textarea
                id="lesson-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this lesson"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-content">Content</Label>
              {formData.type === 'video' && (
                <Input
                  id="lesson-content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Video URL"
                />
              )}
              {formData.type === 'document' && (
                <Textarea
                  id="lesson-content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Document content"
                  rows={4}
                />
              )}
              {formData.type === 'image' && (
                <div className="space-y-2">
                  <Input
                    id="lesson-content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Image URL"
                  />
                  <Button type="button" variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
              )}
              {formData.type === 'quiz' && (
                <p className="text-sm text-gray-500">
                  Quiz will be configured separately. Save this lesson first.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="allow-download"
                checked={formData.allowDownload}
                onCheckedChange={(checked) => setFormData({ ...formData, allowDownload: checked })}
              />
              <Label htmlFor="allow-download">Allow download</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLesson} className="bg-[#3B5BFF] hover:bg-[#2a4aee]">
              <Save className="w-4 h-4 mr-2" />
              Save Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lesson</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Are you sure you want to delete "{lessonToDelete?.title}"? This action cannot be undone.
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
    </div>
  );
}
