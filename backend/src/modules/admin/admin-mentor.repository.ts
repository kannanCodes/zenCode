import User, { IUser } from "../user/user.model";
import { UserRole } from "../../shared/constants/roles";
import { CreateMentorInput } from "./mentor-management/types/create-mentor.types";


class AdminRepository {

     async findUserByEmail(email: string): Promise<IUser | null> {
          return User.findOne({ email }).exec();
     }

     async createMentor(input: {
          data: CreateMentorInput;
          createdByAdminId: string;
     }): Promise<Partial<IUser>> {
          const { data, createdByAdminId } = input;
          return User.create({
               fullName: data.fullName,
               email: data.email,
               role: UserRole.MENTOR,
               expertise: data.expertise,
               experienceLevel: data.experienceLevel,
               isEmailVerified: false,
               mentorStatus: 'INVITED',
               invitedAt: new Date(),
               createdByAdminId,
          })
     }

     async findById(id: string): Promise<IUser | null> {
          return User.findById(id).exec();
     }

     async findMentorsWithFilters(input: {
          page: number;
          limit: number;
          status?: 'INVITED' | 'ACTIVE' | 'DISABLED';
          experienceLevel?: 'junior' | 'mid' | 'senior';
          isBlocked?: boolean;
          expertise?: string;
          search?: string;
          sortBy?: string;
          sortOrder?: 'asc' | 'desc';
     }) {
          const {
               page,
               limit,
               status,
               experienceLevel,
               isBlocked,
               expertise,
               search,
               sortBy = 'createdAt',
               sortOrder = 'desc',
          } = input;

          const filter: Record<string, any> = {
               role: UserRole.MENTOR,
          };

          if (status) filter.mentorStatus = status;
          if (experienceLevel) filter.experienceLevel = experienceLevel;
          if (typeof isBlocked === 'boolean') filter.isBlocked = isBlocked;
          if (expertise) filter.expertise = expertise;

          if (search) {
               filter.$or = [
                    { fullName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { expertise: { $regex: search, $options: 'i' } },
               ];
          }

          const skip = (page - 1) * limit;

          const sortFieldWhitelist = new Set([
               'createdAt',
               'invitedAt',
               'activatedAt',
               'experienceLevel',
               'mentorStatus',
          ]);

          const finalSortBy = sortFieldWhitelist.has(sortBy)
               ? sortBy
               : 'createdAt';

          const sort: Record<string, 1 | -1> = {
               [finalSortBy]: sortOrder === 'asc' ? 1 : -1,
          };

          const [data, total] = await Promise.all([
               User.find(filter)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .select('-password')
                    .exec(),
               User.countDocuments(filter),
          ]);

          return {
               data,
               meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
               },
          };
     }

    async updateMentorStatus(input: {
          userId: string;
          status: 'ACTIVE' | 'DISABLED';
          adminId: string;
     }) {
          const { userId, status, adminId } = input;

          const update: Partial<IUser> = {
               mentorStatus: status,
               lastStatusChangedAt: new Date(),
               lastStatusChangedByAdminId: adminId as any,
          };

          if (status === 'DISABLED') {
               (update as any).disabledAt = new Date();
          }

          if (status === 'ACTIVE') {
               (update as any).disabledAt = undefined;
          }

          return User.findByIdAndUpdate(userId, update, { new: true });
     }

     async activateMentor(input: {
          userId: string;
          hashedPassword: string;
     }) {
          return User.findByIdAndUpdate(
               input.userId,
               {
                    password: input.hashedPassword,
                    isEmailVerified: true,
                    mentorStatus: 'ACTIVE',
                    activatedAt: new Date(),
               },
               { new: true }
          );
     }
}

export const adminRepository = new AdminRepository();