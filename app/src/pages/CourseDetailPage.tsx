import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesApi, lessonsApi, enrollmentsApi, reviewsApi, authApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Clock, Users, PlayCircle, FileText, Image, CheckCircle,
  Lock, ArrowLeft, BookOpen, MessageSquare, Send
} from 'lucide-react';
import { toast } from 'sonner';
import { PaymentModal } from '@/components/PaymentModal';
import { StarRating } from '@/components/StarRating';
import type { Course, Lesson, Review, Enrollment } from '@/types';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [ratingSummary, setRatingSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const isAuthenticated = authApi.isAuthenticated();
  const currentUser = authApi.getCurrentUser();

  useEffect(() => {
    if (id) {
      loadCourseData();
    }
  }, [id]);



  const loadCourseData = async () => {
    if (!id) return;

    const courseResponse = await coursesApi.getById(id);
    if (courseResponse.success && courseResponse.data) {
      setCourse(courseResponse.data);



      // Fetch rating summary
      const ratingResponse = await coursesApi.getRating(id);
      if (ratingResponse.success && ratingResponse.data) {
        setRatingSummary(ratingResponse.data);
      }

      const lessonsResponse = await lessonsApi.getByCourse(id);
      if (lessonsResponse.success && lessonsResponse.data) {
        setLessons(lessonsResponse.data);
      }

      const reviewsResponse = await reviewsApi.getByCourse(id);
      if (reviewsResponse.success && reviewsResponse.data) {
        setReviews(reviewsResponse.data);
      }

      if (currentUser) {
        const enrollmentsResponse = await enrollmentsApi.getByUser();
        if (enrollmentsResponse.success && enrollmentsResponse.data) {
          const courseEnrollment = enrollmentsResponse.data.find((e: any) => e.courseId === id);
          setEnrollment(courseEnrollment || null);
        }
      }
    }
    setIsLoading(false);
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to enroll');
      navigate('/login');
      return;
    }

    if (!currentUser || !id || !course) return;

    // Check if course implies payment
    if (course.price && course.price > 0 && course.visibility === 'payment') {
      setShowPaymentModal(true);
      return;
    }

    const result = await enrollmentsApi.enroll(id);
    if (result.success) {
      toast.success('Enrolled successfully!');
      loadCourseData();
    } else {
      toast.error(result.error || 'Failed to enroll');
    }
  };

  const handlePaymentSuccess = () => {
    loadCourseData();
  };

  const handleSubmitReview = async () => {
    if (!currentUser || !id) return;

    const result = await reviewsApi.create(id, newReview.rating, newReview.comment);

    if (result.success) {
      toast.success('Review submitted!');
      setReviewDialogOpen(false);
      setNewReview({ rating: 5, comment: '' });
      loadCourseData();
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayCircle className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'quiz': return <CheckCircle className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
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

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  const userHasReviewed = currentUser && reviews.some(r => r.userId === currentUser.id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B5BFF]"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0B0E14] mb-2">Course not found</h2>
          <Button onClick={() => navigate('/courses')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to courses
          </Button>
        </div>
      </div>
    );
  }

  const canAccess = course.visibility === 'everyone' || ((course.visibility === 'signed_in' || course.visibility === 'payment') && isAuthenticated);

  return (
    <div className="min-h-screen bg-[#F6F8FC]">
      {/* Hero Section */}
      <div className="bg-[#0B0E14] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to courses
          </button>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                {course.tags.map(tag => (
                  <Badge key={tag} className="bg-white/10 text-white hover:bg-white/20">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-gray-300 text-lg mb-6">{course.description}</p>
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <StarRating rating={Number(averageRating)} size="md" />
                  <span className="font-medium">{averageRating}</span>
                  <span className="text-gray-400">({reviews.length} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span>{((course as any).enrollmentCount || 0).toLocaleString()} enrolled</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span>{formatDuration(course.totalDuration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-gray-400" />
                  <span>{lessons.length} lessons</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                {enrollment ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Your progress</p>
                      <div className="flex items-center gap-3">
                        <Progress value={enrollment.progress} className="flex-1" />
                        <span className="font-medium">{enrollment.progress}%</span>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-[#3B5BFF] hover:bg-[#2a4aee]"
                      onClick={() => navigate(`/learn/${(course as any)._id || course.id}`)}
                    >
                      {enrollment.progress === 0 ? 'Start Learning' : 'Continue Learning'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      {course.price ? (
                        <p className="text-3xl font-bold">${course.price}</p>
                      ) : (
                        <p className="text-3xl font-bold">Free</p>
                      )}
                    </div>
                    <Button
                      className="w-full bg-[#3B5BFF] hover:bg-[#2a4aee]"
                      onClick={handleEnroll}
                      disabled={!canAccess}
                    >
                      {!canAccess ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Sign in to Enroll
                        </>
                      ) : (
                        'Enroll Now'
                      )}
                    </Button>
                    <p className="text-center text-sm text-gray-400">
                      Lifetime access • Certificate included
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="content">Course Content</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm">
              {lessons.length > 0 ? (
                lessons.map((lesson, index) => {
                  const lessonId = (lesson as any)._id || lesson.id;
                  const courseId = (course as any)._id || course.id;
                  return (
                    <div
                      key={lessonId}
                      className={`flex items-center gap-4 p-4 ${index !== lessons.length - 1 ? 'border-b' : ''} ${enrollment ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-70'
                        }`}
                      onClick={() => enrollment && navigate(`/learn/${courseId}?lesson=${lessonId}`)}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#F6F8FC] flex items-center justify-center text-sm font-medium text-gray-500">
                        {index + 1}
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-[#3B5BFF]/10 flex items-center justify-center text-[#3B5BFF]">
                        {getLessonIcon(lesson.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-[#0B0E14]">{lesson.title}</h4>
                        <p className="text-sm text-gray-500">{lesson.description}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(lesson.duration)}
                        </span>
                        {!enrollment && <Lock className="w-4 h-4" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No lessons available yet
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-6">
              {/* Review Summary */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-[#0B0E14]">{averageRating}</p>
                    <div className="flex gap-1 my-2">
                      <StarRating rating={Number(averageRating)} size="lg" />
                    </div>
                    <p className="text-sm text-gray-500">{reviews.length} reviews</p>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = reviews.filter(r => r.rating === star).length;
                      const percentage = reviews.length ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-3 mb-2">
                          <span className="text-sm text-gray-500 w-8">{star} star</span>
                          <Progress value={percentage} className="flex-1 h-2" />
                          <span className="text-sm text-gray-500 w-10">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Write Review Button */}
              {isAuthenticated && enrollment && !userHasReviewed && (
                <Button
                  onClick={() => setReviewDialogOpen(true)}
                  className="bg-[#3B5BFF] hover:bg-[#2a4aee]"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Write a Review
                </Button>
              )}

              {/* Reviews List */}
              <div className="grid gap-4">
                {reviews.map(review => {
                  const reviewId = (review as any)._id || review.id;
                  return (
                    <Card key={reviewId}>
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarFallback className="bg-[#3B5BFF] text-white">
                              {review.userId.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex gap-0.5">
                                <StarRating rating={review.rating} size="sm" />
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <div className="flex gap-2">
                <div className="flex gap-2">
                  <StarRating
                    rating={newReview.rating}
                    maxRating={5}
                    size="lg"
                    interactive={true}
                    onRatingChange={(rating) => setNewReview({ ...newReview, rating })}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Your Review</label>
              <Textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Share your experience with this course..."
                rows={4}
              />
            </div>
            <Button
              onClick={handleSubmitReview}
              className="w-full bg-[#3B5BFF] hover:bg-[#2a4aee]"
              disabled={!newReview.comment.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <PaymentModal
        course={course}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
