import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseService } from '@/services/mockApi';
import { quizzesApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  ArrowLeft, Plus, Edit2, Trash2, CheckCircle, XCircle,
  Save, GripVertical, X
} from 'lucide-react';
import { toast } from 'sonner';
import type { Course, Quiz, Question } from '@/types';

export default function AdminQuizBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);

  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    passingScore: 70,
    maxAttempts: 3,
    pointsPerAttempt: 50,
    timeLimit: 0
  });

  const [questionForm, setQuestionForm] = useState({
    text: '',
    type: 'single' as 'single' | 'multiple',
    options: [{ id: '1', text: '', isCorrect: false }]
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    const courseData = courseService.getById(id!);
    if (courseData) {
      setCourse(courseData);

      const response = await quizzesApi.getByCourse(id!);
      if (response.success && response.data && response.data.length > 0) {
        const quizData = response.data[0];
        setQuiz(quizData);
        setQuestions(quizData.questions || []);
        setQuizForm({
          title: quizData.title,
          description: quizData.description,
          passingScore: quizData.passingScore,
          maxAttempts: quizData.maxAttempts,
          pointsPerAttempt: quizData.pointsPerAttempt,
          timeLimit: quizData.timeLimit || 0
        });
      }
    } else {
      toast.error('Course not found');
      navigate('/admin/courses');
    }
  };

  const handleSaveQuiz = async () => {
    if (!quizForm.title.trim()) {
      toast.error('Quiz title is required');
      return;
    }

    let result;
    if (quiz) {
      result = await quizzesApi.update(quiz.id, {
        title: quizForm.title,
        description: quizForm.description,
        passingScore: quizForm.passingScore,
        maxAttempts: quizForm.maxAttempts,
        pointsPerAttempt: quizForm.pointsPerAttempt,
        timeLimit: quizForm.timeLimit || undefined
      });
    } else {
      result = await quizzesApi.create({
        courseId: id!,
        title: quizForm.title,
        description: quizForm.description,
        passingScore: quizForm.passingScore,
        maxAttempts: quizForm.maxAttempts,
        pointsPerAttempt: quizForm.pointsPerAttempt,
        timeLimit: quizForm.timeLimit || undefined
      });
    }

    if (result.success) {
      toast.success(quiz ? 'Quiz updated!' : 'Quiz created!');
      setQuizDialogOpen(false);
      loadData();
    } else {
      toast.error(result.error || 'Failed to save quiz');
    }
  };

  const handleSaveQuestion = async () => {
    if (!questionForm.text.trim()) {
      toast.error('Question text is required');
      return;
    }

    if (questionForm.options.some(o => !o.text.trim())) {
      toast.error('All options must have text');
      return;
    }

    if (!questionForm.options.some(o => o.isCorrect)) {
      toast.error('At least one option must be marked as correct');
      return;
    }

    if (!quiz) {
      toast.error('Please create a quiz first');
      return;
    }

    let result;
    if (editingQuestion) {
      result = await quizzesApi.updateQuestion(quiz.id, editingQuestion.id, {
        text: questionForm.text,
        type: questionForm.type,
        options: questionForm.options
      });
    } else {
      result = await quizzesApi.addQuestion(quiz.id, {
        text: questionForm.text,
        type: questionForm.type,
        options: questionForm.options
      });
    }

    if (result.success) {
      toast.success(editingQuestion ? 'Question updated!' : 'Question added!');
      setQuestionDialogOpen(false);
      setEditingQuestion(null);
      loadData();
    } else {
      toast.error(result.error || 'Failed to save question');
    }
  };

  const handleDeleteQuestion = async () => {
    if (!questionToDelete || !quiz) return;

    const result = await quizzesApi.deleteQuestion(quiz.id, questionToDelete.id);
    if (result.success) {
      toast.success('Question deleted');
      loadData();
    } else {
      toast.error(result.error || 'Failed to delete question');
    }
    setDeleteDialogOpen(false);
    setQuestionToDelete(null);
  };

  const openQuestionDialog = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      setQuestionForm({
        text: question.text,
        type: question.type,
        options: question.options.map(o => ({ ...o }))
      });
    } else {
      setEditingQuestion(null);
      setQuestionForm({
        text: '',
        type: 'single',
        options: [
          { id: '1', text: '', isCorrect: false },
          { id: '2', text: '', isCorrect: false }
        ]
      });
    }
    setQuestionDialogOpen(true);
  };

  const addOption = () => {
    setQuestionForm({
      ...questionForm,
      options: [...questionForm.options, { id: String(questionForm.options.length + 1), text: '', isCorrect: false }]
    });
  };

  const removeOption = (index: number) => {
    if (questionForm.options.length <= 2) {
      toast.error('At least 2 options are required');
      return;
    }
    setQuestionForm({
      ...questionForm,
      options: questionForm.options.filter((_, i) => i !== index)
    });
  };

  const updateOption = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = { ...newOptions[index], [field]: value };

    // For single choice, uncheck other options
    if (field === 'isCorrect' && value === true && questionForm.type === 'single') {
      newOptions.forEach((o, i) => {
        if (i !== index) o.isCorrect = false;
      });
    }

    setQuestionForm({ ...questionForm, options: newOptions });
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
            <h1 className="text-2xl font-bold text-[#0B0E14]">Quiz Builder</h1>
            <p className="text-gray-500">{course.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {quiz ? (
            <Button variant="outline" onClick={() => setQuizDialogOpen(true)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Quiz Settings
            </Button>
          ) : (
            <Button onClick={() => setQuizDialogOpen(true)} className="bg-[#3B5BFF] hover:bg-[#2a4aee]">
              <Plus className="w-4 h-4 mr-2" />
              Create Quiz
            </Button>
          )}
        </div>
      </div>

      {quiz ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quiz Settings Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-[#0B0E14]">Quiz Settings</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Passing Score</span>
                  <span className="font-medium">{quiz.passingScore}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Max Attempts</span>
                  <span className="font-medium">{quiz.maxAttempts}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Points</span>
                  <span className="font-medium">{quiz.pointsPerAttempt}</span>
                </div>
                {quiz.timeLimit && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Time Limit</span>
                    <span className="font-medium">{quiz.timeLimit} min</span>
                  </div>
                )}
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Questions</span>
                  <Badge>{questions.length}</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#0B0E14]">Questions</h3>
              <Button onClick={() => openQuestionDialog()} size="sm" className="bg-[#3B5BFF] hover:bg-[#2a4aee]">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="bg-white rounded-xl p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-gray-400 cursor-move mt-1">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#3B5BFF]/10 flex items-center justify-center text-[#3B5BFF] font-medium text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#0B0E14] mb-3">{question.text}</p>
                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <div
                            key={option.id}
                            className={`flex items-center gap-2 p-2 rounded-lg text-sm ${option.isCorrect ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'
                              }`}
                          >
                            {option.isCorrect ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-400" />
                            )}
                            <span>{option.text}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {question.type} choice
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openQuestionDialog(question)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setQuestionToDelete(question);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {questions.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-[#0B0E14] mb-2">No questions yet</h3>
                  <p className="text-gray-500 mb-4">Add questions to your quiz</p>
                  <Button onClick={() => openQuestionDialog()} className="bg-[#3B5BFF] hover:bg-[#2a4aee]">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Question
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-[#0B0E14] mb-2">No quiz yet</h3>
          <p className="text-gray-500 mb-6">Create a quiz to assess your students' knowledge</p>
          <Button onClick={() => setQuizDialogOpen(true)} className="bg-[#3B5BFF] hover:bg-[#2a4aee]">
            <Plus className="w-4 h-4 mr-2" />
            Create Quiz
          </Button>
        </div>
      )}

      {/* Quiz Settings Dialog */}
      <Dialog open={quizDialogOpen} onOpenChange={setQuizDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{quiz ? 'Edit Quiz' : 'Create Quiz'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quiz-title">Quiz Title</Label>
              <Input
                id="quiz-title"
                value={quizForm.title}
                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                placeholder="e.g., Final Assessment"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quiz-description">Description</Label>
              <Textarea
                id="quiz-description"
                value={quizForm.description}
                onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                placeholder="Describe what this quiz covers..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passing-score">Passing Score (%)</Label>
                <Input
                  id="passing-score"
                  type="number"
                  min="0"
                  max="100"
                  value={quizForm.passingScore}
                  onChange={(e) => setQuizForm({ ...quizForm, passingScore: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-attempts">Max Attempts</Label>
                <Input
                  id="max-attempts"
                  type="number"
                  min="1"
                  value={quizForm.maxAttempts}
                  onChange={(e) => setQuizForm({ ...quizForm, maxAttempts: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="points">Points per Pass</Label>
                <Input
                  id="points"
                  type="number"
                  min="0"
                  value={quizForm.pointsPerAttempt}
                  onChange={(e) => setQuizForm({ ...quizForm, pointsPerAttempt: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-limit">Time Limit (min, 0 = none)</Label>
                <Input
                  id="time-limit"
                  type="number"
                  min="0"
                  value={quizForm.timeLimit}
                  onChange={(e) => setQuizForm({ ...quizForm, timeLimit: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuizDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveQuiz} className="bg-[#3B5BFF] hover:bg-[#2a4aee]">
              <Save className="w-4 h-4 mr-2" />
              Save Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add Question'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Question Type</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setQuestionForm({ ...questionForm, type: 'single' })}
                  className={`flex-1 p-3 rounded-lg border-2 transition-colors ${questionForm.type === 'single'
                    ? 'border-[#3B5BFF] bg-[#3B5BFF]/5'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <span className={questionForm.type === 'single' ? 'text-[#3B5BFF]' : 'text-gray-600'}>
                    Single Choice
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuestionForm({ ...questionForm, type: 'multiple' })}
                  className={`flex-1 p-3 rounded-lg border-2 transition-colors ${questionForm.type === 'multiple'
                    ? 'border-[#3B5BFF] bg-[#3B5BFF]/5'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <span className={questionForm.type === 'multiple' ? 'text-[#3B5BFF]' : 'text-gray-600'}>
                    Multiple Choice
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="question-text">Question</Label>
              <Textarea
                id="question-text"
                value={questionForm.text}
                onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                placeholder="Enter your question..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Options</Label>
              <div className="space-y-2">
                {questionForm.options.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <input
                      type={questionForm.type === 'single' ? 'radio' : 'checkbox'}
                      name="correct-option"
                      checked={option.isCorrect}
                      onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Input
                      value={option.text}
                      onChange={(e) => updateOption(index, 'text', e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addOption} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuestionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveQuestion} className="bg-[#3B5BFF] hover:bg-[#2a4aee]">
              <Save className="w-4 h-4 mr-2" />
              Save Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Question</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Are you sure you want to delete this question? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteQuestion}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
