import { Response } from 'express';
import { IApiResponse, IApiError } from '../../../Shared/interfaces/api/api.interface';

export const sendSuccess = <T>(res: Response, data: T, message?: string, status = 200): void => {
  const body: IApiResponse<T> = { success: true, data, message };
  res.status(status).json(body);
};

export const sendError = (res: Response, message: string, status = 500, errors?: Record<string, string[]>): void => {
  const body: IApiError = { success: false, message, statusCode: status, errors };
  res.status(status).json(body);
};
