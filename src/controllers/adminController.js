/**
 * Admin Onboarding Controller
 * Handles HTTP requests for admin registration endpoint
 */
import { onboardAdmin, loginAdmin, updateAdmin } from '../services/adminOnboardingService.js';
import { generateJWT, createTokenResponse } from '../utils/jwt.js';
import { createValidationError } from '../utils/errors.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * POST /admin/onboard
 * Creates a new admin account with invitation code validation
 *
 * Success Response (201):
 * {
 *   "success": true,
 *   "message": "Admin onboarded successfully",
 *   "data": {
 *     "admin": { ...admin details... },
 *     "token": { ...jwt token... }
 *   }
 * }
 */
export const onboardAdminHandler = async (req, res, next) => {
  try {
    // Get validated data from middleware
    const validatedData = req.validated;

    // Execute onboarding service
    const admin = await onboardAdmin(validatedData);

    // Generate JWT token
    const jwtToken = generateJWT(admin);
    const tokenResponse = createTokenResponse(jwtToken);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Admin onboarded successfully',
      data: {
        admin: {
          adminID: admin.AdminID,
          studentID: admin.StudentID,
          fullName: admin.FullName,
          email: admin.Email,
          phone: admin.Phone,
          roleID: admin.RoleID,
          branchID: admin.BranchID,
          graduationYear: admin.GraduationYear,
          currentYear: admin.CurrentYear,
          createdAt: admin.CreatedAt,
        },
        token: tokenResponse,
      },
    });
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
};

/**
 * POST /admin/login
 * Authenticates admin with email and password
 *
 * Success Response (200):
 * {
 *   "success": true,
 *   "message": "Login successful",
 *   "data": {
 *     "admin": { ...admin details... },
 *     "token": { ...jwt token... }
 *   }
 * }
 */
export const loginAdminHandler = async (req, res, next) => {
  try {
    const validatedData = req.validated;

    // Execute login service
    const admin = await loginAdmin(validatedData.email, validatedData.password);

    // Generate JWT token
    const jwtToken = generateJWT(admin);
    const tokenResponse = createTokenResponse(jwtToken);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        admin: {
          adminID: admin.AdminID,
          studentID: admin.StudentID,
          fullName: admin.FullName,
          email: admin.Email,
          phone: admin.Phone,
          roleID: admin.RoleID,
          branchID: admin.BranchID,
          graduationYear: admin.GraduationYear,
          currentYear: admin.CurrentYear,
          createdAt: admin.CreatedAt,
        },
        token: tokenResponse,
      },
    });
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
};

/**
 * PUT /admin/:adminId
 * Updates admin details (fullName, phone, password)
 *
 * Success Response (200):
 * {
 *   "success": true,
 *   "message": "Admin details updated successfully",
 *   "data": {
 *     "admin": { ...updated admin details... }
 *   }
 * }
 */
export const updateAdminHandler = async (req, res, next) => {
  try {
    const { adminId } = req.params;
    const validatedData = req.validated;

    // Validate adminId is a number
    const id = parseInt(adminId, 10);
    if (isNaN(id) || id <= 0) {
      return next(createValidationError(ERROR_CODES.INVALID_INPUT, 'Invalid admin ID'));
    }

    // Execute update service
    const admin = await updateAdmin(id, validatedData);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Admin details updated successfully',
      data: {
        admin: {
          adminID: admin.AdminID,
          studentID: admin.StudentID,
          fullName: admin.FullName,
          email: admin.Email,
          phone: admin.Phone,
          roleID: admin.RoleID,
          branchID: admin.BranchID,
          graduationYear: admin.GraduationYear,
          currentYear: admin.CurrentYear,
          createdAt: admin.CreatedAt,
          updatedAt: admin.UpdatedAt,
        },
      },
    });
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
};
