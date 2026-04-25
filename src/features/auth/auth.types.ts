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

export type ForgotPasswordFormValues = {
  number: string;
  username: string;
};

export type ApiErrorResponse = {
  message: string[] | string;
};

export interface InstAdminInfo {
  userName: string;
  userImage: string;
  instituteName: string;
  logo: string;
}

export interface AuthContextType {
  token: string | null;
  dashboardToken: string | null;
  role: string | null;
  instAdminInfo: InstAdminInfo | null; // ← null for non-INST_ADMIN
  saveInstAdminInfo: (info: InstAdminInfo) => void;
  login: (token: string) => void;
  dashboardLogin: (token: string) => void;
  logout: () => void;
  dashboardLogout: () => void;
  saveRefreshToken: (token: string) => void;
  saveRefreshTokenDashoard: (token: string) => void;
}
