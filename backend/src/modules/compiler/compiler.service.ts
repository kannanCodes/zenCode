import { PistonService } from './piston.service';
import { ProblemRepository } from '../problem/problem.repository';
import { ExecuteCodeInput } from './types/compiler.types';
import { AppError } from '../../shared/utils/AppError';
import { STATUS_CODES } from '../../shared/constants/status';

export class CompilerService {
     private readonly pistonService: PistonService;
     private readonly problemRepository: ProblemRepository;
     private pistonResults = new Map<string, any>();

     constructor() {
          this.pistonService = new PistonService();
          this.problemRepository = new ProblemRepository();
     }

     async createExecution(input: ExecuteCodeInput): Promise<{ token: string }> {
          // Fetch problem details if problemId is provided
          let executionData = { ...input };
          if (input.problemId) {
               const problem = await this.problemRepository.findById(input.problemId);
               if (problem) {
                    const testCases = input.isSubmission 
                         ? problem.testCases 
                         : problem.testCases.filter((tc: any) => !tc.isHidden);

                    executionData = {
                         ...executionData,
                         testCases,
                         functionSignature: problem.functionSignature,
                    } as any;
               }
          }

          const result = await this.pistonService.executeCode(executionData as any);
          // Store result in memory with a unique token
          const token = `piston_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          this.pistonResults.set(token, result);
          return { token };
     }

     async getExecutionResult(token: string) {
          const result = this.pistonResults.get(token);
          if (!result) {
               throw new AppError('Execution result not found', STATUS_CODES.NOT_FOUND);
          }
          // Clean up after retrieval
          this.pistonResults.delete(token);
          return result;
     }
}