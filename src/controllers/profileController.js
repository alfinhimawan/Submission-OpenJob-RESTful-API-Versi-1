import * as usersService from '../services/usersService.js';
import * as applicationsService from '../services/applicationsService.js';
import * as bookmarksService from '../services/bookmarksService.js';
import { sendSuccess } from '../utils/response.js';

export const getProfile = async (req, res) => {
  const user = await usersService.getUserById(req.user.id);
  return sendSuccess(res, { data: user });
};

export const getProfileApplications = async (req, res) => {
  const applications = await applicationsService.getApplicationsByUserId(
    req.user.id,
    req.user.id,
  );
  return sendSuccess(res, { data: { applications } });
};

export const getProfileBookmarks = async (req, res) => {
  const bookmarks = await bookmarksService.getBookmarksByUserId(req.user.id);
  return sendSuccess(res, { data: { bookmarks } });
};
