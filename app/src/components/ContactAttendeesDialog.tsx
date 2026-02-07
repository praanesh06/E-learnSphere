import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Send, Loader2, CheckCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import { enrollmentsApi } from '@/services/api';
import type { Enrollment } from '@/types';

interface ContactAttendeesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId: string;
    courseTitle: string;
}

export function ContactAttendeesDialog({
    open,
    onOpenChange,
    courseId,
    courseTitle
}: ContactAttendeesDialogProps) {
    const [step, setStep] = useState<'select' | 'compose' | 'success'>('select');
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'in_progress' | 'not_started'>('all');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sentCount, setSentCount] = useState(0);

    useEffect(() => {
        if (open) {
            loadEnrollments();
        }
    }, [open, courseId]);

    const loadEnrollments = async () => {
        try {
            const response = await enrollmentsApi.getByCourse(courseId);
            if (response.success && response.data) {
                setEnrollments(response.data);
            }
        } catch (error) {
            console.error('Failed to load enrollments:', error);
        }
    };

    const getFilteredCount = () => {
        if (selectedFilter === 'all') return enrollments.length;
        return enrollments.filter(e => e.status === selectedFilter).length;
    };

    const handleSend = async () => {
        if (!subject.trim() || !message.trim()) {
            toast.error('Please enter subject and message');
            return;
        }

        setIsLoading(true);

        // Simulate sending emails (in real implementation, this would call backend)
        const filteredEnrollments = selectedFilter === 'all'
            ? enrollments
            : enrollments.filter(e => e.status === selectedFilter);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        setSentCount(filteredEnrollments.length);
        setStep('success');
        setIsLoading(false);

        toast.success(`Email sent to ${filteredEnrollments.length} attendee(s)!`);
    };

    const handleClose = () => {
        setStep('select');
        setSelectedFilter('all');
        setSubject('');
        setMessage('');
        setSentCount(0);
        onOpenChange(false);
    };

    const filterOptions = [
        { value: 'all', label: 'All Attendees', count: enrollments.length },
        { value: 'completed', label: 'Completed', count: enrollments.filter(e => e.status === 'completed').length },
        { value: 'in_progress', label: 'In Progress', count: enrollments.filter(e => e.status === 'in_progress').length },
        { value: 'not_started', label: 'Not Started', count: enrollments.filter(e => e.status === 'not_started').length },
    ] as const;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-[#3B5BFF]" />
                        Contact Attendees - {courseTitle}
                    </DialogTitle>
                </DialogHeader>

                {step === 'select' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Select Recipients</Label>
                            <div className="space-y-2">
                                {filterOptions.map(option => (
                                    <label
                                        key={option.value}
                                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedFilter === option.value
                                            ? 'border-[#3B5BFF] bg-[#3B5BFF]/5'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="filter"
                                                checked={selectedFilter === option.value}
                                                onChange={() => setSelectedFilter(option.value)}
                                                className="text-[#3B5BFF]"
                                            />
                                            <span>{option.label}</span>
                                        </div>
                                        <span className="text-sm text-gray-500">{option.count} attendee(s)</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => getFilteredCount() > 0 ? setStep('compose') : toast.error('No attendees match this filter')}
                                className="bg-[#3B5BFF] hover:bg-[#2a4aee]"
                                disabled={getFilteredCount() === 0}
                            >
                                Continue
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {step === 'compose' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                                Sending to {getFilteredCount()} attendee(s)
                            </span>
                        </div>
                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Input
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Enter email subject"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Message</Label>
                            <Textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write your message here..."
                                rows={6}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setStep('select')}>
                                Back
                            </Button>
                            <Button
                                onClick={handleSend}
                                disabled={isLoading || !subject.trim() || !message.trim()}
                                className="bg-[#3B5BFF] hover:bg-[#2a4aee]"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Send Email
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {step === 'success' && (
                    <div className="space-y-4">
                        <div className="text-center py-6">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium">Email Sent Successfully!</h3>
                            <p className="text-gray-500">
                                Your message was sent to {sentCount} attendee(s)
                            </p>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleClose} className="bg-[#3B5BFF] hover:bg-[#2a4aee]">
                                Done
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default ContactAttendeesDialog;
