import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FeedbackForm } from '../../components/student/FeedbackForm';
import { workshopService } from '../../services/workshopService';
import type { Workshop } from '../../types/workshop';
import { Loader } from '../../components/shared/Loader';
import { formatDateTime } from '../../utils/date';
import { AlertCircle } from 'lucide-react';

const FeedbackPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (formId) {
      workshopService.getWorkshopById(formId)
        .then(data => {
          if (!data) {
            setError('Workshop not found.');
          } else if (data.status !== 'active') {
            setError('This feedback form is currently inactive or closed.');
          } else {
            setWorkshop(data);
          }
        })
        .catch(err => {
          console.error("Failed to load workshop:", err);
          setError('An error occurred while loading the workshop details.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setError('Invalid form link.');
      setLoading(false);
    }
  }, [formId]);

  if (loading) {
    return <Loader fullScreen text="Loading workshop details..." />;
  }

  if (error || !workshop) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Oops!</h2>
        <p className="text-slate-600 max-w-md mx-auto">{error}</p>
        <div className="pt-4">
          <p className="text-sm text-slate-500">
            If you believe this is a mistake, please contact your instructor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{workshop.workshopName}</h2>
        <p className="text-indigo-600 font-medium mb-1">{workshop.collegeName} (Form: {formId})</p>
        <p className="text-slate-600 text-sm">
          {formatDateTime(workshop.dateTime, { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })}
        </p>
        
        {workshop.instructions && (
          <div className="mt-4 pt-4 border-t border-indigo-200">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Instructions:</h3>
            <div 
              className="prose prose-sm prose-indigo max-w-none text-slate-700"
              dangerouslySetInnerHTML={{ __html: workshop.instructions }}
            />
          </div>
        )}
        
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
