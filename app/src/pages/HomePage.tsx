import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Users, Award, Zap, CheckCircle, Star } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: BookOpen,
      title: 'Course Marketplace',
      description: 'Browse by topic, skill level, and instructor.'
    },
    {
      icon: Zap,
      title: 'Structured Lessons',
      description: 'Video, text, and downloads—organized into clear sections.'
    },
    {
      icon: CheckCircle,
      title: 'Quizzes & Assessments',
      description: 'Auto-graded questions with instant feedback.'
    },
    {
      icon: Award,
      title: 'Progress Tracking',
      description: 'See exactly where you left off—across all devices.'
    },
    {
      icon: Star,
      title: 'Certificates',
      description: 'Earn proof of completion you can share.'
    },
    {
      icon: Users,
      title: 'Team Learning',
      description: 'Assign courses, set deadlines, and track team progress.'
    }
  ];

  const testimonials = [
    {
      quote: "The cleanest learning experience I've used. The progress tracking keeps me motivated.",
      author: 'Amina R.',
      role: 'Product Designer'
    },
    {
      quote: "I built my first course in a weekend. The instructor tools are incredibly intuitive.",
      author: 'David L.',
      role: 'Design Educator'
    },
    {
      quote: "Our team actually finishes courses now. The gamification really works.",
      author: 'Sarah K.',
      role: 'Engineering Manager'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F6F8FC] via-white to-[#F6F8FC]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #0B0E14 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B5BFF]/10 text-[#3B5BFF] text-sm font-medium mb-6">
                <Star className="w-4 h-4" />
                New: Team Learning is here
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-[#0B0E14] leading-tight mb-6">
                Learn what matters.
                <br />
                <span className="text-[#3B5BFF]">Teach what you love.</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                Short, practical courses taught by real experts. Build skills that move your career forward—or create your own courses.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/courses')}
                  className="bg-[#3B5BFF] hover:bg-[#2a4aee]"
                >
                  Explore Courses
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate('/register')}
                >
                  Start Teaching
                </Button>
              </div>
              <div className="flex items-center gap-6 mt-10 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Free to start
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Cancel anytime
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800"
                  alt="Students learning"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#0B0E14]">10K+</p>
                    <p className="text-sm text-gray-500">Active Learners</p>
                  </div>
                </div>
              </div>
              {/* Floating Badge Card */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#3B5BFF]/10 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-[#3B5BFF]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#0B0E14]">500+</p>
                    <p className="text-sm text-gray-500">Courses</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-medium text-[#3B5BFF] uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0B0E14] mb-4">
              Everything you need to learn and teach
            </h2>
            <p className="text-gray-600">
              From discovery to completion—one platform, zero friction.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 rounded-2xl bg-[#F6F8FC] hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100"
              >
                <div className="w-12 h-12 bg-[#3B5BFF]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#3B5BFF] transition-colors">
                  <feature.icon className="w-6 h-6 text-[#3B5BFF] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-[#0B0E14] mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Course Section */}
      <section className="py-24 bg-[#0B0E14] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #F6F8FC 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-medium text-[#3B5BFF] uppercase tracking-wider mb-3">Featured Course</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Design systems that scale
              </h2>
              <div className="flex flex-wrap gap-2 mb-6">
                {['UI Design', 'Figma', 'Beginner-friendly'].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-white/10 text-white text-sm">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-gray-400 mb-8">
                A practical course on building consistent interfaces—from tokens to components to documentation.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => navigate('/courses/course_3')}
                  className="bg-[#3B5BFF] hover:bg-[#2a4aee]"
                >
                  Preview Course
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => navigate('/courses')}
                >
                  View All Courses
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800"
                  alt="Design course"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-[#F6F8FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-medium text-[#3B5BFF] uppercase tracking-wider mb-3">Testimonials</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#0B0E14] mb-4">
              Loved by learners and teams
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-[#0B0E14]">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#0B0E14] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #F6F8FC 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to start learning—or teaching?
          </h2>
          <p className="text-gray-400 mb-8">
            Join thousands of learners and creators on LearnSphere. No credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/register')}
              className="bg-[#3B5BFF] hover:bg-[#2a4aee]"
            >
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => navigate('/courses')}
            >
              Browse Courses
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
