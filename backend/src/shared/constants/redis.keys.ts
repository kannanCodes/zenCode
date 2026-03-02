export const REDIS_KEYS = {
  OTP: (email: string) => `otp:${email}`,
  REGISTRATION: (email: string) => `registration:${email}`,
  RESET_PASSWORD: (token: string) => `reset-password:${token}`,
  OTP_META: (email: string) => `otp-meta:${email}`,
  REFRESH_TOKEN: (tokenId: string) => `refresh:${tokenId}`,
  MENTOR_INVITE: (token: string) => `mentor-setup:${token}`,
  MENTOR_INVITE_BY_EMAIL: (email: string) => `mentor-setup-email:${email}`,
};