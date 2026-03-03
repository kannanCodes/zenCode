import { Request, Response, NextFunction } from 'express';
import { AdminUserService } from './admin-user.service';
import { sendSuccess } from '../../../shared/utils/response.util';
import { STATUS_CODES } from '../../../shared/constants/status';
import { AuthenticatedRequest } from '../../../shared/types/authenticated-request';
import { ListUsersQuery } from './types/list-users.query';

export class AdminUserController {
     constructor(private readonly service: AdminUserService) { }

     async listUsers(req: Request, res: Response, next: NextFunction) {
          try {
               const query = (req as any).validatedQuery as ListUsersQuery;
               const result = await this.service.listCandidates(query);

               sendSuccess(res, {
                    statusCode: STATUS_CODES.OK,
                    data: result.users,
                    meta: {
                         total: result.total,
                         page: query.page,
                         limit: query.limit,
                    },
               });
          } catch (err) {
               next(err);
          }
     }

     async blockUser(req: Request, res: Response, next: NextFunction) {
          try {
               const { user } = req as AuthenticatedRequest;

               await this.service.blockUser(user.id, req.params.userId as string);

               sendSuccess(res, {
                    statusCode: STATUS_CODES.OK,
                    message: 'User blocked successfully',
               });
          } catch (err) {
               next(err);
          }
     }

     async unblockUser(req: Request, res: Response, next: NextFunction) {
          try {
               await this.service.unblockUser(req.params.userId as string);

               sendSuccess(res, {
                    statusCode: STATUS_CODES.OK,
                    message: 'User unblocked successfully',
               });
          } catch (err) {
               next(err);
          }
     }
}