import React from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  isValid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, isValid, className = '', id, ...props }, ref) => {
    const inputId = id || label.replace(/\s+/g, '-').toLowerCase();

    return (
      <div className="w-full flex flex-col gap-1.5 relative">
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            placeholder=" " // Needed for CSS peer-placeholder-shown trick
            className={`
              peer w-full bg-white border rounded-xl shadow-sm
              text-sm text-slate-900 
              transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent
              disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
              ${icon ? 'pl-11' : 'px-4'}
              ${isValid ? 'pr-11' : 'pr-4'}
              pt-6 pb-2
              ${error 
                ? 'border-red-300 focus:ring-red-200 bg-red-50/30' 
                : isValid 
                  ? 'border-emerald-300 focus:ring-emerald-200 bg-emerald-50/10'
                  : 'border-slate-200 focus:ring-indigo-500 hover:border-slate-300'
              }
              ${className}
            `}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          
          <label 
            htmlFor={inputId} 
            className={`
              absolute cursor-text text-slate-500 duration-200 transform -translate-y-1/2 z-10 origin-[0]
              ${icon ? 'left-11' : 'left-4'}
              peer-placeholder-shown:text-sm peer-placeholder-shown:top-1/2
              peer-focus:top-3 peer-focus:text-xs peer-focus:text-indigo-600
              top-3 text-xs font-medium
              ${error ? 'text-red-500 peer-focus:text-red-500' : ''}
              ${isValid ? 'text-emerald-600 peer-focus:text-emerald-600' : ''}
            `}
          >
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>

          <AnimatePresence>
            {isValid && !error && (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500"
              >
                <CheckCircle2 className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              id={`${inputId}-error`} 
              className="text-xs font-medium text-red-500 ml-1"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-xs text-slate-500 ml-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
