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

export type AuthContextType = {
  token: string | null;
  login: (token: string) => void;
  saveRefreshToken: (token: string) => void;
  logout: () => void;
};

export type ForgotPasswordFormValues = {
  number: string;
};

export type ApiErrorResponse = {
  message: string[] | string;
};
