import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../shared/utils/response.util';
import { STATUS_CODES } from '../../shared/constants/status';
import { AdminMentorService } from './admin-mentor.service';
import { AuthenticatedRequest } from '../../shared/types/authenticated-request';



export class AdminMentorController {
     constructor(private readonly _adminMentorService: AdminMentorService) { }


     async createMentor(
          req: Request,
          res: Response,
          next: NextFunction,
     ): Promise<void> {
          try {
               const { user } = req as AuthenticatedRequest;
               const adminId = user.id;

               await this._adminMentorService.createMentor({
                    adminId,
                    data: req.body,
               });

               sendSuccess(res, {
                    statusCode: STATUS_CODES.CREATED,
                    message: 'Mentor invite sent successfully',
               });
          } catch (error) {
               next(error);
          }
     }

     async updateMentorStatus(
          req: Request,
          res: Response,
          next: NextFunction,
     ): Promise<void> {
          try {
               const mentorId = req.params.mentorId as string;
               const { user } = req as AuthenticatedRequest;
               const adminId = user.id;
               const { status } = req.body;

               await this._adminMentorService.updateMentorStatus({
                    mentorId,
                    status,
                    adminId,
               });

               sendSuccess(res, {
                    statusCode: STATUS_CODES.OK,
                    message: 'Mentor status updated',
               });
          } catch (error) {
               next(error);
          }
     }

     async listMentors(
          req: Request,
          res: Response,
          next: NextFunction,
     ): Promise<void> {
          try {
               const result = await this._adminMentorService.listMentors(req.query);

               sendSuccess(res, {
                    statusCode: STATUS_CODES.OK,
                    data: result,
               });
          } catch (error) {
               next(error);
          }
     }

     async resendMentorInvite(
          req: Request,
          res: Response,
          next: NextFunction,
     ): Promise<void> {
          try {
               const mentorId = req.params.mentorId as string;

               await this._adminMentorService.resendMentorInvite({ mentorId });

               sendSuccess(res, {
                    statusCode: STATUS_CODES.OK,
                    message: 'Mentor invite resent successfully',
               });
          } catch (error) {
               next(error);
          }
     }
}
