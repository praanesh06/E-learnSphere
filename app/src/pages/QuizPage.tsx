import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizzesApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle, XCircle, Clock, ArrowLeft, ArrowRight,
  Trophy, RotateCcw, Check
} from 'lucide-react';
import { toast } from 'sonner';
import type { Quiz, Question, QuizAttempt } from '@/types';

export default function QuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (quizId) {
      loadQuizData();
    }
  }, [quizId]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResults) {
      handleSubmit();
    }
  }, [timeLeft, showResults]);

  const loadQuizData = async () => {
    if (!quizId) return;

    const response = await quizzesApi.getById(quizId);
    if (response.success && response.data) {
      setQuiz(response.data);
      setQuestions(response.data.questions || []);
      if (response.data.timeLimit) {
        setTimeLeft(response.data.timeLimit * 60);
      }
    }
  };

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    const question = questions.find(q => (q as any)._id === questionId || q.id === questionId);
    if (!question) return;

    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];

      if (question.type === 'single') {
        return { ...prev, [questionId]: [optionId] };
      } else {
        // Multiple choice - toggle selection
        if (currentAnswers.includes(optionId)) {
          return { ...prev, [questionId]: currentAnswers.filter(id => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...currentAnswers, optionId] };
        }
      }
    });
  };

  const handleSubmit = async () => {
    if (!quizId) return;

    const result = await quizzesApi.submitAttempt(quizId, answers);
    if (result.success && result.data) {
      setAttempt(result.data);
      setShowResults(true);

      if (result.data.passed) {
        toast.success(`Congratulations! You scored ${result.data.score}%`);
      } else {
        toast.info(`You scored ${result.data.score}%. Keep practicing!`);
      }
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setAttempt(null);
    if (quiz?.timeLimit) {
      setTimeLeft(quiz.timeLimit * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper functions for MongoDB _id compatibility
  const getQuestionId = (question: Question) => (question as any)._id || question.id;
  const getOptionId = (option: any) => option._id || option.id;

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B5BFF]"></div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentQuestionId = getQuestionId(currentQuestion);
  const answeredCount = Object.keys(answers).length;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Results View
  if (showResults && attempt) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className={`
                w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6
                ${attempt.passed ? 'bg-green-100' : 'bg-orange-100'}
              `}>
                {attempt.passed ? (
                  <Trophy className="w-12 h-12 text-green-600" />
                ) : (
                  <RotateCcw className="w-12 h-12 text-orange-600" />
                )}
              </div>

              <h2 className="text-2xl font-bold text-[#0B0E14] mb-2">
                {attempt.passed ? 'Congratulations!' : 'Keep Practicing!'}
              </h2>
              <p className="text-gray-600 mb-6">
                {attempt.passed
                  ? 'You passed the quiz and earned points!'
                  : 'You didn\'t pass this time, but keep learning!'}
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-3xl font-bold text-[#0B0E14]">{attempt.score}%</p>
                  <p className="text-sm text-gray-500">Score</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-3xl font-bold text-[#0B5BFF]">{attempt.pointsEarned}</p>
                  <p className="text-sm text-gray-500">Points</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-3xl font-bold text-[#0B0E14]">{attempt.attemptNumber}</p>
                  <p className="text-sm text-gray-500">Attempt</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  Passing score: {quiz.passingScore}%
                </p>

                <div className="flex gap-3 justify-center">
                  {!attempt.passed && attempt.attemptNumber < quiz.maxAttempts && (
                    <Button
                      onClick={handleRetry}
                      variant="outline"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  )}
                  <Button
                    onClick={() => navigate(-1)}
                    className="bg-[#3B5BFF] hover:bg-[#2a4aee]"
                  >
                    Continue Learning
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Review */}
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-[#0B0E14]">Question Review</h3>
            {questions.map((question, index) => {
              const questionId = getQuestionId(question);
              const userAnswers = answers[questionId] || [];
              const correctAnswers = question.options.filter(o => o.isCorrect).map(o => getOptionId(o));
              const isCorrect = question.type === 'single'
                ? userAnswers.length === 1 && correctAnswers.includes(userAnswers[0])
                : correctAnswers.every(ca => userAnswers.includes(ca)) &&
                userAnswers.every(ua => correctAnswers.includes(ua));
              userAnswers.every(ua => correctAnswers.includes(ua));

              return (
                <Card key={getQuestionId(question)} className="border-0 shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                        {isCorrect ? <Check className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#0B0E14] mb-3">
                          {index + 1}. {question.text}
                        </p>
                        <div className="space-y-2">
                          {question.options.map(option => {
                            const optionId = getOptionId(option);
                            const isSelected = userAnswers.includes(optionId);
                            const isCorrectOption = option.isCorrect;

                            return (
                              <div
                                key={optionId}
                                className={`p-3 rounded-lg text-sm ${isCorrectOption
                                  ? 'bg-green-50 border border-green-200 text-green-800'
                                  : isSelected
                                    ? 'bg-red-50 border border-red-200 text-red-800'
                                    : 'bg-gray-50 text-gray-600'
                                  }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isCorrectOption && <Check className="w-4 h-4" />}
                                  {isSelected && !isCorrectOption && <XCircle className="w-4 h-4" />}
                                  <span>{option.text}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Quiz View
  return (
    <div className="min-h-screen bg-[#F6F8FC] py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-[#0B0E14] mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to course
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0B0E14]">{quiz.title}</h1>
              <p className="text-gray-500">{quiz.description}</p>
            </div>
            {timeLeft !== null && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-white'
                }`}>
                <Clock className="w-5 h-5" />
                <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500">Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span className="text-gray-500">{answeredCount} answered</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="mb-2">
              <Badge variant="secondary" className="mb-4">
                {currentQuestion.type === 'single' ? 'Single Choice' : 'Multiple Choice'}
              </Badge>
            </div>
            <h3 className="text-lg font-medium text-[#0B0E14] mb-6">
              {currentQuestion.text}
            </h3>

            <div className="space-y-3">
              {currentQuestion.options.map(option => {
                const optionId = getOptionId(option);
                const isSelected = (answers[currentQuestionId] || []).includes(optionId);

                return (
                  <button
                    key={optionId}
                    onClick={() => handleAnswerSelect(currentQuestionId, optionId)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${isSelected
                      ? 'border-[#3B5BFF] bg-[#3B5BFF]/5'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected
                        ? 'border-[#3B5BFF] bg-[#3B5BFF]'
                        : 'border-gray-300'
                        }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={isSelected ? 'text-[#3B5BFF]' : 'text-[#0B0E14]'}>
                        {option.text}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${index === currentQuestionIndex
                  ? 'bg-[#3B5BFF] text-white'
                  : answers[questions[index].id]?.length > 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={answeredCount < questions.length}
              className="bg-[#3B5BFF] hover:bg-[#2a4aee]"
            >
              Submit Quiz
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              className="bg-[#3B5BFF] hover:bg-[#2a4aee]"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {answeredCount < questions.length && (
          <p className="text-center text-sm text-gray-500 mt-4">
            You have {questions.length - answeredCount} unanswered question{questions.length - answeredCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
