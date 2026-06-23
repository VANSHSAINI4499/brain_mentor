import React from 'react';
import { Bold, Italic, List, ListOrdered, Heading1, Heading2 } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  // A very simple Markdown-based editor wrapper.
  // In a production app, this would use TipTap or Quill.
  
  const insertText = (before: string, after: string = '') => {
    const textarea = document.getElementById('rich-text-editor') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    onChange(newText);
    
    // Restore focus and cursor position (simplified)
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200">
        <ToolbarButton icon={Heading1} onClick={() => insertText('# ', '')} title="Heading 1" />
        <ToolbarButton icon={Heading2} onClick={() => insertText('## ', '')} title="Heading 2" />
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        <ToolbarButton icon={Bold} onClick={() => insertText('**', '**')} title="Bold" />
        <ToolbarButton icon={Italic} onClick={() => insertText('_', '_')} title="Italic" />
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        <ToolbarButton icon={List} onClick={() => insertText('- ', '')} title="Bullet List" />
        <ToolbarButton icon={ListOrdered} onClick={() => insertText('1. ', '')} title="Numbered List" />
      </div>
      <textarea
        id="rich-text-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Write your instructions here (Markdown supported)...'}
        className="w-full min-h-[200px] p-4 focus:outline-none resize-y"
      />
    </div>
  );
};

const ToolbarButton = ({ icon: Icon, onClick, title }: any) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
  >
    <Icon className="w-4 h-4" />
  </button>
);
