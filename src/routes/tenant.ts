import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';
import { TenantController } from '../controller/TenantController';
import { TenantService } from '../services/TenantService';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenant';
import logger from '../config/logger';
import authenticate from '../middleware/authenticate';
import { canAccess } from '../middleware/canAccess';
import { Roles } from '../constants';
import tenantValidator from '../validators/tenant-validator';
import { CreateTenantRequest } from '../types';
import listUsersValidator from '../validators/list-users-validator';

const router = express.Router();

const tenantRepository = AppDataSource.getRepository(Tenant);
const tenantService = new TenantService(tenantRepository);
const tenantController = new TenantController(tenantService, logger);

router.post(
  '/',
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  tenantValidator,
  (req: CreateTenantRequest, res: Response, next: NextFunction) =>
    tenantController.create(req, res, next) as Promise<void>,
);

router.patch(
  '/:id',
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  tenantValidator,
  (req: CreateTenantRequest, res: Response, next: NextFunction) =>
    tenantController.update(req, res, next) as Promise<void>,
);
router.get(
  '/',
  listUsersValidator,
  (req: Request, res: Response, next: NextFunction) =>
    tenantController.getAll(req, res, next),
);
router.get(
  '/:id',
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req, res, next) => tenantController.getOne(req, res, next),
);
router.delete(
  '/:id',
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req, res, next) => tenantController.destroy(req, res, next),
);

export default router;
