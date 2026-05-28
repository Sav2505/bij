export type UserRole = 'ADMIN' | 'USER';

export interface IUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IUserState {
  users: IUser[];
  total: number;
}

export interface ILoginRequest {
  username: string;
  password: string;
}

export interface ILoginResponse {
  token: string;
  user: IUser;
}

export interface IAuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
