/**
 * Admin Routes
 * Handles all admin-related endpoints
 */
import express from 'express';
import { onboardAdminHandler, loginAdminHandler, updateAdminHandler } from '../controllers/adminController.js';
import { sanitizeAdminInput, validateAdminOnboardingInput, validateAdminLoginInput, validateAdminUpdateInput } from '../middleware/validateAdmin.js';
import { authenticateAdmin, authorizeUpdateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /admin/onboard
 * Admin Onboarding with Invitation Code
 *
 * Request Body:
 * {
 *   "studentID": "CS2024001",
 *   "fullName": "John Doe",
 *   "email": "john@example.com",
 *   "password": "SecurePass@123",
 *   "phone": "+919876543210",
 *   "roleID": 1,
 *   "branchID": 1,
 *   "graduationYear": 2026,
 *   "invitationCode": "INVITE2024ABC"
 * }
 */
router.post('/onboard', sanitizeAdminInput, validateAdminOnboardingInput, onboardAdminHandler);

/**
 * POST /admin/login
 * Admin Login with Email and Password
 *
 * Request Body:
 * {
 *   "email": "john@example.com",
 *   "password": "SecurePass@123"
 * }
 */
router.post('/login', sanitizeAdminInput, validateAdminLoginInput, loginAdminHandler);

/**
 * PUT /admin/:adminId
 * Update Admin Details
 * Requires: Authentication (JWT token in Authorization header)
 * Authorization: Can update own profile or super admin can update any admin
 *
 * Request Header:
 * {
 *   "Authorization": "Bearer <jwt_token>"
 * }
 *
 * Request Body (all optional):
 * {
 *   "fullName": "Updated Name",
 *   "phone": "+919876543210",
 *   "password": "NewPassword@123",
 *   "oldPassword": "CurrentPassword@123"
 * }
 */
router.put('/:adminId', sanitizeAdminInput, authenticateAdmin, authorizeUpdateAdmin, validateAdminUpdateInput, updateAdminHandler);

export default router;
