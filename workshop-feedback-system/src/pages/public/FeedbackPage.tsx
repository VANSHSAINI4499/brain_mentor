import React from 'react';
import { useParams } from 'react-router-dom';

const FeedbackPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Workshop Feedback</h2>
      <p className="text-slate-600 mb-4">You are viewing form ID: <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{formId}</span></p>
      <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg text-center text-slate-500">
        Phase 3 functionality will go here.
      </div>
    </div>
  );
};

export default FeedbackPage;
