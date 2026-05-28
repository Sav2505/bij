import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { HotelQueryDto } from './hotels.dto';

const hotelSelect = {
  id: true,
  name: true,
  location: true,
  contentProvider: true,
  viggoRegistrationCode: true,
  technicianCode: true,
  serviceSupport: true,
  deviceType: true,
  ipConnection: true,
  channelSource: true,
  switches: true,
  salesPerson: true,
  notes: true,
  siteContact: true,
  activeSpareLicenses: true,
  hotLicenseCount: true,
  hotLicenseNotes: true,
  roomCount: true,
  remarks: true,
  isDeleted: true,
  createdAt: true,
  updatedAt: true,
  network: { select: { id: true, name: true } },
  contacts: true,
} as const;

export const findMany = async (query: HotelQueryDto) => {
  const { page, pageSize, search, networkId, location, contentProvider, deviceType, salesPerson, sortBy, sortOrder } = query;

  const where: Prisma.HotelWhereInput = {
    isDeleted: false,
    ...(networkId && { networkId }),
    ...(location && { location: { contains: location, mode: 'insensitive' } }),
    ...(contentProvider && { contentProvider: { contains: contentProvider, mode: 'insensitive' } }),
    ...(deviceType && { deviceType: { contains: deviceType, mode: 'insensitive' } }),
    ...(salesPerson && { salesPerson: { contains: salesPerson, mode: 'insensitive' } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { contentProvider: { contains: search, mode: 'insensitive' } },
        { salesPerson: { contains: search, mode: 'insensitive' } },
        { viggoRegistrationCode: { contains: search, mode: 'insensitive' } },
        { network: { name: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const allowedSortFields: Record<string, Prisma.HotelOrderByWithRelationInput> = {
    name: { name: sortOrder },
    location: { location: sortOrder },
    network: { network: { name: sortOrder } },
    contentProvider: { contentProvider: sortOrder },
    updatedAt: { updatedAt: sortOrder },
  };

  const orderBy = allowedSortFields[sortBy] ?? { name: 'asc' };

  const [data, total] = await Promise.all([
    prisma.hotel.findMany({
      where,
      select: {
        id: true,
        name: true,
        location: true,
        contentProvider: true,
        deviceType: true,
        salesPerson: true,
        activeSpareLicenses: true,
        network: { select: { id: true, name: true } },
        updatedAt: true,
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.hotel.count({ where }),
  ]);

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
};

export const findById = async (id: string) => {
  return prisma.hotel.findFirst({ where: { id, isDeleted: false }, select: hotelSelect });
};

export const create = async (data: Prisma.HotelCreateInput) => {
  return prisma.hotel.create({ data, select: hotelSelect });
};

export const update = async (id: string, data: Prisma.HotelUpdateInput) => {
  return prisma.hotel.update({ where: { id }, data, select: hotelSelect });
};

export const softDelete = async (id: string) => {
  return prisma.hotel.update({ where: { id }, data: { isDeleted: true } });
};

export const findOrCreateNetwork = async (name: string) => {
  return prisma.hotelNetwork.upsert({
    where: { name },
    create: { name },
    update: {},
  });
};

export const getDashboardStats = async () => {
  const [totalHotels, totalNetworks, roomCountAgg, recentUpdates] = await Promise.all([
    prisma.hotel.count({ where: { isDeleted: false } }),
    prisma.hotelNetwork.count(),
    prisma.hotel.aggregate({ where: { isDeleted: false }, _sum: { activeSpareLicenses: true } }),
    prisma.hotel.findMany({
      where: { isDeleted: false },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        location: true,
        contentProvider: true,
        deviceType: true,
        salesPerson: true,
        activeSpareLicenses: true,
        network: { select: { id: true, name: true } },
        updatedAt: true,
      },
    }),
  ]);

  return {
    totalHotels,
    totalNetworks,
    totalLicenses: roomCountAgg._sum.activeSpareLicenses ?? 0,
    recentUpdates,
  };
};

export const getFilterOptions = async () => {
  const [networks, locations, contentProviders, deviceTypes, salesPersons] = await Promise.all([
    prisma.hotelNetwork.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.hotel.findMany({ where: { isDeleted: false, location: { not: null } }, select: { location: true }, distinct: ['location'], orderBy: { location: 'asc' } }),
    prisma.hotel.findMany({ where: { isDeleted: false, contentProvider: { not: null } }, select: { contentProvider: true }, distinct: ['contentProvider'], orderBy: { contentProvider: 'asc' } }),
    prisma.hotel.findMany({ where: { isDeleted: false, deviceType: { not: null } }, select: { deviceType: true }, distinct: ['deviceType'], orderBy: { deviceType: 'asc' } }),
    prisma.hotel.findMany({ where: { isDeleted: false, salesPerson: { not: null } }, select: { salesPerson: true }, distinct: ['salesPerson'], orderBy: { salesPerson: 'asc' } }),
  ]);

  return {
    networks,
    locations: locations.map(h => h.location).filter(Boolean),
    contentProviders: contentProviders.map(h => h.contentProvider).filter(Boolean),
    deviceTypes: deviceTypes.map(h => h.deviceType).filter(Boolean),
    salesPersons: salesPersons.map(h => h.salesPerson).filter(Boolean),
  };
};
