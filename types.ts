export enum TargetArch {
  X86_64 = 'x86_64',
  ARM64 = 'arm64',
  RISCV = 'riscv',
}

export enum KernelVersion {
  V5_15 = '5.15 LTS',
  V6_1 = '6.1 LTS',
  V6_6 = '6.6 LTS',
  LATEST = 'Latest Stable',
}

export interface DriverInput {
  sdkHeader: string;
  driverSource: string;
  arch: TargetArch;
  kernel: KernelVersion;
  extraFlags: string;
}

export interface AnalysisIssue {
  severity: 'error' | 'warning' | 'info';
  line: number;
  message: string;
  suggestion: string;
}

export interface CompilationResult {
  makefile: string;
  simulatedOutput: string; // The terminal build log
  issues: AnalysisIssue[];
  optimizedSource?: string; // If AI refactors the code
  status: 'success' | 'failed';
}
