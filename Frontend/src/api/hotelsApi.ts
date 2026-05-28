import { baseApi } from './baseApi';

export interface HotelNetwork { id: string; name: string; }

export interface Contact {
  id: string;
  hotelId: string;
  category: 'MANAGEMENT' | 'IT' | 'MAINTENANCE' | 'PROCUREMENT';
  name?: string;
  role?: string;
  phone?: string;
  email?: string;
}

export interface Hotel {
  id: string;
  name: string;
  network?: HotelNetwork;
  networkId?: string;
  location?: string;
  contentProvider?: string;
  viggoRegistrationCode?: string;
  technicianCode?: string;
  serviceSupport?: string;
  deviceType?: string;
  ipConnection?: string;
  channelSource?: string;
  switches?: string;
  salesPerson?: string;
  notes?: string;
  siteContact?: string;
  activeSpareLicenses?: number;
  hotLicenseCount?: number;
  hotLicenseNotes?: string;
  roomCount?: number;
  remarks?: string;
  contacts: Contact[];
  updatedAt: string;
  createdAt: string;
}

export interface HotelSummary {
  id: string;
  name: string;
  network?: HotelNetwork;
  location?: string;
  contentProvider?: string;
  deviceType?: string;
  salesPerson?: string;
  activeSpareLicenses?: number;
  updatedAt: string;
}

export interface HotelFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  networkId?: string;
  location?: string;
  contentProvider?: string;
  deviceType?: string;
  salesPerson?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedHotels {
  data: HotelSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface HotelInput {
  name: string;
  networkId?: string;
  networkName?: string;
  location?: string;
  contentProvider?: string;
  viggoRegistrationCode?: string;
  technicianCode?: string;
  serviceSupport?: string;
  deviceType?: string;
  ipConnection?: string;
  channelSource?: string;
  switches?: string;
  salesPerson?: string;
  notes?: string;
  siteContact?: string;
  activeSpareLicenses?: number;
  hotLicenseCount?: number;
  hotLicenseNotes?: string;
  roomCount?: number;
  remarks?: string;
  contacts?: Omit<Contact, 'id' | 'hotelId'>[];
}

export interface DashboardStats {
  totalHotels: number;
  totalNetworks: number;
  totalLicenses: number;
  recentUpdates: HotelSummary[];
}

export interface FilterOptions {
  networks: HotelNetwork[];
  locations: string[];
  contentProviders: string[];
  deviceTypes: string[];
  salesPersons: string[];
}

export const hotelsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHotels: builder.query<{ data: PaginatedHotels }, HotelFilters>({
      query: (params) => ({ url: '/hotels', params }),
      providesTags: ['Hotel'],
    }),
    getHotelById: builder.query<{ data: Hotel }, string>({
      query: (id) => `/hotels/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Hotel', id }],
    }),
    createHotel: builder.mutation<{ data: Hotel }, HotelInput>({
      query: (body) => ({ url: '/hotels', method: 'POST', body }),
      invalidatesTags: ['Hotel', 'Dashboard'],
    }),
    updateHotel: builder.mutation<{ data: Hotel }, { id: string; body: Partial<HotelInput> }>({
      query: ({ id, body }) => ({ url: `/hotels/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => ['Hotel', { type: 'Hotel', id }, 'Dashboard'],
    }),
    deleteHotel: builder.mutation<void, string>({
      query: (id) => ({ url: `/hotels/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Hotel', 'Dashboard'],
    }),
    getDashboardStats: builder.query<{ data: DashboardStats }, void>({
      query: () => '/hotels/dashboard',
      providesTags: ['Dashboard'],
    }),
    getFilterOptions: builder.query<{ data: FilterOptions }, void>({
      query: () => '/hotels/filters',
    }),
  }),
});

export const {
  useGetHotelsQuery,
  useGetHotelByIdQuery,
  useCreateHotelMutation,
  useUpdateHotelMutation,
  useDeleteHotelMutation,
  useGetDashboardStatsQuery,
  useGetFilterOptionsQuery,
} = hotelsApi;
