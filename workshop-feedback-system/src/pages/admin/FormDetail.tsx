import React from 'react';
import { useParams } from 'react-router-dom';

const FormDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Form Details: {id}</h2>
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <p className="text-slate-600">Phase 1/2 functionality placeholder.</p>
      </div>
    </div>
  );
};

export default FormDetail;
