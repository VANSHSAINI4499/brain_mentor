import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { CheckCircle, Award, FileText, ArrowRight } from 'lucide-react';

const ThankYou: React.FC = () => {
  const location = useLocation();
  const { width, height } = useWindowSize();
  
  const submissionRef = location.state?.submissionRef || `SUB-${Date.now().toString().slice(-6)}`;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 relative">
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={500}
        gravity={0.15}
        colors={['#4f46e5', '#7c3aed', '#10b981', '#fbbf24', '#f43f5e']}
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/80 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.1)] border border-indigo-100 text-center max-w-lg mx-auto relative z-10 w-full"
      >
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200"
        >
          <CheckCircle className="w-12 h-12" />
        </motion.div>
        
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-indigo-800">
          Success!
        </h2>
        
        <p className="text-slate-600 mb-8 text-lg">
          Your feedback has been submitted successfully. We appreciate your time!
        </p>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Reference ID
            </span>
            <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md text-sm">
              {submissionRef}
            </span>
          </div>
          <div className="flex items-start gap-3 text-left">
            <div className="bg-amber-100 text-amber-600 p-2 rounded-lg mt-1 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Certificate Processing</h4>
              <p className="text-xs text-slate-500 mt-1">Your official certificate will be delivered shortly to your verified email and WhatsApp.</p>
            </div>
          </div>
        </div>

        <Link 
          to="/" 
          className="inline-flex items-center justify-center w-full gap-2 px-6 py-4 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 active:scale-95"
        >
          Return to Home <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
};

export default ThankYou;
