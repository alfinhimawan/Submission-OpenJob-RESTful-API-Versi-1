import * as companiesService from '../services/companiesService.js';
import { sendSuccess } from '../utils/response.js';

export const postCompany = async (req, res) => {
  const id = await companiesService.addCompany(req.user.id, req.body);
  return sendSuccess(res, { statusCode: 201, data: { id } });
};

export const getCompanies = async (_req, res) => {
  const companies = await companiesService.getCompanies();
  return sendSuccess(res, { data: { companies } });
};

export const getCompany = async (req, res) => {
  const company = await companiesService.getCompanyById(req.params.id);
  return sendSuccess(res, { data: company });
};

export const putCompany = async (req, res) => {
  const { id } = req.params;
  await companiesService.verifyCompanyOwner(id, req.user.id);
  await companiesService.updateCompany(id, req.body);
  return sendSuccess(res, { message: 'Company berhasil diperbarui' });
};

export const deleteCompany = async (req, res) => {
  const { id } = req.params;
  await companiesService.verifyCompanyOwner(id, req.user.id);
  await companiesService.deleteCompany(id);
  return sendSuccess(res, { message: 'Company berhasil dihapus' });
};
