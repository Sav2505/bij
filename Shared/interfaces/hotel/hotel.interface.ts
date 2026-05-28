import { IContact, IContactInput } from '../contact/contact.interface';

export interface IHotelNetwork {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface IHotel {
  id: string;
  networkId?: string;
  network?: IHotelNetwork;
  name: string;
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
  isDeleted: boolean;
  contacts: IContact[];
  createdAt: string;
  updatedAt: string;
}

export interface IHotelSummary {
  id: string;
  name: string;
  network?: string;
  location?: string;
  contentProvider?: string;
  deviceType?: string;
  salesPerson?: string;
  activeSpareLicenses?: number;
}

export interface IHotelInput {
  networkId?: string;
  networkName?: string;
  name: string;
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
  contacts?: IContactInput[];
}

export interface IHotelFilters {
  search?: string;
  networkId?: string;
  location?: string;
  contentProvider?: string;
  deviceType?: string;
  salesPerson?: string;
}

export interface IPaginatedHotels {
  data: IHotelSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IHotelsState {
  hotels: IHotelSummary[];
  selectedHotel: IHotel | null;
  total: number;
  page: number;
  pageSize: number;
  filters: IHotelFilters;
  isLoading: boolean;
  error: string | null;
}

export interface IDashboardStats {
  totalHotels: number;
  totalNetworks: number;
  totalRooms: number;
  recentUpdates: IHotelSummary[];
}
