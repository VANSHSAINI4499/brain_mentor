import React from 'react';
import { useParams, Link } from 'react-router-dom';

const ThankYou: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Thank You!</h2>
      <p className="text-slate-600 mb-6">Your feedback has been submitted successfully.</p>
      <Link to={`/form/${formId}`} className="text-indigo-600 hover:text-indigo-700 font-medium">
        Submit another response
      </Link>
    </div>
  );
};

export default ThankYou;
