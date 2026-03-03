import { adminUserRepository } from './admin-user.repository';
import { AppError } from '../../../shared/utils/AppError';
import { STATUS_CODES } from '../../../shared/constants/status';
import { UserRole } from '../../../shared/constants/roles';
import { ListUsersQuery } from './types/list-users.query';

export class AdminUserService {
     async listCandidates(query: ListUsersQuery) {
          return adminUserRepository.listCandidates(query);
     }

     async blockUser(adminId: string, userId: string) {
          const user = await adminUserRepository.findById(userId);

          if (!user || user.role !== UserRole.CANDIDATE) {
               throw new AppError('Candidate not found', STATUS_CODES.NOT_FOUND);
          }

          if (user.isBlocked) return;

          await adminUserRepository.blockUser(userId, adminId);
     }

     async unblockUser(userId: string) {
          const user = await adminUserRepository.findById(userId);

          if (!user || user.role !== UserRole.CANDIDATE) {
               throw new AppError('Candidate not found', STATUS_CODES.NOT_FOUND);
          }

          if (!user.isBlocked) return;

          await adminUserRepository.unblockUser(userId);
     }
}