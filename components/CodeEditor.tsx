import React from 'react';

interface CodeEditorProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  height?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ label, value, onChange, placeholder, readOnly = false, height = "h-64" }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
        {readOnly && (
          <button 
            onClick={() => navigator.clipboard.writeText(value)}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Copy
          </button>
        )}
      </div>
      <div className={`relative w-full ${height} bg-slate-900 border border-slate-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50 transition-all shadow-inner`}>
        <textarea
          className="w-full h-full bg-transparent text-slate-300 font-mono text-sm p-4 resize-none focus:outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
