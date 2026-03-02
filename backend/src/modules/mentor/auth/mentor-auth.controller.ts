import { Request, Response, NextFunction } from 'express';
import { MentorAuthService } from './mentor-auth.service';
import { sendSuccess } from '../../../shared/utils/response.util';
import { STATUS_CODES } from '../../../shared/constants/status';
import { AppError } from '../../../shared/utils/AppError';
import { AUTH_MESSAGES } from '../../../shared/constants/messages';

export class MentorAuthController {
  constructor(
    private readonly _mentorAuthService: MentorAuthService
  ) {}

  async activate(req: Request, res: Response, next: NextFunction) {
    try {
      await this._mentorAuthService.activateMentor(req.body);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: 'Mentor account activated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { accessToken, refreshToken } =
        await this._mentorAuthService.login(req.body);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: 'Mentor login successful',
        data: { accessToken },
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        throw new AppError(AUTH_MESSAGES.UNAUTHORIZED, STATUS_CODES.UNAUTHORIZED);
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await this._mentorAuthService.refresh(refreshToken);

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        data: { accessToken },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (refreshToken) {
        await this._mentorAuthService.logout(refreshToken);
      }

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: AUTH_MESSAGES.LOGOUT_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  }
}