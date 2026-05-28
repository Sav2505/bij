import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authenticate } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/role.middleware';
import { parseAndImportExcel } from './import.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { prisma } from '../../config/database';

const router = Router();
router.use(authenticate, requireAdmin);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('יש להעלות קובץ Excel בלבד (.xlsx)'));
    }
  },
});

router.post('/', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      sendError(res, 'לא נבחר קובץ', 400);
      return;
    }
    const result = await parseAndImportExcel(req.file.buffer, req.user!.id);
    sendSuccess(res, result, `יובאו ${result.successRows} מלונות בהצלחה`);
  } catch (error) { next(error); }
});

router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await prisma.importHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { user: { select: { username: true } } },
    });
    sendSuccess(res, history);
  } catch (error) { next(error); }
});

export default router;
