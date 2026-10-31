import * as usersService from '../services/usersService.js';
import { sendSuccess } from '../utils/response.js';

export const postUser = async (req, res) => {
  const id = await usersService.addUser(req.body);
  return sendSuccess(res, { statusCode: 201, data: { id } });
};

export const getUser = async (req, res) => {
  const user = await usersService.getUserById(req.params.id);
  return sendSuccess(res, { data: user });
};
