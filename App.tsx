import React, { useState } from 'react';
import { TargetArch, KernelVersion, DriverInput, CompilationResult } from './types';
import { generateDriverBuild } from './services/geminiService';
import CodeEditor from './components/CodeEditor';
import TerminalOutput from './components/TerminalOutput';
import AnalysisPanel from './components/AnalysisPanel';

// Default placeholders
const DEFAULT_SDK = `// example_sdk.h
#ifndef EXAMPLE_SDK_H
#define EXAMPLE_SDK_H

struct sdk_device_t {
    int id;
    void *regs;
    void (*interrupt_handler)(void*);
};

int sdk_register_device(struct sdk_device_t *dev);
void sdk_write_reg(struct sdk_device_t *dev, int reg, int val);

#endif`;

const DEFAULT_DRIVER = `#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>
#include "example_sdk.h"

static struct sdk_device_t my_dev;

static int __init my_driver_init(void) {
    printk(KERN_INFO "Loading My Driver\n");
    // Potential Bug: Uninitialized pointer usage often simulated here
    // my_dev.regs = NULL; 
    sdk_register_device(&my_dev);
    return 0;
}

static void __exit my_driver_exit(void) {
    printk(KERN_INFO "Unloading My Driver\n");
}

module_init(my_driver_init);
module_exit(my_driver_exit);
MODULE_LICENSE("GPL");`;

const App: React.FC = () => {
  const [sdkCode, setSdkCode] = useState(DEFAULT_SDK);
  const [driverCode, setDriverCode] = useState(DEFAULT_DRIVER);
  const [arch, setArch] = useState<TargetArch>(TargetArch.X86_64);
  const [kernel, setKernel] = useState<KernelVersion>(KernelVersion.V6_6);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle');
  const [result, setResult] = useState<CompilationResult | null>(null);

  const handleCompile = async () => {
    setStatus('loading');
    setResult(null);

    const input: DriverInput = {
      sdkHeader: sdkCode,
      driverSource: driverCode,
      arch,
      kernel,
      extraFlags: "-Wall -Werror"
    };

    try {
      const compileResult = await generateDriverBuild(input);
      setResult(compileResult);
      setStatus(compileResult.status);
    } catch (error) {
      console.error(error);
      setStatus('failed');
      setResult({
        makefile: "",
        simulatedOutput: `FATAL ERROR: Connection to AI Build System failed.\n${error instanceof Error ? error.message : 'Unknown error'}`,
        issues: [],
        status: 'failed'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 lg:p-8 flex flex-col gap-6">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            AutoDriver AI
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Automated Kernel Driver Compilation & Static Analysis Environment
          </p>
        </div>
        <div className="flex gap-3">
          <select 
            value={arch} 
            onChange={(e) => setArch(e.target.value as TargetArch)}
            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {Object.values(TargetArch).map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select 
            value={kernel} 
            onChange={(e) => setKernel(e.target.value as KernelVersion)}
            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {Object.values(KernelVersion).map((k) => <option key={k} value={k}>Linux {k}</option>)}
          </select>
          <button 
            onClick={handleCompile}
            disabled={status === 'loading'}
            className={`px-6 py-2 rounded font-semibold text-sm transition-all shadow-lg shadow-blue-900/20
              ${status === 'loading' 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
          >
            {status === 'loading' ? 'Compiling...' : 'Build Driver'}
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full flex-grow">
        
        {/* Left Column: Inputs */}
        <div className="flex flex-col gap-6">
          <CodeEditor 
            label="SDK Header / Definitions" 
            value={sdkCode} 
            onChange={setSdkCode} 
            placeholder="// Paste SDK .h content here..."
            height="h-64"
          />
          <CodeEditor 
            label="Driver Source (.c)" 
            value={driverCode} 
            onChange={setDriverCode} 
            placeholder="// Paste driver .c content here..."
            height="h-[500px]"
          />
        </div>

        {/* Right Column: Outputs */}
        <div className="flex flex-col gap-6">
          
          {/* Top: Terminal Simulation */}
          <div className="flex-grow min-h-[300px]">
            <TerminalOutput 
              output={result?.simulatedOutput || ""} 
              status={status}
            />
          </div>

          {/* Middle: Analysis */}
          {result?.issues && result.issues.length > 0 && (
             <AnalysisPanel issues={result.issues} />
          )}

          {/* Bottom: Generated Makefile */}
          {result?.makefile && (
            <CodeEditor 
              label="Generated Makefile" 
              value={result.makefile} 
              onChange={() => {}} 
              readOnly 
              height="h-64"
            />
          )}

           {/* Bottom: Optimized Code (if exists) */}
           {result?.optimizedSource && (
            <div className="pt-4 border-t border-slate-800">
               <CodeEditor 
                label="AI Refactored Source (Fixes Applied)" 
                value={result.optimizedSource} 
                onChange={() => {}} 
                readOnly 
                height="h-96"
              />
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default App;
