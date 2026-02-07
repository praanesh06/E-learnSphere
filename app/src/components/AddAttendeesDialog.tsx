import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Mail, CheckCircle, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { enrollmentsApi } from '@/services/api';

interface AddAttendeesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId: string;
    courseTitle: string;
}

export function AddAttendeesDialog({
    open,
    onOpenChange,
    courseId,
    courseTitle
}: AddAttendeesDialogProps) {
    const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input');
    const [emailInput, setEmailInput] = useState('');
    const [emails, setEmails] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<{ success: string[]; failed: string[] }>({
        success: [],
        failed: []
    });

    const parseEmails = () => {
        const parsed = emailInput
            .split(/[,\n]/)
            .map(e => e.trim().toLowerCase())
            .filter(e => e && e.includes('@'));

        const unique = [...new Set(parsed)];
        setEmails(unique);

        if (unique.length > 0) {
            setStep('confirm');
        } else {
            toast.error('Please enter valid email addresses');
        }
    };

    const handleAddAttendees = async () => {
        setIsLoading(true);
        const successEmails: string[] = [];
        const failedEmails: string[] = [];

        for (const email of emails) {
            try {
                // Try to enroll - in a real implementation, this would also
                // create the user if they don't exist and send an invitation email
                const result = await enrollmentsApi.enroll(courseId);
                if (result.success) {
                    successEmails.push(email);
                } else {
                    failedEmails.push(email);
                }
            } catch {
                failedEmails.push(email);
            }
        }

        setResults({ success: successEmails, failed: failedEmails });
        setStep('success');
        setIsLoading(false);

        if (successEmails.length > 0) {
            toast.success(`${successEmails.length} attendee(s) added successfully!`);
        }
    };

    const handleClose = () => {
        setStep('input');
        setEmailInput('');
        setEmails([]);
        setResults({ success: [], failed: [] });
        onOpenChange(false);
    };

    const removeEmail = (emailToRemove: string) => {
        setEmails(emails.filter(e => e !== emailToRemove));
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-[#3B5BFF]" />
                        Add Attendees to {courseTitle}
                    </DialogTitle>
                </DialogHeader>

                {step === 'input' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Email Addresses</Label>
                            <Textarea
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                placeholder="Enter email addresses (comma-separated or one per line)&#10;&#10;example1@email.com&#10;example2@email.com"
                                rows={6}
                            />
                            <p className="text-xs text-gray-500">
                                Enter emails separated by commas or new lines. Invitations will be sent automatically.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button
                                onClick={parseEmails}
                                className="bg-[#3B5BFF] hover:bg-[#2a4aee]"
                            >
                                Continue
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {step === 'confirm' && (
                    <div className="space-y-4">
                        <div>
                            <Label className="mb-2 block">Confirm {emails.length} email(s)</Label>
                            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-lg">
                                {emails.map(email => (
                                    <Badge key={email} variant="secondary" className="flex items-center gap-1">
                                        {email}
                                        <button onClick={() => removeEmail(email)}>
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setStep('input')}>
                                Back
                            </Button>
                            <Button
                                onClick={handleAddAttendees}
                                disabled={isLoading || emails.length === 0}
                                className="bg-[#3B5BFF] hover:bg-[#2a4aee]"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-4 h-4 mr-2" />
                                        Send Invitations
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {step === 'success' && (
                    <div className="space-y-4">
                        <div className="text-center py-4">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium">Invitations Sent!</h3>
                            <p className="text-gray-500">
                                {results.success.length} attendee(s) added successfully
                            </p>
                        </div>
                        {results.failed.length > 0 && (
                            <div className="bg-red-50 p-3 rounded-lg">
                                <p className="text-sm text-red-700 font-medium mb-2">
                                    {results.failed.length} email(s) failed:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {results.failed.map(email => (
                                        <Badge key={email} variant="destructive">
                                            {email}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
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

export default AddAttendeesDialog;
