import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '@/services/mockApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { 
  ArrowLeft, Save, Eye, Plus, X, Upload, Globe, User, 
  Lock, Users, DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import type { Course, CourseVisibility } from '@/types';

export default function AdminCourseForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [course, setCourse] = useState<Partial<Course>>({
    title: '',
    description: '',
    tags: [],
    image: '',
    website: '',
    responsiblePerson: '',
    visibility: 'everyone',
    price: undefined,
    status: 'draft'
  });
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadCourse();
    }
  }, [id]);

  const loadCourse = () => {
    const courseData = courseService.getById(id!);
    if (courseData) {
      setCourse(courseData);
    } else {
      toast.error('Course not found');
      navigate('/admin/courses');
    }
  };

  const handleSave = async (publish = false) => {
    setIsLoading(true);

    const data = { ...course };
    if (publish) {
      data.status = 'published';
    }

    let result;
    if (isEditing) {
      result = courseService.update(id!, data);
    } else {
      result = courseService.create(data);
    }

    if (result.success) {
      toast.success(isEditing ? 'Course updated!' : 'Course created!');
      if (!isEditing) {
        navigate(`/admin/courses/${result.data!.id}/edit`);
      }
    } else {
      toast.error(result.error || 'Failed to save course');
    }

    setIsLoading(false);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !course.tags?.includes(newTag.trim())) {
      setCourse({ ...course, tags: [...(course.tags || []), newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setCourse({ ...course, tags: course.tags?.filter(tag => tag !== tagToRemove) || [] });
  };

  const handleImageUpload = () => {
    // Simulate image upload with a random Unsplash image
    const images = [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800'
    ];
    const randomImage = images[Math.floor(Math.random() * images.length)];
    setCourse({ ...course, image: randomImage });
    toast.success('Image uploaded!');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/courses')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#0B0E14]">
              {isEditing ? 'Edit Course' : 'Create Course'}
            </h1>
            <p className="text-gray-500">
              {isEditing ? course.title : 'Create a new course'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Switch
            checked={course.status === 'published'}
            onCheckedChange={(checked) => setCourse({ ...course, status: checked ? 'published' : 'draft' })}
          />
          <span className="text-sm">
            {course.status === 'published' ? 'Published' : 'Draft'}
          </span>
          <Button 
            onClick={() => handleSave()}
            disabled={isLoading}
            className="bg-[#3B5BFF] hover:bg-[#2a4aee]"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="bg-white">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={course.title}
                    onChange={(e) => setCourse({ ...course, title: e.target.value })}
                    placeholder="Enter course title"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {course.tags?.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="website"
                      value={course.website || ''}
                      onChange={(e) => setCourse({ ...course, website: e.target.value })}
                      placeholder="https://your-course-website.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsible">Responsible Person</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="responsible"
                      value={course.responsiblePerson || ''}
                      onChange={(e) => setCourse({ ...course, responsiblePerson: e.target.value })}
                      placeholder="Name of person responsible"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <Label className="mb-4 block">Course Image</Label>
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-4">
                  {course.image ? (
                    <img src={course.image} alt="Course" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Upload className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <Button variant="outline" className="w-full" onClick={handleImageUpload}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
              </div>

              {isEditing && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h4 className="font-medium mb-4">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate(`/admin/courses/${id}/lessons`)}
                    >
                      Manage Lessons
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate(`/admin/courses/${id}/quiz`)}
                    >
                      Manage Quiz
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Description Tab */}
        <TabsContent value="description">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="description">Course Description</Label>
              <Textarea
                id="description"
                value={course.description}
                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                placeholder="Describe what students will learn in this course..."
                rows={10}
              />
            </div>
          </div>
        </TabsContent>

        {/* Options Tab */}
        <TabsContent value="options">
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h4 className="font-medium mb-4">Visibility</h4>
              <div className="space-y-3">
                {[
                  { value: 'everyone', label: 'Everyone', icon: Globe, desc: 'Anyone can view this course' },
                  { value: 'signed_in', label: 'Signed-in users only', icon: Users, desc: 'Only logged-in users can view' },
                  { value: 'invitation', label: 'Invitation only', icon: Lock, desc: 'Only invited users can access' },
                  { value: 'payment', label: 'Paid course', icon: DollarSign, desc: 'Users must pay to access' }
                ].map(option => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      course.visibility === option.value
                        ? 'border-[#3B5BFF] bg-[#3B5BFF]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={option.value}
                      checked={course.visibility === option.value}
                      onChange={(e) => setCourse({ ...course, visibility: e.target.value as CourseVisibility })}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4" />
                        <span className="font-medium">{option.label}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {course.visibility === 'payment' && (
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={course.price || ''}
                  onChange={(e) => setCourse({ ...course, price: parseFloat(e.target.value) })}
                  placeholder="29.99"
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Course Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {course.image && (
              <div className="aspect-video rounded-lg overflow-hidden">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold">{course.title || 'Untitled Course'}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {course.tags?.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
            <p className="text-gray-600">{course.description || 'No description'}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                {course.visibility}
              </span>
              {course.price && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {course.price}
                </span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
