import { Request, Response, NextFunction } from 'express';
import * as hotelsService from './hotels.service';
import { sendSuccess } from '../../utils/response.util';

export const getHotels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await hotelsService.getHotels(req.query as any);
    sendSuccess(res, result);
  } catch (error) { next(error); }
};

export const getHotelById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const hotel = await hotelsService.getHotelById(req.params.id);
    sendSuccess(res, hotel);
  } catch (error) { next(error); }
};

export const createHotel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const hotel = await hotelsService.createHotel(req.body, req.user?.id);
    sendSuccess(res, hotel, 'מלון נוסף בהצלחה', 201);
  } catch (error) { next(error); }
};

export const updateHotel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const hotel = await hotelsService.updateHotel(req.params.id, req.body, req.user?.id);
    sendSuccess(res, hotel, 'מלון עודכן בהצלחה');
  } catch (error) { next(error); }
};

export const deleteHotel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await hotelsService.deleteHotel(req.params.id, req.user?.id);
    sendSuccess(res, null, 'מלון נמחק בהצלחה');
  } catch (error) { next(error); }
};

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await hotelsService.getDashboardStats();
    sendSuccess(res, stats);
  } catch (error) { next(error); }
};

export const getFilterOptions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const options = await hotelsService.getFilterOptions();
    sendSuccess(res, options);
  } catch (error) { next(error); }
};
