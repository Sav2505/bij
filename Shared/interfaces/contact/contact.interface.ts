export type ContactCategory = 'MANAGEMENT' | 'IT' | 'MAINTENANCE' | 'PROCUREMENT';

export interface IContact {
  id: string;
  hotelId: string;
  category: ContactCategory;
  name?: string;
  role?: string;
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IContactInput {
  category: ContactCategory;
  name?: string;
  role?: string;
  phone?: string;
  email?: string;
}
