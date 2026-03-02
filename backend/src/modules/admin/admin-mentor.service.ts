import crypto from 'crypto';
import { EmailService } from '../../shared/email/email.service';
import { CreateMentorInput } from './mentor-management/types/create-mentor.types';
import { adminRepository } from './admin-mentor.repository';
import { AppError } from '../../shared/utils/AppError';
import { STATUS_CODES } from '../../shared/constants/status';
import { CacheService } from '../../shared/cache/cache.service';
import { REDIS_KEYS } from '../../shared/constants/redis.keys';
import { EXPIRY_TIMES } from '../../shared/constants/expiry.constants';



export class AdminMentorService {
     private _emailService = new EmailService();

     private async _issueInviteForEmail(input: {
          email: string;
          fullName: string;
     }) {
          const { email, fullName } = input;

          const inviteToken = crypto.randomUUID();

          const emailKey = REDIS_KEYS.MENTOR_INVITE_BY_EMAIL(email);
          const existingToken = await CacheService.get<string>(emailKey);

          if (existingToken) {
               await CacheService.del(REDIS_KEYS.MENTOR_INVITE(existingToken));
          }

          await CacheService.set(
               REDIS_KEYS.MENTOR_INVITE(inviteToken),
               email,
               EXPIRY_TIMES.MENTOR_INVITE.SECONDS
          );
          await CacheService.set(
               emailKey,
               inviteToken,
               EXPIRY_TIMES.MENTOR_INVITE.SECONDS
          );

          const inviteLink = `${process.env.FRONTEND_URL}/mentor/activate?token=${inviteToken}`;

          await this._emailService.sendMentorSetupLink(
               {
                    email,
                    inviteLink,
                    fullName
               }
          );
     }

     async createMentor(input: {
          adminId: string;
          data: CreateMentorInput;
     }): Promise<void> {
          const { adminId, data } = input;

          const existingUser = await adminRepository.findUserByEmail(data.email);
          if (existingUser) {
               throw new AppError(
                    'User Already Exists',
                    STATUS_CODES.CONFLICT
               );
          }

          await adminRepository.createMentor({
               data,
               createdByAdminId: adminId,
          });

          await this._issueInviteForEmail({
               email: data.email,
               fullName: data.fullName,
          });
     }


    async updateMentorStatus(input: {
          mentorId: string;
          status: 'ACTIVE' | 'DISABLED';
          adminId: string;
     }) {
          const { mentorId, status, adminId } = input;

          const mentor = await adminRepository.findById(mentorId);

          if (!mentor || mentor.role !== 'mentor') {
               throw new AppError(
                    'Mentor not found',
                    STATUS_CODES.NOT_FOUND
               );
          }

          if (!['ACTIVE', 'DISABLED'].includes(status)) {
               throw new AppError(
                    'Invalid status value',
                    STATUS_CODES.BAD_REQUEST
               );
          }

          const currentStatus = mentor.mentorStatus;

          if (currentStatus === 'INVITED' && status === 'DISABLED') {
               throw new AppError(
                    'Cannot disable invited mentor',
                    STATUS_CODES.BAD_REQUEST
               );
          }

          if (currentStatus === 'ACTIVE' && status === 'ACTIVE') {
               return;
          }

          if (currentStatus === 'DISABLED' && status === 'DISABLED') {
               return;
          }

          await adminRepository.updateMentorStatus({
               userId: mentorId,
               status,
               adminId,
          });
     }

     async listMentors(query: any) {
          const page = Math.max(1, Number(query.page) || 1);
          const limit = Math.min(50, Number(query.limit) || 10);

          return adminRepository.findMentorsWithFilters({
               page,
               limit,
               status: query.status,
               experienceLevel: query.experienceLevel,
               isBlocked: typeof query.isBlocked === 'string'
                    ? query.isBlocked === 'true'
                    : undefined,
               expertise: query.expertise,
               search: query.search,
               sortBy: query.sortBy,
               sortOrder: query.sortOrder,
          });
     }

     async resendMentorInvite(input: { mentorId: string }) {
          const { mentorId } = input;

          const mentor = await adminRepository.findById(mentorId);

          if (!mentor || mentor.role !== 'mentor') {
               throw new AppError(
                    'Mentor not found',
                    STATUS_CODES.NOT_FOUND
               );
          }

          if (mentor.mentorStatus === 'ACTIVE') {
               throw new AppError(
                    'Cannot resend invite for active mentor',
                    STATUS_CODES.BAD_REQUEST
               );
          }

          if (mentor.mentorStatus === 'DISABLED') {
               throw new AppError(
                    'Mentor disabled by admin',
                    STATUS_CODES.BAD_REQUEST
               );
          }

          await this._issueInviteForEmail({
               email: mentor.email,
               fullName: mentor.fullName,
          });
     }
}

// export const adminMentorService = new AdminMentorService();