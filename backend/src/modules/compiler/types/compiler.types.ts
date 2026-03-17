import { SupportedLanguage } from '../language.constants';

export interface ExecuteCodeInput {
     language: SupportedLanguage;
     sourceCode: string;
     stdin?: string;
     problemId?: string;
     testCases?: any[];
     functionSignature?: any;
     isSubmission?: boolean;
}

export interface ExecutionResult {
     stdout: string | null;
     stderr: string | null;
     status: {
          id: number;
          description: string;
     };
     time: string | null;
     memory: number | null;
     compile_output: string | null;
     testResults?: {
          input: string;
          expectedOutput: string;
          actualOutput: string;
          passed: boolean;
          error?: string;
     }[];
}
