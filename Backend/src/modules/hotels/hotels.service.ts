import * as repo from './hotels.repository';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { CreateHotelDto, UpdateHotelDto, HotelQueryDto } from './hotels.dto';

export const getHotels = (query: HotelQueryDto) => repo.findMany(query);

export const getHotelById = async (id: string) => {
  const hotel = await repo.findById(id);
  if (!hotel) throw new AppError('מלון לא נמצא', 404);
  return hotel;
};

export const createHotel = async (dto: CreateHotelDto, userId?: string) => {
  let networkId = dto.networkId;

  if (!networkId && dto.networkName) {
    const network = await repo.findOrCreateNetwork(dto.networkName);
    networkId = network.id;
  }

  const { contacts, networkName, ...hotelData } = dto;

  const hotel = await repo.create({
    ...hotelData,
    networkId,
    contacts: contacts?.length
      ? { create: contacts }
      : undefined,
  } as any);

  if (userId) {
    await prisma.auditLog.create({
      data: { userId, action: 'CREATE', entityType: 'Hotel', entityId: hotel.id, newValue: { name: hotel.name } },
    });
  }

  return hotel;
};

export const updateHotel = async (id: string, dto: UpdateHotelDto, userId?: string) => {
  const existing = await repo.findById(id);
  if (!existing) throw new AppError('מלון לא נמצא', 404);

  let networkId = dto.networkId;
  if (!networkId && dto.networkName) {
    const network = await repo.findOrCreateNetwork(dto.networkName);
    networkId = network.id;
  }

  const { contacts, networkName, ...hotelData } = dto;

  const hotel = await repo.update(id, {
    ...hotelData,
    ...(networkId !== undefined && { networkId }),
    ...(contacts && {
      contacts: {
        deleteMany: {},
        create: contacts,
      },
    }),
  } as any);

  if (userId) {
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        entityType: 'Hotel',
        entityId: id,
        oldValue: { name: existing.name },
        newValue: { name: hotel.name },
      },
    });
  }

  return hotel;
};

export const deleteHotel = async (id: string, userId?: string) => {
  const existing = await repo.findById(id);
  if (!existing) throw new AppError('מלון לא נמצא', 404);

  await repo.softDelete(id);

  if (userId) {
    await prisma.auditLog.create({
      data: { userId, action: 'DELETE', entityType: 'Hotel', entityId: id, oldValue: { name: existing.name } },
    });
  }
};

export const getDashboardStats = () => repo.getDashboardStats();
export const getFilterOptions = () => repo.getFilterOptions();
