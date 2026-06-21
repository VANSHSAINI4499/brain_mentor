import React from 'react';
import { useParams } from 'react-router-dom';
import { FeedbackForm } from '../../components/student/FeedbackForm';

const FeedbackPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();

  // In a real implementation, we would fetch workshop details here using formId
  // and display a 404/inactive state if not found.

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">React Performance Workshop</h2>
        <p className="text-indigo-600 font-medium mb-1">Tech Engineering College (Form: {formId})</p>
        <p className="text-slate-600 text-sm">October 25, 2026 • 10:00 AM</p>
        <div className="mt-4 pt-4 border-t border-indigo-200">
          <p className="text-sm text-slate-700">
            Please fill out this feedback form to receive your participation certificate.
          </p>
        </div>
      </div>
      
      <FeedbackForm />
    </div>
  );
};

export default FeedbackPage;
