import * as applicationsService from '../services/applicationsService.js';
import AuthorizationError from '../exceptions/AuthorizationError.js';
import { sendSuccess } from '../utils/response.js';

export const postApplication = async (req, res) => {
  const userId = req.user.id;
  if (req.body.user_id && req.body.user_id !== userId) {
    throw new AuthorizationError('Anda hanya dapat melamar atas nama Anda sendiri');
  }

  const id = await applicationsService.addApplication(userId, req.body);
  return sendSuccess(res, { statusCode: 201, data: { id } });
};

export const getApplications = async (req, res) => {
  const applications = await applicationsService.getApplications(req.user.id);
  return sendSuccess(res, { data: { applications } });
};

export const getApplication = async (req, res) => {
  const application = await applicationsService.getApplicationById(
    req.params.id,
    req.user.id,
  );
  return sendSuccess(res, { data: application });
};

export const getApplicationsByUser = async (req, res) => {
  const applications = await applicationsService.getApplicationsByUserId(
    req.user.id,
    req.params.userId,
  );
  return sendSuccess(res, { data: { applications } });
};

export const getApplicationsByJob = async (req, res) => {
  const applications = await applicationsService.getApplicationsByJobId(
    req.user.id,
    req.params.jobId,
  );
  return sendSuccess(res, { data: { applications } });
};

export const putApplication = async (req, res) => {
  const { id } = req.params;
  await applicationsService.verifyJobOwnerOfApplication(id, req.user.id);
  await applicationsService.updateApplicationStatus(id, req.body.status);
  return sendSuccess(res, { message: 'Status application berhasil diperbarui' });
};

export const deleteApplication = async (req, res) => {
  const { id } = req.params;
  await applicationsService.verifyApplicationAccess(id, req.user.id);
  await applicationsService.deleteApplication(id);
  return sendSuccess(res, { message: 'Application berhasil dihapus' });
};
