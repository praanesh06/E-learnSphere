import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { courseService, lessonService, enrollmentService, progressService } from '@/services/mockApi';
import { quizzesApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  PlayCircle, FileText, Image, CheckCircle, ChevronLeft, ChevronRight,
  Download, Check
} from 'lucide-react';
import { toast } from 'sonner';
import type { Course, Lesson, Enrollment } from '@/types';

export default function LessonPlayerPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [courseQuizzes, setCourseQuizzes] = useState<any[]>([]);

  useEffect(() => {
    if (courseId) {
      loadCourseData();
    }
  }, [courseId]);

  useEffect(() => {
    const lessonId = searchParams.get('lesson');
    if (lessonId && lessons.length > 0) {
      const lesson = lessons.find(l => l.id === lessonId);
      if (lesson) {
        setCurrentLesson(lesson);
      }
    } else if (lessons.length > 0 && !currentLesson) {
      setCurrentLesson(lessons[0]);
    }
  }, [lessons, searchParams]);

  const loadCourseData = async () => {
    if (!courseId) return;

    const courseData = courseService.getById(courseId);
    if (courseData) {
      setCourse(courseData);

      const lessonsData = lessonService.getByCourse(courseId);
      setLessons(lessonsData);

      // Load quizzes from real API
      const quizResponse = await quizzesApi.getByCourse(courseId);
      if (quizResponse.success && quizResponse.data) {
        setCourseQuizzes(quizResponse.data);
      }

      // Get enrollment
      const user = JSON.parse(localStorage.getItem('ls_current_user') || 'null');
      if (user) {
        const enrollments = enrollmentService.getByUser(user.id);
        const courseEnrollment = enrollments.find(e => e.courseId === courseId);
        if (courseEnrollment) {
          setEnrollment(courseEnrollment);

          // Update to in_progress if not started
          if (courseEnrollment.status === 'not_started') {
            enrollmentService.updateProgress(courseEnrollment.id, 0);
          }
        }
      }

      // Get completed lessons
      const progress = JSON.parse(localStorage.getItem('ls_progress') || '[]');
      const currentUser = JSON.parse(localStorage.getItem('ls_current_user') || 'null');
      const completed = new Set<string>(
        progress
          .filter((p: any) => p.userId === currentUser?.id && p.courseId === courseId && p.completed)
          .map((p: any) => p.lessonId)
      );
      setCompletedLessons(completed);
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setSearchParams({ lesson: lesson.id });
  };

  const handleMarkComplete = () => {
    if (!currentLesson || !courseId) return;

    const user = JSON.parse(localStorage.getItem('ls_current_user') || 'null');
    if (!user) return;

    const result = progressService.markComplete(user.id, currentLesson.id, courseId);
    if (result.success) {
      toast.success('Lesson completed!');
      setCompletedLessons(prev => new Set([...prev, currentLesson.id]));
      loadCourseData();

      // Auto-advance to next lesson
      const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
      if (currentIndex < lessons.length - 1) {
        setTimeout(() => {
          handleLessonClick(lessons[currentIndex + 1]);
        }, 1000);
      }
    }
  };

  const handlePrevious = () => {
    const currentIndex = lessons.findIndex(l => l.id === currentLesson?.id);
    if (currentIndex > 0) {
      handleLessonClick(lessons[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    const currentIndex = lessons.findIndex(l => l.id === currentLesson?.id);
    if (currentIndex < lessons.length - 1) {
      handleLessonClick(lessons[currentIndex + 1]);
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayCircle className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'quiz': return <CheckCircle className="w-4 h-4" />;
      default: return <PlayCircle className="w-4 h-4" />;
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

  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B5BFF]"></div>
      </div>
    );
  }

  const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === lessons.length - 1;
  const isCompleted = completedLessons.has(currentLesson.id);

  return (
    <div className="min-h-screen bg-[#0B0E14] flex">
      {/* Sidebar */}
      <div
        className={`bg-[#0f1219] border-r border-gray-800 transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'
          }`}
      >
        <div className="p-4 border-b border-gray-800">
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-3"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to course
          </button>
          <h2 className="font-semibold text-white truncate">{course.title}</h2>
          <div className="mt-2">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
              <span>{enrollment?.progress || 0}% complete</span>
              <span>{completedLessons.size}/{lessons.length} lessons</span>
            </div>
            <Progress value={enrollment?.progress || 0} className="h-1.5" />
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-140px)]">
          {lessons.map((lesson, index) => {
            const isActive = lesson.id === currentLesson.id;
            const isLessonCompleted = completedLessons.has(lesson.id);

            return (
              <button
                key={lesson.id}
                onClick={() => handleLessonClick(lesson)}
                className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${isActive
                  ? 'bg-[#3B5BFF]/20 border-l-2 border-[#3B5BFF]'
                  : 'hover:bg-gray-800/50 border-l-2 border-transparent'
                  }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isLessonCompleted
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-700 text-gray-400'
                  }`}>
                  {isLessonCompleted ? <Check className="w-3 h-3" /> : index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>
                    {lesson.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    {getLessonIcon(lesson.type)}
                    <span>{formatDuration(lesson.duration)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-[#0f1219] border-b border-gray-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white"
            >
              <ChevronLeft className={`w-5 h-5 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
            </button>
            <h1 className="text-white font-medium truncate">{currentLesson.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <Button variant="ghost" size="sm" onClick={handlePrevious} className="text-gray-400">
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <span className="text-sm text-gray-500">
              {currentIndex + 1} / {lessons.length}
            </span>
            {!isLast && (
              <Button variant="ghost" size="sm" onClick={handleNext} className="text-gray-400">
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Lesson Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            {/* Content based on lesson type */}
            {currentLesson.type === 'video' && (
              <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden mb-6">
                {currentLesson.content && (
                  currentLesson.content.includes('youtube.com') ||
                    currentLesson.content.includes('youtu.be') ? (
                    // YouTube embed
                    <iframe
                      src={currentLesson.content.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                      title={currentLesson.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : currentLesson.content.includes('vimeo.com') ? (
                    // Vimeo embed
                    <iframe
                      src={currentLesson.content.replace('vimeo.com/', 'player.vimeo.com/video/')}
                      title={currentLesson.title}
                      className="w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    // Direct video file
                    <video
                      src={currentLesson.content}
                      controls
                      className="w-full h-full"
                      poster={course.image}
                    >
                      Your browser does not support the video tag.
                    </video>
                  )
                )}
                {!currentLesson.content && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <PlayCircle className="w-16 h-16 text-[#3B5BFF] mx-auto mb-4" />
                      <p className="text-gray-400">No video URL provided</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentLesson.type === 'document' && (
              <div className="bg-white rounded-xl p-8 mb-6">
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-[#0B0E14] mb-4">{currentLesson.title}</h2>
                  <div className="text-gray-700 whitespace-pre-wrap">{currentLesson.content}</div>
                </div>
              </div>
            )}

            {currentLesson.type === 'image' && (
              <div className="rounded-xl overflow-hidden mb-6">
                <img
                  src={currentLesson.content || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800'}
                  alt={currentLesson.title}
                  className="w-full h-auto"
                />
              </div>
            )}

            {currentLesson.type === 'quiz' && (() => {
              // Find quiz linked to this lesson, or fall back to first course quiz
              const linkedQuiz = courseQuizzes.find(q => q.lessonId === currentLesson.id)
                || courseQuizzes[0]; // Fallback to first quiz if none specifically linked

              return (
                <div className="bg-white rounded-xl p-8 mb-6 text-center">
                  <CheckCircle className="w-16 h-16 text-[#3B5BFF] mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-[#0B0E14] mb-2">Quiz Time!</h2>
                  <p className="text-gray-600 mb-6">Test your knowledge with this quiz</p>
                  {linkedQuiz ? (
                    <Button
                      onClick={() => navigate(`/quiz/${linkedQuiz.id}`)}
                      className="bg-[#3B5BFF] hover:bg-[#2a4aee]"
                    >
                      Start Quiz
                    </Button>
                  ) : (
                    <p className="text-gray-500">Quiz not configured yet</p>
                  )}
                </div>
              );
            })()}

            {/* Lesson Info */}
            <div className="bg-[#0f1219] rounded-xl p-6 border border-gray-800">
              <h3 className="font-semibold text-white mb-2">About this lesson</h3>
              <p className="text-gray-400 mb-4">{currentLesson.description}</p>

              {currentLesson.attachments.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Attachments</h4>
                  <div className="space-y-2">
                    {currentLesson.attachments.map(attachment => (
                      <a
                        key={attachment.id}
                        href={attachment.url}
                        className="flex items-center gap-2 text-[#3B5BFF] hover:underline"
                      >
                        <Download className="w-4 h-4" />
                        {attachment.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#0f1219] border-t border-gray-800 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirst}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {!isCompleted && currentLesson.type !== 'quiz' && (
              <Button
                onClick={handleMarkComplete}
                className="bg-[#3B5BFF] hover:bg-[#2a4aee]"
              >
                <Check className="w-4 h-4 mr-2" />
                Mark as Complete
              </Button>
            )}

            {isCompleted && (
              <Badge className="bg-green-500/20 text-green-400 border-0">
                <Check className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}

            <Button
              variant="outline"
              onClick={handleNext}
              disabled={isLast}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
