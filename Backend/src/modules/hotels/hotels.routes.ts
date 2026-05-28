import { Router } from 'express';
import * as hotelsController from './hotels.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validation.middleware';
import { createHotelSchema, updateHotelSchema, hotelQuerySchema, hotelIdSchema } from './hotels.dto';

const router = Router();

router.use(authenticate);

router.get('/filters', hotelsController.getFilterOptions);
router.get('/dashboard', hotelsController.getDashboardStats);
router.get('/', validate(hotelQuerySchema), hotelsController.getHotels);
router.get('/:id', validate(hotelIdSchema), hotelsController.getHotelById);

router.post('/', requireAdmin, validate(createHotelSchema), hotelsController.createHotel);
router.put('/:id', requireAdmin, validate(updateHotelSchema), hotelsController.updateHotel);
router.delete('/:id', requireAdmin, validate(hotelIdSchema), hotelsController.deleteHotel);

export default router;
