import { baseApi } from './baseApi';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest { username: string; password: string; }
export interface LoginResponse { data: { token: string; user: User }; success: boolean; }
export interface CreateUserRequest { username: string; email: string; password: string; role: 'ADMIN' | 'USER'; }

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({ url: '/auth/login', method: 'POST', body: credentials }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST', credentials: 'include' }),
    }),
    getMe: builder.query<{ data: User }, void>({
      query: () => '/auth/me',
    }),
    createUser: builder.mutation<{ data: User }, CreateUserRequest>({
      query: (body) => ({ url: '/auth/users', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetMeQuery, useCreateUserMutation } = authApi;
