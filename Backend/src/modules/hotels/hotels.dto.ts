import { z } from 'zod';

const contactInputSchema = z.object({
  category: z.enum(['MANAGEMENT', 'IT', 'MAINTENANCE', 'PROCUREMENT']),
  name: z.string().optional(),
  role: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('אימייל לא תקין').optional().or(z.literal('')),
});

export const createHotelSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'שם המלון נדרש'),
    networkId: z.string().uuid().optional(),
    networkName: z.string().optional(),
    location: z.string().optional(),
    contentProvider: z.string().optional(),
    viggoRegistrationCode: z.string().optional(),
    technicianCode: z.string().optional(),
    serviceSupport: z.string().optional(),
    deviceType: z.string().optional(),
    ipConnection: z.string().optional(),
    channelSource: z.string().optional(),
    switches: z.string().optional(),
    salesPerson: z.string().optional(),
    notes: z.string().optional(),
    siteContact: z.string().optional(),
    activeSpareLicenses: z.number().int().min(0).optional(),
    hotLicenseCount: z.number().int().min(0).optional(),
    hotLicenseNotes: z.string().optional(),
    roomCount: z.number().int().min(0).optional(),
    remarks: z.string().optional(),
    contacts: z.array(contactInputSchema).optional(),
  }),
});

export const updateHotelSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: createHotelSchema.shape.body.partial(),
});

export const hotelQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform(v => (v ? parseInt(v) : 1)),
    pageSize: z.string().optional().transform(v => (v ? parseInt(v) : 20)),
    search: z.string().optional(),
    networkId: z.string().optional(),
    location: z.string().optional(),
    contentProvider: z.string().optional(),
    deviceType: z.string().optional(),
    salesPerson: z.string().optional(),
    sortBy: z.string().optional().default('name'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
});

export const hotelIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export type CreateHotelDto = z.infer<typeof createHotelSchema>['body'];
export type UpdateHotelDto = z.infer<typeof updateHotelSchema>['body'];
export type HotelQueryDto = z.infer<typeof hotelQuerySchema>['query'];
