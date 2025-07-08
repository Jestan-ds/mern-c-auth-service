import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';
import authenticate from '../middleware/authenticate';
import { canAccess } from '../middleware/canAccess';
import { Roles } from '../constants';
import tenantValidator from '../validators/tenant-validator';
import { CreateUserRequest, UpdateUserRequest } from '../types';
import { UserController } from '../controller/UserController';
import { UserService } from '../services/UserService';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import logger from '../config/logger';
import updateUserValidator from '../validators/update-user-validator';
import listUsersValidator from '../validators/list-users-validator';

const router = express.Router();
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService, logger);

router.post(
  '/',
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  tenantValidator,
  (req: CreateUserRequest, res: Response, next: NextFunction) =>
    userController.create(req, res, next),
);

router.patch(
  '/:id',
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  updateUserValidator,
  (req: UpdateUserRequest, res: Response, next: NextFunction) =>
    userController.update(req, res, next),
);

router.get(
  '/',
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  listUsersValidator,
  (req: Request, res: Response, next: NextFunction) =>
    userController.getAll(req, res, next),
);

router.get(
  '/:id',
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req, res, next) => userController.getOne(req, res, next),
);

router.delete(
  '/:id',
  authenticate as RequestHandler,
  canAccess([Roles.ADMIN]),
  (req, res, next) => userController.destroy(req, res, next),
);

export default router;
