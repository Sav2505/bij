import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { RootState } from '../redux/store';
import { setCredentials, logout } from '../features/auth/authSlice';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as unknown as RootState).auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const apiKey = import.meta.env.VITE_API_KEY;
    if (apiKey) headers.set('X-API-Key', apiKey);
    return headers;
  },
});

// Separate query used only for the refresh call — needs credentials: 'include' for the httpOnly cookie
const refreshBaseQuery = fetchBaseQuery({ baseUrl: API_BASE, credentials: 'include' });

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    // Attempt silent token refresh
    const refreshResult = await refreshBaseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      const { token } = (refreshResult.data as { data: { token: string } }).data;
      const user = (api.getState() as unknown as RootState).auth.user!;
      api.dispatch(setCredentials({ token, user }));
      // Retry the original request with the new access token
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Hotel', 'User', 'Dashboard', 'ImportHistory'],
  endpoints: () => ({}),
});
