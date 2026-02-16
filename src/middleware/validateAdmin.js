/**
 * Input validation middleware for Admin Onboarding endpoint
 */
import {
  validateEmail,
  validatePhone,
  validateStudentID,
  validatePassword,
  validateGraduationYear,
  validateInvitationCodeFormat,
  validateFullName,
  validatePositiveInteger,
} from '../utils/validators.js';
import { createValidationError } from '../utils/errors.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Middleware to validate admin onboarding request body
 */
export const validateAdminOnboardingInput = (req, res, next) => {
  try {
    const { studentID, fullName, email, password, phone, roleID, branchID, graduationYear, invitationCode } = req.body;

    // Validate all required fields with proper error handling
    const validated = {};

    // Validate StudentID
    validated.studentID = validateStudentID(studentID);

    // Validate Full Name
    validated.fullName = validateFullName(fullName);

    // Validate Email
    validated.email = validateEmail(email);

    // Validate Password
    validated.password = validatePassword(password);

    // Validate Phone
    validated.phone = validatePhone(phone);

    // Validate RoleID (required)
    validated.roleID = validatePositiveInteger(roleID, 'RoleID');

    // Validate GraduationYear
    validated.graduationYear = validateGraduationYear(graduationYear);

    // Validate InvitationCode
    validated.invitationCode = validateInvitationCodeFormat(invitationCode);

    // Validate BranchID (optional)
    if (branchID !== undefined && branchID !== null) {
      validated.branchID = validatePositiveInteger(branchID, 'BranchID');
    }

    // Attach validated data to request
    req.validated = validated;
    next();
  } catch (error) {
    // If it's already an APIError, pass it to error handler
    if (error.statusCode) {
      return next(error);
    }

    // Otherwise, wrap in APIError
    next(createValidationError(ERROR_CODES.INVALID_INPUT, error.message));
  }
};

/**
 * Middleware to validate sanitize and normalize request body
 */
export const sanitizeAdminInput = (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      throw createValidationError(ERROR_CODES.INVALID_INPUT, 'Request body must be a valid JSON object');
    }

    // Check for empty body
    if (Object.keys(req.body).length === 0) {
      throw createValidationError(ERROR_CODES.MISSING_FIELD, 'Request body cannot be empty');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to validate admin login request
 */
export const validateAdminLoginInput = (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email
    const validatedEmail = validateEmail(email);

    // Validate password (just check if provided, not strength)
    if (!password || typeof password !== 'string') {
      throw createValidationError(ERROR_CODES.MISSING_FIELD, 'Password is required');
    }

    if (password.length === 0) {
      throw createValidationError(ERROR_CODES.MISSING_FIELD, 'Password cannot be empty');
    }

    req.validated = {
      email: validatedEmail,
      password,
    };

    next();
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    }
    next(createValidationError(ERROR_CODES.INVALID_INPUT, error.message));
  }
};

/**
 * Middleware to validate admin update request
 */
export const validateAdminUpdateInput = (req, res, next) => {
  try {
    const { fullName, phone, password, oldPassword } = req.body;

    const validated = {};

    // Validate fullName (optional)
    if (fullName !== undefined && fullName !== null) {
      validated.fullName = validateFullName(fullName);
    }

    // Validate phone (optional)
    if (phone !== undefined && phone !== null) {
      validated.phone = validatePhone(phone);
    }

    // Validate password change (optional)
    if (password !== undefined && password !== null) {
      // If new password provided, old password is required
      if (!oldPassword) {
        throw createValidationError(
          ERROR_CODES.MISSING_FIELD,
          'Old password is required to set new password'
        );
      }

      // Validate new password strength
      validated.password = validatePassword(password);
      validated.oldPassword = oldPassword;
    }

    // At least one field must be provided
    if (Object.keys(validated).length === 0) {
      throw createValidationError(
        ERROR_CODES.INVALID_INPUT,
        'At least one field (fullName, phone, or password) must be provided'
      );
    }

    req.validated = validated;
    next();
  } catch (error) {
    if (error.statusCode) {
      return next(error);
    }
    next(createValidationError(ERROR_CODES.INVALID_INPUT, error.message));
  }
};
