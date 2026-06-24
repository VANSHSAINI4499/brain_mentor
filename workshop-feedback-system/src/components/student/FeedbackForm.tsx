import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, ChevronLeft, User, Book, Phone, Mail, Star, Award, Smartphone, ShieldCheck } from 'lucide-react';
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
import { submissionService } from '../../services/submissionService';
import type { Workshop } from '../../types/workshop';
import { formatDateTime } from '../../utils/date';

const TOTAL_STEPS = 4;
const STEP_NAMES = ['Personal Info', 'Verification', 'Feedback', 'Submit'];

interface FeedbackFormProps {
  workshop?: Workshop | null;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ workshop }) => {
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
    control,
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
      rating: 5,
      experience: 'excellent',
      phoneVerified: false,
      emailVerified: false,
    }
  });

  const nameValue = watch('name');
  const courseValue = watch('course');
  const phoneValue = watch('phone');
  const emailValue = watch('email');
  const phoneVerified = watch('phoneVerified');
  const emailVerified = watch('emailVerified');
  const feedbackValue = watch('feedback');

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
      setValue('phoneVerified', false as any);
      resetPhoneVerification();
      setShowPhoneOtp(false);
      resetPhoneTimer();
      setPhoneOtpValue('');
      lastVerifiedPhone.current = null;
    }
  }, [phoneValue, phoneVerified, setValue, resetPhoneVerification, resetPhoneTimer]);

  useEffect(() => {
    if (emailVerified && lastVerifiedEmail.current !== null && emailValue !== lastVerifiedEmail.current) {
      setValue('emailVerified', false as any);
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
        // TEMP: Skip OTP verification for testing
        setValue('phoneVerified', true);
        setValue('emailVerified', true);
        setStep(3);
      }
    } else if (step === 2) {
      if (phoneVerified && emailVerified) {
        setStep(3);
      } else {
        toast('Please verify both phone and email to continue.', 'error');
        return;
      }
    } else if (step === 3) {
      const isStep3Valid = await trigger(['feedback']);
      if (isStep3Valid) {
        setStep(4);
      }
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => {
      // TEMP: Skip OTP step backwards for testing
      if (prev === 3) return 1;
      return Math.max(1, prev - 1);
    });
  };

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        workshopId: formId || '',
        name: data.name,
        course: data.course,
        phone: data.phone,
        email: data.email,
        feedback: data.feedback,
        rating: data.rating || 5,
        experience: data.experience || 'excellent',
        phoneVerified: data.phoneVerified,
        emailVerified: data.emailVerified,
      };
      
      const response = await submissionService.submitFeedback(payload);
      toast('Feedback submitted successfully!', 'success');
      navigate(`/form/${formId}/thank-you`, { state: { submissionRef: response.submissionRef } });
    } catch (err) {
      console.error('Submission error:', err);
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

  const experienceOptions = [
    { value: 'excellent', label: 'Excellent', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500' },
    { value: 'good', label: 'Good', color: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500' },
    { value: 'average', label: 'Average', color: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500' },
    { value: 'poor', label: 'Poor', color: 'bg-red-50 text-red-700 border-red-200 ring-red-500' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-indigo-50/50 relative overflow-hidden">
      <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} stepNames={STEP_NAMES} />

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 relative z-10">
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
              className="space-y-6"
            >
              <div className="mb-8 text-center">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Personal Information</h3>
                <p className="text-slate-500 text-sm">Please provide your details as they should appear on the certificate.</p>
              </div>

              <div className="space-y-5">
                <Input
                  label="Full Name"
                  icon={<User className="w-5 h-5" />}
                  {...register('name')}
                  error={errors.name?.message}
                  isValid={!errors.name && nameValue?.length >= 2}
                />
                <Input
                  label="Course/Department"
                  icon={<Book className="w-5 h-5" />}
                  {...register('course')}
                  error={errors.course?.message}
                  isValid={!errors.course && courseValue?.length >= 1}
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  icon={<Phone className="w-5 h-5" />}
                  {...register('phone')}
                  error={errors.phone?.message}
                  isValid={!errors.phone && /^[6-9]\d{9}$/.test(phoneValue || '')}
                  helperText="10-digit Indian mobile number"
                />
                <Input
                  label="Email Address"
                  type="email"
                  icon={<Mail className="w-5 h-5" />}
                  {...register('email')}
                  error={errors.email?.message}
                  isValid={!errors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue || '')}
                />
              </div>
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
              className="space-y-6"
            >
              <div className="mb-8 text-center">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Secure Verification</h3>
                <p className="text-slate-500 text-sm">We need to verify your contact details to issue the official certificate.</p>
              </div>

              {/* OTP Timeline View */}
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                
                {/* Phone Verification Timeline Item */}
                <div className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Icon */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10 ${phoneVerified ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {phoneVerified ? <CheckCircle2 className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                  </div>
                  {/* Card */}
                  <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border shadow-sm transition-colors ${phoneVerified ? 'bg-emerald-50/30 border-emerald-100' : 'bg-white border-slate-200'}`}>
                    <div className="flex flex-col gap-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Step 1</p>
                        <h4 className="text-sm font-bold text-slate-800">Verify Phone</h4>
                        <p className="text-sm text-slate-500 mt-1 truncate">{phoneValue}</p>
                      </div>
                      
                      {!phoneVerified && (
                        <div>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            className="w-full text-xs py-2"
                            isLoading={phoneVerification.isGenerating}
                            disabled={phoneTimer.isActive || emailVerification.isGenerating || emailVerification.isVerifying}
                            onClick={handleRequestPhoneOtp}
                          >
                            {phoneTimer.isActive ? `Resend in ${phoneTimer.timeLeft}s` : 'Send OTP'}
                          </Button>
                        </div>
                      )}
                      
                      <AnimatePresence>
                        {showPhoneOtp && !phoneVerified && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="pt-3 border-t border-slate-100 overflow-hidden"
                          >
                            <OtpInput 
                              length={6} 
                              onChange={setPhoneOtpValue}
                              onComplete={(val) => {
                                setPhoneOtpValue(val);
                              }}
                              isLoading={phoneVerification.isVerifying}
                              error={phoneVerification.error}
                              disabled={phoneVerification.isVerifying}
                            />
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              className="w-full mt-3"
                              disabled={phoneOtpValue.length !== 6 || phoneVerification.isVerifying}
                              onClick={handleVerifyPhoneOtp}
                              isLoading={phoneVerification.isVerifying}
                            >
                              Verify Code
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Email Verification Timeline Item */}
                <div className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Icon */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10 ${emailVerified ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {emailVerified ? <CheckCircle2 className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                  </div>
                  {/* Card */}
                  <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border shadow-sm transition-colors ${emailVerified ? 'bg-emerald-50/30 border-emerald-100' : 'bg-white border-slate-200'}`}>
                    <div className="flex flex-col gap-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Step 2</p>
                        <h4 className="text-sm font-bold text-slate-800">Verify Email</h4>
                        <p className="text-sm text-slate-500 mt-1 truncate">{emailValue}</p>
                      </div>
                      
                      {!emailVerified && (
                        <div>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            className="w-full text-xs py-2"
                            isLoading={emailVerification.isGenerating}
                            disabled={emailTimer.isActive || phoneVerification.isGenerating || phoneVerification.isVerifying || !phoneVerified}
                            onClick={handleRequestEmailOtp}
                          >
                            {emailTimer.isActive ? `Resend in ${emailTimer.timeLeft}s` : 'Send OTP'}
                          </Button>
                          {!phoneVerified && <p className="text-[10px] text-amber-500 mt-2 text-center">Verify phone first</p>}
                        </div>
                      )}

                      <AnimatePresence>
                        {showEmailOtp && !emailVerified && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="pt-3 border-t border-slate-100 overflow-hidden"
                          >
                            <OtpInput 
                              length={6} 
                              onChange={setEmailOtpValue}
                              onComplete={(val) => {
                                setEmailOtpValue(val);
                              }}
                              isLoading={emailVerification.isVerifying}
                              error={emailVerification.error}
                              disabled={emailVerification.isVerifying}
                            />
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              className="w-full mt-3"
                              disabled={emailOtpValue.length !== 6 || emailVerification.isVerifying}
                              onClick={handleVerifyEmailOtp}
                              isLoading={emailVerification.isVerifying}
                            >
                              Verify Code
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Ready to Submit Timeline Item */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Icon */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10 ${phoneVerified && emailVerified ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  {/* Card */}
                  <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border shadow-sm transition-colors ${phoneVerified && emailVerified ? 'bg-indigo-50/50 border-indigo-100' : 'bg-white border-slate-200 opacity-50'}`}>
                    <h4 className="text-sm font-bold text-slate-800">Ready to proceed</h4>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-1">Complete both verifications to unlock the feedback section.</p>
                  </div>
                </div>

              </div>
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
              className="space-y-8"
            >
              <div className="mb-8 text-center">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Workshop Feedback</h3>
                <p className="text-slate-500 text-sm">Your honest feedback helps us improve future workshops.</p>
              </div>

              {/* Star Rating */}
              <div className="space-y-3 flex flex-col items-center">
                <label className="text-sm font-semibold text-slate-700">How would you rate the workshop?</label>
                <Controller
                  name="rating"
                  control={control}
                  render={({ field }) => (
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => field.onChange(star)}
                          className="focus:outline-none transform transition hover:scale-110 active:scale-95"
                        >
                          <Star 
                            className={`w-10 h-10 ${star <= (field.value || 5) ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} 
                          />
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>

              {/* Experience Rating Cards */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 block text-center">Overall Experience</label>
                <Controller
                  name="experience"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {experienceOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(opt.value)}
                          className={`
                            px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all
                            ${field.value === opt.value 
                              ? `${opt.color} ring-2 ring-offset-1` 
                              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}
                          `}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>

              {/* Textarea */}
              <div className="flex flex-col gap-1.5 mt-8">
                <label htmlFor="feedback" className="text-sm font-medium text-slate-700 flex justify-between">
                  <span>Detailed Comments <span className="text-red-500">*</span></span>
                  <span className={`text-xs ${feedbackValue?.length > 1000 ? 'text-red-500' : 'text-slate-400'}`}>
                    {feedbackValue?.length || 0}/1000
                  </span>
                </label>
                <textarea
                  id="feedback"
                  rows={5}
                  placeholder="Tell us what you loved and what could be improved..."
                  className={`
                    w-full px-4 py-3 bg-slate-50 border rounded-2xl shadow-inner resize-none
                    text-sm text-slate-900 placeholder:text-slate-400
                    transition-all focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white
                    ${errors.feedback ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500 hover:border-slate-300'}
                  `}
                  {...register('feedback')}
                />
                {errors.feedback && (
                  <p className="text-xs text-red-500 ml-1 font-medium">{errors.feedback.message}</p>
                )}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              variants={animationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-8 pb-10"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Claim Your Certificate</h3>
                <p className="text-slate-500 text-sm">Review your details below. Your official certificate will be generated automatically upon submission.</p>
              </div>

              {/* Dynamic Certificate Preview Mockup */}
              <div className="relative w-full max-w-md mx-auto aspect-[1.414/1] bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-8 border-double border-slate-300 shadow-md p-6 sm:p-8 flex flex-col items-center justify-center text-center overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjZTJlOGYwIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] opacity-20 pointer-events-none" />
                
                <Award className="w-12 h-12 text-amber-500 mb-4 opacity-80" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Certificate of Participation</h4>
                <p className="text-[10px] text-slate-400 mb-4">Awarded to</p>
                
                <h2 className="text-xl sm:text-3xl font-serif text-slate-800 italic mb-4 border-b border-slate-300 pb-2 w-full truncate px-4">
                  {nameValue || 'Student Name'}
                </h2>
                
                <p className="text-[10px] text-slate-500 mb-2">For successfully completing</p>
                <h3 className="text-sm sm:text-base font-bold text-slate-700 truncate w-full px-4 mb-6">
                  {workshop?.workshopName || 'Workshop Name'}
                </h3>

                <div className="flex justify-between w-full text-[8px] sm:text-[10px] text-slate-400 mt-auto relative z-10">
                  <span>Date: {workshop?.dateTime ? formatDateTime(workshop.dateTime, { month: 'short', day: 'numeric', year: 'numeric' }) : 'DD MMM YYYY'}</span>
                  <span>ID: CERT-XXXXXX</span>
                </div>
              </div>

              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-indigo-500" /> Secure Submission
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <Mail className="w-4 h-4 text-indigo-500" /> Email Delivery
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <Smartphone className="w-4 h-4 text-indigo-500" /> WhatsApp Delivery
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Verified Info
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sticky/Fixed Bottom Navigation for Mobile, Normal for Desktop */}
        <div className="fixed sm:relative bottom-0 left-0 w-full sm:w-auto bg-white sm:bg-transparent border-t sm:border-t-0 border-slate-200 p-4 sm:p-0 sm:pt-8 sm:mt-8 flex items-center justify-between z-50">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevStep}
              disabled={isSubmitting || phoneVerification.isVerifying || emailVerification.isVerifying}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
              className="flex-1 sm:flex-none mr-3 sm:mr-0"
            >
              Back
            </Button>
          ) : (
            <div className="flex-1 sm:flex-none hidden sm:block"></div>
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
              className="flex-1 sm:flex-none"
            >
              Next Step
            </Button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
            >
              {isSubmitting ? 'Submitting...' : 'Submit & Get Certificate'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
