import React from 'react';
import { AnalysisIssue } from '../types';

interface AnalysisPanelProps {
  issues: AnalysisIssue[];
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ issues }) => {
  if (issues.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 w-full mt-4">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Static Analysis Report</label>
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
        {issues.map((issue, idx) => (
          <div key={idx} className={`flex gap-3 p-3 rounded border-l-2 ${
            issue.severity === 'error' ? 'bg-red-950/30 border-red-500' :
            issue.severity === 'warning' ? 'bg-yellow-950/30 border-yellow-500' :
            'bg-blue-950/30 border-blue-500'
          }`}>
            <div className={`mt-0.5 text-xs font-bold uppercase ${
               issue.severity === 'error' ? 'text-red-400' :
               issue.severity === 'warning' ? 'text-yellow-400' :
               'text-blue-400'
            }`}>
              {issue.severity}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-300 text-sm font-medium">Line {issue.line}: {issue.message}</span>
              <span className="text-slate-500 text-xs italic">Suggestion: {issue.suggestion}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisPanel;
