import { SubmissionRepository } from "./submission.repository";
import { CompilerService } from "../compiler/compiler.service";
import { ProblemRepository } from "../problem/problem.repository";
import { SubmissionStatus } from "./submission.enum";
import { AppError } from "../../shared/utils/AppError";
import { STATUS_CODES } from "../../shared/constants/status";

export class SubmissionService {

     private submissionRepo = new SubmissionRepository();
     private compilerService = new CompilerService();
     private problemRepo = new ProblemRepository();

     async submitSolution(userId: string, data: any) {

          const problem = await this.problemRepo.findById(data.problemId);

          if (!problem) {
               throw new AppError("Problem not found", STATUS_CODES.NOT_FOUND);
          }

          // Step 1: Create submission
          const submission = await this.submissionRepo.create({
               userId,
               problemId: data.problemId,
               language: data.language,
               sourceCode: data.sourceCode,
               status: SubmissionStatus.RUNNING,
          });

          try {
               // Step 2: Execute code
               const execution = await this.compilerService.createExecution({
                    language: data.language,
                    sourceCode: data.sourceCode,
                    problemId: data.problemId,
                    isSubmission: true,
               });

                // Poll for result (Piston is synchronous but let's be safe)
                let result;
                let attempts = 0;
                const maxAttempts = 20;

                while (attempts < maxAttempts) {
                     try {
                          result = await this.compilerService.getExecutionResult(execution.token);
                          break;
                     } catch (error: any) {
                          if (error.statusCode === STATUS_CODES.NOT_FOUND && attempts < maxAttempts - 1) {
                               await new Promise(resolve => setTimeout(resolve, 500));
                               attempts++;
                          } else {
                               throw error;
                          }
                     }
                }

                if (!result) {
                     throw new AppError('Execution timeout', STATUS_CODES.REQUEST_TIMEOUT);
                }

               // Step 3: Decide status
               let status = SubmissionStatus.ACCEPTED;

               if (result.compile_output) {
                    status = SubmissionStatus.COMPILATION_ERROR;
               } else if (result.stderr) {
                    status = SubmissionStatus.RUNTIME_ERROR;
               } else if (result.testResults?.some((t: any) => !t.passed)) {
                    status = SubmissionStatus.WRONG_ANSWER;
               }

               // Step 4: Update submission
               const updated = await this.submissionRepo.update(submission.id, {
                    status,
                    stdout: result.stdout,
                    stderr: result.stderr,
                    compile_output: result.compile_output,
                    time: result.time,
                    memory: result.memory,
                    testResults: result.testResults,
               });

               return updated;

          } catch (error: any) {

               await this.submissionRepo.update(submission.id, {
                    status: SubmissionStatus.RUNTIME_ERROR,
                    stderr: error.message,
               });

               throw error;
          }
     }

     async getSubmission(id: string) {
          const submission = await this.submissionRepo.findById(id);

          if (!submission) {
               throw new AppError("Submission not found", STATUS_CODES.NOT_FOUND);
          }

          return submission;
     }

     async getUserSubmissions(userId: string) {
          return this.submissionRepo.listByUser(userId);
     }
}