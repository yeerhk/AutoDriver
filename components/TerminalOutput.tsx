import React from 'react';

interface TerminalOutputProps {
  output: string;
  status: 'idle' | 'loading' | 'success' | 'failed';
}

const TerminalOutput: React.FC<TerminalOutputProps> = ({ output, status }) => {
  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Build Log / Terminal</label>
        <div className="flex items-center gap-2">
           <span className={`w-2 h-2 rounded-full ${status === 'loading' ? 'bg-yellow-500 animate-pulse' : status === 'success' ? 'bg-green-500' : status === 'failed' ? 'bg-red-500' : 'bg-slate-600'}`}></span>
           <span className="text-xs text-slate-500 uppercase">{status}</span>
        </div>
      </div>
      <div className="w-full flex-grow min-h-[300px] bg-black border border-slate-800 rounded-lg p-4 font-mono text-xs overflow-y-auto text-green-400 shadow-inner">
        {status === 'loading' && (
          <div className="animate-pulse">
            <span className="text-blue-400">root@autodriver:~/build#</span> make<br/>
            Compiling driver sources...<br/>
            Analyze SDK dependency tree...<br/>
          </div>
        )}
        {output ? (
          <pre className="whitespace-pre-wrap">{output}</pre>
        ) : (
           status === 'idle' && <span className="text-slate-600 opacity-50">Waiting for input...</span>
        )}
      </div>
    </div>
  );
};

export default TerminalOutput;
