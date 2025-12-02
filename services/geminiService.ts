import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DriverInput, CompilationResult, TargetArch, KernelVersion } from "../types";

// Helper to sanitize JSON string if model adds markdown blocks
const cleanJson = (text: string) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const generateDriverBuild = async (input: DriverInput): Promise<CompilationResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY not found in environment variables");
  }

  const ai = new GoogleGenAI({ apiKey });

  // We use gemini-3-pro-preview for superior coding and reasoning capabilities
  const modelName = 'gemini-3-pro-preview';

  const prompt = `
    You are a Senior Embedded Linux Kernel Engineer and Compiler Expert.
    
    TASK:
    Analyze the provided SDK Header/Code and Driver Source Code.
    1. Generate a robust, production-ready 'Makefile' for the target architecture and kernel.
    2. Perform a deep static analysis of the C code for common kernel panics, race conditions, memory leaks, or API misuse.
    3. Simulate the GCC/Clang compilation process output (stdout/stderr).
    4. If there are errors, fix them in an 'optimizedSource' version.

    CONTEXT:
    Target Arch: ${input.arch}
    Kernel Version: ${input.kernel}
    Extra Flags: ${input.extraFlags}

    SDK/HEADER CODE:
    ${input.sdkHeader}

    DRIVER SOURCE CODE:
    ${input.driverSource}

    OUTPUT FORMAT:
    Return a pure JSON object adhering to this schema.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      status: { type: Type.STRING, enum: ['success', 'failed'] },
      makefile: { type: Type.STRING, description: "The complete content of the generated Makefile" },
      simulatedOutput: { type: Type.STRING, description: "Simulated terminal output of the make command (gcc/ld)" },
      optimizedSource: { type: Type.STRING, description: "The corrected driver source code if errors were found" },
      issues: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            severity: { type: Type.STRING, enum: ['error', 'warning', 'info'] },
            line: { type: Type.INTEGER },
            message: { type: Type.STRING },
            suggestion: { type: Type.STRING }
          },
          required: ['severity', 'line', 'message', 'suggestion']
        }
      }
    },
    required: ['status', 'makefile', 'simulatedOutput', 'issues']
  };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        thinkingConfig: { thinkingBudget: 4096 } // Enable thinking for complex code analysis
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(cleanJson(text)) as CompilationResult;
    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to compile and analyze driver. Please check your API key and try again.");
  }
};
