import { MentorLoginInput } from './types/mentor-login.input';
import { mentorAuthRepository } from './mentor-auth.repository';
import { AppError } from '../../../shared/utils/AppError';
import { STATUS_CODES } from '../../../shared/constants/status';
import { AUTH_MESSAGES } from '../../../shared/constants/messages';
import { passwordService } from '../../../shared/utils/password.util';
import { TokenService } from '../../auth/tokens/token.service';
import { CacheService } from '../../../shared/cache/cache.service';
import { REDIS_KEYS } from '../../../shared/constants/redis.keys';
import { parseExpiryToSeconds } from '../../../shared/utils/expiry.util';
import { REFRESH_TOKEN_EXPIRY } from '../../../shared/constants/token.constants';
import { verifyRefreshToken } from '../../auth/tokens/refresh-token';
import { ActivateMentorInput } from '../../admin/mentor-management/types/activate-mentor.input.type';
import { adminRepository } from '../../admin/admin-mentor.repository';

export class MentorAuthService {

  async activateMentor(input: ActivateMentorInput) {
    const { token, password, confirmPassword } = input;

    if (password !== confirmPassword) {
      throw new AppError(
        'Passwords do not match',
        STATUS_CODES.BAD_REQUEST
      );
    }

    if (password.length < 8) {
      throw new AppError(
        'Password must be at least 8 characters',
        STATUS_CODES.BAD_REQUEST
      );
    }

    const email = await CacheService.get<string>(
      REDIS_KEYS.MENTOR_INVITE(token)
    );

    if (!email) {
      throw new AppError(
        'Invalid or Expired Invite Link',
        STATUS_CODES.UNAUTHORIZED
      );
    }

    const latestTokenForEmail = await CacheService.get<string>(
      REDIS_KEYS.MENTOR_INVITE_BY_EMAIL(email)
    );

    if (!latestTokenForEmail || latestTokenForEmail !== token) {
      throw new AppError(
        'Invalid or Expired Invite Link',
        STATUS_CODES.UNAUTHORIZED
      );
    }

    const mentor = await adminRepository.findUserByEmail(email);

    if (!mentor) {
      throw new AppError(
        'Mentor Account not Found',
        STATUS_CODES.NOT_FOUND
      );
    }

    if (mentor.mentorStatus === 'DISABLED') {
      throw new AppError(
        'Mentor disabled by admin',
        STATUS_CODES.FORBIDDEN
      );
    }

    if (mentor.mentorStatus !== 'INVITED') {
      throw new AppError(
        'Invalid mentor state',
        STATUS_CODES.CONFLICT
      );
    }

    const hashedPassword = await passwordService.hash(password);

    await adminRepository.activateMentor({
      userId: mentor.id,
      hashedPassword,
    });

    await CacheService.del(REDIS_KEYS.MENTOR_INVITE(token));
    await CacheService.del(REDIS_KEYS.MENTOR_INVITE_BY_EMAIL(email));
  }

  async login(input: MentorLoginInput) {
    const { email, password } = input;

    const mentor = await mentorAuthRepository.findMentorByEmail(email);

    if (!mentor) {
      throw new AppError(AUTH_MESSAGES.USER_NOT_FOUND, STATUS_CODES.UNAUTHORIZED);
    }

    if (mentor.isBlocked) {
      throw new AppError(AUTH_MESSAGES.USER_BLOCKED, STATUS_CODES.FORBIDDEN);
    }

    if (!mentor.isEmailVerified) {
      throw new AppError(
        'Mentor account not activated',
        STATUS_CODES.FORBIDDEN
      );
    }

    if (mentor.mentorStatus !== 'ACTIVE') {
      throw new AppError(
        'Account disabled. Contact admin.',
        STATUS_CODES.FORBIDDEN
      );
    }

    if (!mentor.password) {
      throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED);
    }

    const isMatch = await passwordService.compare(password, mentor.password);
    if (!isMatch) {
      throw new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED);
    }

    const { accessToken, refreshToken, refreshTokenId } =
      TokenService.generateAuthTokens({
        id: mentor.id,
        role: mentor.role,
      });

    const refreshKey = REDIS_KEYS.REFRESH_TOKEN(refreshTokenId);
    const refreshTTL = parseExpiryToSeconds(REFRESH_TOKEN_EXPIRY);

    await CacheService.set(refreshKey, mentor.id, refreshTTL);

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);

    const oldKey = REDIS_KEYS.REFRESH_TOKEN(payload.tokenId);
    const storedUserId = await CacheService.get<string>(oldKey);

    if (!storedUserId || storedUserId !== payload.sub) {
      throw new AppError(AUTH_MESSAGES.UNAUTHORIZED, STATUS_CODES.UNAUTHORIZED);
    }

    const mentor = await mentorAuthRepository.findById(payload.sub);

    if (!mentor || mentor.isBlocked) {
      throw new AppError(AUTH_MESSAGES.UNAUTHORIZED, STATUS_CODES.UNAUTHORIZED);
    }

    await CacheService.del(oldKey);

    const { accessToken, refreshToken: newRefreshToken, refreshTokenId } =
      TokenService.generateAuthTokens({
        id: mentor.id,
        role: mentor.role,
      });

    const newKey = REDIS_KEYS.REFRESH_TOKEN(refreshTokenId);
    const ttl = parseExpiryToSeconds(REFRESH_TOKEN_EXPIRY);

    await CacheService.set(newKey, mentor.id, ttl);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const key = REDIS_KEYS.REFRESH_TOKEN(payload.tokenId);
      await CacheService.del(key);
    } catch {
      return;
    }
  }
}