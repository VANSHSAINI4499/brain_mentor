import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User } from 'lucide-react';
import { Button } from '../shared/Button';

interface PreviewProps {
  data: {
    workshopName: string;
    collegeName: string;
    instructorName?: string;
    dateTime: Date | string;
    duration?: string;
    description?: string;
    instructions: string;
  };
}

const parseMarkdown = (text: string) => {
  if (!text) return '';
  let html = text
    .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold mt-3 mb-2">$1</h2>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/_(.*)_/gim, '<em>$1</em>')
    .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
    .replace(/\n$/gim, '<br />');

  // Wrap loose text in paragraphs
  return html.split('\n').map(line => {
    if (line.trim().startsWith('<h') || line.trim().startsWith('<li') || line.trim() === '') return line;
    return `<p class="mb-2">${line}</p>`;
  }).join('\n');
};

export const FormPreview: React.FC<PreviewProps> = ({ data }) => {
  const displayDate = typeof data.dateTime === 'string' ? new Date(data.dateTime) : data.dateTime;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm h-[600px] flex flex-col">
      <div className="bg-slate-200 py-2 px-4 border-b border-slate-300 flex items-center justify-between sticky top-0 z-10">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-400"></div>
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
        </div>
        <span className="text-xs font-medium text-slate-500 font-mono tracking-wider">Live Preview</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <motion.h1 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl font-extrabold mb-2 relative z-10"
            >
              {data.workshopName || 'Workshop Title'}
            </motion.h1>
            <motion.p 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-indigo-100 font-medium relative z-10"
            >
              {data.collegeName || 'Institution Name'}
            </motion.p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <span className="font-medium">{displayDate && !isNaN(displayDate.getTime()) ? displayDate.toLocaleDateString() : 'Date TBD'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <Clock className="w-5 h-5 text-indigo-500" />
                <span className="font-medium">{data.duration || 'Duration TBD'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 sm:col-span-2">
                <User className="w-5 h-5 text-indigo-500" />
                <span className="font-medium">{data.instructorName || 'Instructor Name'}</span>
              </div>
            </div>

            {data.description && (
              <div className="prose prose-sm prose-slate max-w-none border-l-4 border-indigo-500 pl-4 py-1">
                <p className="text-slate-700 italic">{data.description}</p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Instructions</h3>
              <div 
                className="prose prose-sm prose-slate max-w-none break-words"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(data.instructions) || '<p class="text-slate-400 italic">No instructions provided...</p>' }}
              />
            </div>

            <Button className="w-full mt-6 shadow-md shadow-indigo-200" size="lg" disabled>
              Start Feedback
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
