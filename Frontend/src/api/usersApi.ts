import { baseApi } from './baseApi';
import type { User } from './authApi';

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<{ data: User[] }, void>({
      query: () => '/users',
      providesTags: ['User'],
    }),
    updateUser: builder.mutation<{ data: User }, { id: string; body: { isActive?: boolean; role?: 'ADMIN' | 'USER' } }>({
      query: ({ id, body }) => ({ url: `/users/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),
    deactivateUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useGetUsersQuery, useUpdateUserMutation, useDeactivateUserMutation } = usersApi;
