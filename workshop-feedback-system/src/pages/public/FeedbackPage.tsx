import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FeedbackForm } from '../../components/student/FeedbackForm';
import { workshopService } from '../../services/workshopService';
import type { Workshop } from '../../types/workshop';
import { Loader } from '../../components/shared/Loader';
import { formatDateTime } from '../../utils/date';
import { AlertCircle, Calendar, MapPin, Award, Clock, Smartphone, Lock, ArrowLeft, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

const FeedbackPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{title: string, message: string} | null>(null);

  useEffect(() => {
    if (formId) {
      workshopService.getWorkshopById(formId)
        .then(data => {
          if (!data) {
            setError({
              title: 'Workshop Not Found',
              message: 'We could not find the workshop you are looking for. Please check the link and try again.'
            });
          } else if (data.status !== 'active') {
            setError({
              title: 'Form Closed',
              message: 'This workshop feedback form is no longer accepting responses.'
            });
          } else {
            setWorkshop(data);
          }
        })
        .catch(err => {
          console.error("Failed to load workshop:", err);
          setError({
            title: 'Error Loading Workshop',
            message: 'An error occurred while loading the workshop details.'
          });
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setError({
        title: 'Invalid Link',
        message: 'The link you followed is invalid or incomplete.'
      });
      setLoading(false);
    }
  }, [formId]);

  if (loading) {
    return <Loader fullScreen text="Loading workshop details..." />;
  }

  if (error || !workshop) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 shadow-sm"
        >
          <AlertCircle className="w-12 h-12" />
        </motion.div>
        <h2 className="text-3xl font-bold text-slate-800">{error?.title || 'Oops!'}</h2>
        <p className="text-slate-600 max-w-md mx-auto text-lg">{error?.message}</p>
        
        <button 
          onClick={() => navigate('/')}
          className="mt-6 flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium bg-primary-50 px-6 py-3 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Hero Section */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-white/70 backdrop-blur-xl border border-indigo-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-6 sm:p-10 grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
          
          {/* Left Content */}
          <div className="md:col-span-3 space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Accepting Responses
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-3">
                {workshop.workshopName}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-slate-600 font-medium">
                <div className="flex items-center gap-2 text-indigo-700">
                  <MapPin className="w-5 h-5 text-indigo-500" />
                  {workshop.collegeName}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  {formatDateTime(workshop.dateTime, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Statistics Card */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-700 font-medium bg-slate-50 px-3 py-2 rounded-lg">
                <Award className="w-4 h-4 text-emerald-500" /> Certificate Included
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700 font-medium bg-slate-50 px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4 text-amber-500" /> 5 Minutes
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700 font-medium bg-slate-50 px-3 py-2 rounded-lg">
                <Smartphone className="w-4 h-4 text-blue-500" /> Mobile Friendly
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700 font-medium bg-slate-50 px-3 py-2 rounded-lg">
                <Lock className="w-4 h-4 text-indigo-500" /> Secure OTP
              </div>
            </div>
          </div>

          {/* Right Content - Illustration */}
          <div className="md:col-span-2 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 shadow-inner text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-indigo-600">
              <Award className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Official Certificate</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Complete this feedback form to receive your verified participation certificate.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Instructions */}
      {workshop.instructions && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4 text-indigo-700 font-semibold">
            <Info className="w-5 h-5" />
            Instructions from the Instructor
          </div>
          <div className="prose prose-sm sm:prose-base prose-indigo max-w-none text-slate-700">
            <ReactMarkdown>{workshop.instructions}</ReactMarkdown>
          </div>
        </motion.div>
      )}
      
      {/* Feedback Form Component */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <FeedbackForm workshop={workshop} />
      </motion.div>
    </div>
  );
};

export default FeedbackPage;
