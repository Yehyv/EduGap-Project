export type LoginFormValues = {
  username: string;
  password: string;
};
export type VerifyOtpValues = {
  challengeId?: string | null;
  code: string;
};
export type ChangePasswordValues = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};
export type ChangePasswordForForgotPasswordValues = {
  newPassword: string;
  confirmPassword: string;
};

export type AuthContextType = {
  token: string | null;
  dashboardToken: string | null;
  login: (token: string) => void;
  dashboardLogin: (token: string) => void;
  saveRefreshToken: (token: string) => void;
  saveRefreshTokenDashoard: (token: string) => void;
  logout: () => void;
  dashboardLogout: () => void;
};

export type ForgotPasswordFormValues = {
  number: string;
  username: string;
};

export type ApiErrorResponse = {
  message: string[] | string;
};
