import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import validate from '../middlewares/validate.js';
import { userPayloadSchema } from '../validators/users.js';
import { idParamSchema } from '../validators/common.js';
import * as controller from '../controllers/usersController.js';

const router = Router();

router.post('/', validate(userPayloadSchema), asyncHandler(controller.postUser));
router.get('/:id', validate(idParamSchema, 'params'), asyncHandler(controller.getUser));

export default router;
