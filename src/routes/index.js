import { Router } from 'express';
import usersRoutes from './users.js';
import authenticationsRoutes from './authentications.js';
import companiesRoutes from './companies.js';
import categoriesRoutes from './categories.js';
import jobsRoutes from './jobs.js';
import applicationsRoutes from './applications.js';
import bookmarksRoutes from './bookmarks.js';
import profileRoutes from './profile.js';

const router = Router();

router.use('/users', usersRoutes);
router.use('/authentications', authenticationsRoutes);
router.use('/companies', companiesRoutes);
router.use('/categories', categoriesRoutes);
router.use('/jobs', jobsRoutes);
router.use('/applications', applicationsRoutes);
router.use('/profile', profileRoutes);
router.use('/', bookmarksRoutes);

export default router;
