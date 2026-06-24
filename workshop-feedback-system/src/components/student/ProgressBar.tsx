import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepNames?: string[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps, stepNames }) => {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full mb-12 sm:mb-16 relative">
      {/* Progress track background */}
      <div className="absolute top-4 left-4 right-4 h-1 bg-slate-200 -z-10 transform -translate-y-1/2 rounded-full" />
      
      {/* Active progress track */}
      <div className="absolute top-4 left-4 right-4 h-1 -z-10 transform -translate-y-1/2 rounded-full overflow-hidden flex justify-start">
        <motion.div
          className="h-full bg-indigo-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      <div className="flex justify-between relative z-10">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const name = stepNames ? stepNames[index] : `Step ${stepNumber}`;
          
          return (
            <div key={stepNumber} className="flex flex-col items-center w-8">
              <motion.div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shadow-sm transition-colors duration-300 ${
                  isCompleted 
                    ? 'bg-emerald-500 text-white' 
                    : isActive 
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' 
                      : 'bg-white text-slate-400 border border-slate-200'
                }`}
                initial={false}
                animate={{ scale: isActive ? 1.1 : 1 }}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
              </motion.div>
              <div className={`mt-3 text-xs font-medium whitespace-nowrap absolute top-10 ${isActive ? 'text-indigo-700' : isCompleted ? 'text-slate-600' : 'text-slate-400'} hidden sm:block`}>
                {name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
