import { Request, Response, NextFunction } from "express";
import { SubmissionService } from "./submission.service";
import { AuthenticatedRequest } from "../../shared/types/authenticated-request";
import { sendSuccess } from "../../shared/utils/response.util";
import { STATUS_CODES } from "../../shared/constants/status";

export class SubmissionController {

     private submissionService = new SubmissionService();

     submit = async (
          req: Request,
          res: Response,
          next: NextFunction
     ) => {
          try {

               const authReq = req as AuthenticatedRequest;

               const result = await this.submissionService.submitSolution(
                    authReq.user.id,
                    req.body
               );

               return sendSuccess(res, {
                    statusCode: STATUS_CODES.OK,
                    message: "Submission executed successfully",
                    data: result,
               });

          } catch (error) {
               next(error);
          }
     };

     getSubmission = async (
          req: Request,
          res: Response,
          next: NextFunction
     ) => {
          try {

               const result = await this.submissionService.getSubmission(
                    req.params.id as string
               );

               return sendSuccess(res, {
                    statusCode: STATUS_CODES.OK,
                    message: "Submission fetched successfully",
                    data: result,
               });

          } catch (error) {
               next(error);
          }
     };

     getMySubmissions = async (
          req: Request,
          res: Response,
          next: NextFunction
     ) => {
          try {

               const authReq = req as AuthenticatedRequest;

               const result = await this.submissionService.getUserSubmissions(
                    authReq.user.id
               );

               return sendSuccess(res, {
                    statusCode: STATUS_CODES.OK,
                    message: "Submissions fetched successfully",
                    data: result,
               });

          } catch (error) {
               next(error);
          }
     };
}