import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { ProgressBar } from './ProgressBar';
import { OtpInput } from './OtpInput';
import { useOtpVerification } from '../../hooks/useOtpVerification';
import { useCountdown } from '../../hooks/useCountdown';
import { useToast } from '../../context/ToastContext';
import { 
  feedbackSubmissionSchema
} from '../../utils/validators';
import type { FeedbackFormData } from '../../utils/validators';

const TOTAL_STEPS = 3;

export const FeedbackForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { formId } = useParams<{ formId: string }>();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSubmissionSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      course: '',
      phone: '',
      email: '',
      feedback: '',
      phoneVerified: false,
      emailVerified: false,
    }
  });

  const phoneValue = watch('phone');
  const emailValue = watch('email');
  const phoneVerified = watch('phoneVerified');
  const emailVerified = watch('emailVerified');

  // OTP hooks for Phone
  const phoneVerification = useOtpVerification();
  const { reset: resetPhoneVerification } = phoneVerification;
  const phoneTimer = useCountdown(60);
  const { reset: resetPhoneTimer } = phoneTimer;
  const [showPhoneOtp, setShowPhoneOtp] = useState(false);
  const [phoneOtpValue, setPhoneOtpValue] = useState('');

  // OTP hooks for Email
  const emailVerification = useOtpVerification();
  const { reset: resetEmailVerification } = emailVerification;
  const emailTimer = useCountdown(60);
  const { reset: resetEmailTimer } = emailTimer;
  const [showEmailOtp, setShowEmailOtp] = useState(false);
  const [emailOtpValue, setEmailOtpValue] = useState('');

  const lastVerifiedPhone = useRef<string | null>(null);
  const lastVerifiedEmail = useRef<string | null>(null);

  // Reset verification if value changes
  useEffect(() => {
    if (phoneVerified && lastVerifiedPhone.current !== null && phoneValue !== lastVerifiedPhone.current) {
      setValue('phoneVerified', undefined as any);
      resetPhoneVerification();
      setShowPhoneOtp(false);
      resetPhoneTimer();
      setPhoneOtpValue('');
      lastVerifiedPhone.current = null;
    }
  }, [phoneValue, phoneVerified, setValue, resetPhoneVerification, resetPhoneTimer]);

  useEffect(() => {
    if (emailVerified && lastVerifiedEmail.current !== null && emailValue !== lastVerifiedEmail.current) {
      setValue('emailVerified', undefined as any);
      resetEmailVerification();
      setShowEmailOtp(false);
      resetEmailTimer();
      setEmailOtpValue('');
      lastVerifiedEmail.current = null;
    }
  }, [emailValue, emailVerified, setValue, resetEmailVerification, resetEmailTimer]);

  const handleNextStep = async () => {
    if (step === 1) {
      const isStep1Valid = await trigger(['name', 'course', 'phone', 'email']);
      if (isStep1Valid) {
        setStep(2);
      }
    } else if (step === 2) {
      console.log({
        phoneVerified,
        emailVerified,
        step
      });
      if (phoneVerified && emailVerified) {
        setStep(3);
      } else {
        toast('Please verify both phone and email to continue.', 'error');
        return;
      }
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate backend delay for final submission
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Form Submitted successfully:', data);
      navigate(`/form/${formId}/thank-you`);
    } catch (err) {
      toast('Failed to submit feedback. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- OTP Handlers ---
  const handleRequestPhoneOtp = async () => {
    const success = await phoneVerification.generateOtp('phone', phoneValue);
    if (success) {
      setShowPhoneOtp(true);
      phoneTimer.start();
      toast('OTP sent to your phone', 'success');
    }
  };

  const handleVerifyPhoneOtp = async () => {
    const success = await phoneVerification.verifyOtp('phone', phoneValue, phoneOtpValue);
    if (success) {
      lastVerifiedPhone.current = phoneValue;
      setValue('phoneVerified', true, { shouldDirty: true });
      setShowPhoneOtp(false);
      setPhoneOtpValue('');
      toast('Phone verified successfully!', 'success');
    }
  };

  const handleRequestEmailOtp = async () => {
    const success = await emailVerification.generateOtp('email', emailValue);
    if (success) {
      setShowEmailOtp(true);
      emailTimer.start();
      toast('OTP sent to your email', 'success');
    }
  };

  const handleVerifyEmailOtp = async () => {
    const success = await emailVerification.verifyOtp('email', emailValue, emailOtpValue);
    if (success) {
      lastVerifiedEmail.current = emailValue;
      setValue('emailVerified', true, { shouldDirty: true });
      setShowEmailOtp(false);
      setEmailOtpValue('');
      toast('Email verified successfully!', 'success');
    }
  };

  const animationVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
      <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <input type="hidden" {...register('phoneVerified')} />
        <input type="hidden" {...register('emailVerified')} />
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={animationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold text-slate-800 mb-6">Student Information</h3>
              <Input
                label="Full Name"
                placeholder="John Doe"
                {...register('name')}
                error={errors.name?.message}
              />
              <Input
                label="Course/Department"
                placeholder="Computer Science"
                {...register('course')}
                error={errors.course?.message}
              />
              <Input
                label="Phone Number"
                placeholder="9876543210"
                type="tel"
                {...register('phone')}
                error={errors.phone?.message}
                helperText="10-digit Indian mobile number"
              />
              <Input
                label="Email Address"
                placeholder="john@example.com"
                type="email"
                {...register('email')}
                error={errors.email?.message}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={animationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <h3 className="text-xl font-semibold text-slate-800 mb-6">Verification</h3>
              <p className="text-slate-600 text-sm mb-4">Please verify your contact details to proceed.</p>

              {/* Phone Verification */}
              <div className="p-4 border rounded-xl bg-slate-50 space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Phone Number</p>
                    <p className="text-slate-900">{phoneValue}</p>
                  </div>
                  {phoneVerified ? (
                    <span className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-md" aria-live="polite">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Phone verified
                    </span>
                  ) : (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      isLoading={phoneVerification.isGenerating}
                      disabled={phoneTimer.isActive || emailVerification.isGenerating || emailVerification.isVerifying}
                      onClick={handleRequestPhoneOtp}
                    >
                      {phoneTimer.isActive ? `Resend in ${phoneTimer.timeLeft}s` : 'Send OTP'}
                    </Button>
                  )}
                </div>

                <AnimatePresence>
                  {showPhoneOtp && !phoneVerified && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="pt-4 border-t border-slate-200"
                    >
                      <p className="text-sm text-slate-600 text-center mb-3">Enter the 6-digit code sent to your phone</p>
                      <OtpInput 
                        length={6} 
                        onChange={setPhoneOtpValue}
                        onComplete={setPhoneOtpValue}
                        isLoading={phoneVerification.isVerifying}
                        error={phoneVerification.error}
                        disabled={phoneVerification.isVerifying}
                      />
                      <div className="mt-4 flex justify-center">
                        <Button
                          type="button"
                          variant="primary"
                          disabled={phoneOtpValue.length !== 6 || phoneVerification.isVerifying}
                          onClick={handleVerifyPhoneOtp}
                          isLoading={phoneVerification.isVerifying}
                        >
                          {phoneVerification.isVerifying ? 'Verifying...' : 'Verify Phone'}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Email Verification */}
              <div className="p-4 border rounded-xl bg-slate-50 space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Email Address</p>
                    <p className="text-slate-900">{emailValue}</p>
                  </div>
                  {emailVerified ? (
                    <span className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-md" aria-live="polite">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Email verified
                    </span>
                  ) : (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      isLoading={emailVerification.isGenerating}
                      disabled={emailTimer.isActive || phoneVerification.isGenerating || phoneVerification.isVerifying}
                      onClick={handleRequestEmailOtp}
                    >
                      {emailTimer.isActive ? `Resend in ${emailTimer.timeLeft}s` : 'Send OTP'}
                    </Button>
                  )}
                </div>

                <AnimatePresence>
                  {showEmailOtp && !emailVerified && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="pt-4 border-t border-slate-200"
                    >
                      <p className="text-sm text-slate-600 text-center mb-3">Enter the 6-digit code sent to your email</p>
                      <OtpInput 
                        length={6} 
                        onChange={setEmailOtpValue}
                        onComplete={setEmailOtpValue}
                        isLoading={emailVerification.isVerifying}
                        error={emailVerification.error}
                        disabled={emailVerification.isVerifying}
                      />
                      <div className="mt-4 flex justify-center">
                        <Button
                          type="button"
                          variant="primary"
                          disabled={emailOtpValue.length !== 6 || emailVerification.isVerifying}
                          onClick={handleVerifyEmailOtp}
                          isLoading={emailVerification.isVerifying}
                        >
                          {emailVerification.isVerifying ? 'Verifying...' : 'Verify Email'}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Overall Verification Error */}
              {(!phoneVerified || !emailVerified) && (
                <div className="flex items-center text-slate-600 text-sm mt-2 p-3 bg-slate-50 rounded-lg" aria-live="polite">
                  <AlertCircle className="w-4 h-4 mr-2 text-slate-400" />
                  Please verify both phone and email to continue.
                </div>
              )}

            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={animationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-semibold text-slate-800 mb-6">Workshop Feedback</h3>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="feedback" className="text-sm font-medium text-slate-700">
                  Your Feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="feedback"
                  rows={6}
                  placeholder="Tell us what you thought about the workshop..."
                  className={`
                    w-full px-3 py-2 bg-white border rounded-xl shadow-sm resize-none
                    text-sm text-slate-900 placeholder:text-slate-400
                    transition-colors focus:outline-none focus:ring-2 focus:border-transparent
                    ${errors.feedback ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-primary-500 hover:border-slate-300'}
                  `}
                  {...register('feedback')}
                />
                {errors.feedback && (
                  <p className="text-sm text-red-500 animate-in fade-in">{errors.feedback.message}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-6 border-t border-slate-200 flex items-center justify-between mt-8">
          {step > 1 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={handlePrevStep}
              disabled={isSubmitting || phoneVerification.isVerifying || emailVerification.isVerifying}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          ) : (
            <div></div> // empty placeholder to maintain flex-between layout
          )}

          {step < TOTAL_STEPS ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNextStep}
              disabled={
                (step === 2 && (!phoneVerified || !emailVerified)) || 
                phoneVerification.isVerifying || 
                emailVerification.isVerifying
              }
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Submit Feedback
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
