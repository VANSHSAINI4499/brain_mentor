import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ThankYou: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 text-center max-w-lg mx-auto mt-10"
    >
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>
      <h2 className="text-3xl font-bold text-slate-800 mb-3">Thank You!</h2>
      <p className="text-slate-600 mb-8 text-lg">
        Your feedback has been successfully submitted. Your certificate will be emailed to you shortly.
      </p>
      <Link 
        to={`/form/${formId}`} 
        className="inline-block px-6 py-3 bg-indigo-50 text-indigo-700 font-medium rounded-xl hover:bg-indigo-100 transition-colors"
      >
        Submit another response
      </Link>
    </motion.div>
  );
};

export default ThankYou;
