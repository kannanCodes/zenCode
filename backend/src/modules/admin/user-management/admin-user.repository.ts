import User, { IUser } from '../../user/user.model';
import { UserRole } from '../../../shared/constants/roles';
import { ListUsersQuery } from './types/list-users.query';

class AdminUserRepository {
     async listCandidates(query: ListUsersQuery) {
          const {
               page,
               limit,
               search,
               isBlocked,
               sortBy,
               sortOrder,
          } = query;

          const filter: any = {
               role: UserRole.CANDIDATE,
          };

          if (typeof isBlocked === 'boolean') {
               filter.isBlocked = isBlocked;
          }

          if (search) {
               filter.$or = [
                    { fullName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
               ];
          }

          const skip = (page - 1) * limit;

          const [users, total] = await Promise.all([
               User.find(filter)
                    .select('-password -googleId')
                    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
               User.countDocuments(filter),
          ]);

          return {
               users,
               total,
          };
     }

     async findById(userId: string): Promise<IUser | null> {
          return User.findById(userId);
     }

     async blockUser(userId: string, adminId: string) {
          return User.findByIdAndUpdate(
               userId,
               {
                    isBlocked: true,
                    blockedAt: new Date(),
                    blockedByAdminId: adminId,
               },
               { new: true },
          );
     }

     async unblockUser(userId: string) {
          return User.findByIdAndUpdate(
               userId,
               {
                    isBlocked: false,
                    blockedAt: null,
                    blockedByAdminId: null,
               },
               { new: true },
          );
     }
}

export const adminUserRepository = new AdminUserRepository();