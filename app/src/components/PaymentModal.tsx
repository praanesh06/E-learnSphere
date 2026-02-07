
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { paymentsApi } from '@/services/api';
import type { Course } from '@/types';

interface PaymentModalProps {
    course: Course;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function PaymentModal({ course, isOpen, onClose, onSuccess }: PaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const [paymentStep, setPaymentStep] = useState<'initial' | 'verification'>('initial');
    const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);

    const handleInitiatePayment = async () => {
        setLoading(true);
        try {
            const orderRes = await paymentsApi.initiate((course as any)._id || course.id);

            if (!orderRes.success) {
                throw new Error(orderRes.error || 'Failed to create order');
            }

            setCurrentPaymentId(orderRes.data.paymentId);

            // Open Payment Link
            window.open('https://rzp.io/rzp/hoZ4HGm', '_blank');

            // Move to verification step
            setPaymentStep('verification');
            setLoading(false);

        } catch (error: any) {
            console.error('Payment initiation error:', error);
            toast.error(error.message || 'Failed to initiate payment');
            setLoading(false);
        }
    };

    const handleVerifyPayment = async () => {
        if (!currentPaymentId) return;

        setLoading(true);
        try {
            // Manual verification (Mock backend completion)
            const verifyRes = await paymentsApi.verifyPayment({
                paymentId: currentPaymentId
            });

            if (verifyRes.success) {
                toast.success('Enrollment successful!');
                onSuccess();
                onClose();
            } else {
                toast.error('Payment verification failed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Payment verification error');
        } finally {
            setLoading(false);
        }
    };

    const resetModal = () => {
        // Reset state when closing or if needed
        if (!loading) {
            onClose();
            setTimeout(() => setPaymentStep('initial'), 300);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && resetModal()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Complete Enrollment</DialogTitle>
                    <DialogDescription>
                        Secure payment via Razorpay Payment Link
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                        <p className="text-gray-600 mb-2">Total Amount</p>
                        <p className="text-4xl font-bold text-[#3B5BFF]">
                            ₹{course.price}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">{course.title}</p>
                    </div>

                    {paymentStep === 'initial' ? (
                        <div className="space-y-3">
                            <p className="text-sm text-center text-gray-500 px-4">
                                Clicking the button below will open the payment page in a new tab.
                            </p>
                            <Button
                                onClick={handleInitiatePayment}
                                className="w-full bg-[#3B5BFF] hover:bg-[#2a4aee] py-6 text-lg"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : (
                                    <>
                                        Proceed to Pay
                                        <ExternalLink className="ml-2 w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex flex-col items-center justify-center py-2 text-center space-y-2">
                                <CheckCircle className="w-10 h-10 text-green-500 animate-pulse" />
                                <h3 className="font-medium">Payment Page Opened</h3>
                                <p className="text-sm text-gray-500">
                                    Please complete the payment in the new tab. <br />
                                    Once done, click the button below to confirm.
                                </p>
                            </div>

                            <Button
                                onClick={handleVerifyPayment}
                                className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg"
                                disabled={loading}
                            >
                                {loading ? 'Verifying...' : 'I have completed the payment'}
                            </Button>

                            <Button variant="ghost" className="w-full" onClick={() => setPaymentStep('initial')} disabled={loading}>
                                Retry / Go Back
                            </Button>
                        </div>
                    )}

                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Secured by Razorpay</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
