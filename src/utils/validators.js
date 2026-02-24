/**
 * Validation utilities for Admin Onboarding
 */
import { REGEX_PATTERNS, PASSWORD_RULES, ERROR_CODES } from '../constants/errorCodes.js';
import { createValidationError } from './errors.js';

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    throw createValidationError(ERROR_CODES.MISSING_FIELD, 'Email is required');
  }

  const trimmedEmail = email.trim();
  if (!REGEX_PATTERNS.EMAIL.test(trimmedEmail)) {
    throw createValidationError(ERROR_CODES.INVALID_EMAIL, 'Invalid email format');
  }

  return trimmedEmail.toLowerCase();
};

/**
 * Validate phone number (E.164 format)
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    throw createValidationError(ERROR_CODES.MISSING_FIELD, 'Phone number is required');
  }

  const trimmedPhone = phone.trim();
  if (!REGEX_PATTERNS.PHONE.test(trimmedPhone)) {
    throw createValidationError(ERROR_CODES.INVALID_PHONE, 'Invalid phone number format. Use E.164 format (e.g., +919876543210)');
  }

  return trimmedPhone;
};

/**
 * Validate StudentID
 */
export const validateStudentID = (studentID) => {
  if (!studentID || typeof studentID !== 'string') {
    throw createValidationError(ERROR_CODES.MISSING_FIELD, 'Student ID is required');
  }

  const trimmedID = studentID.trim().toUpperCase();
  if (!REGEX_PATTERNS.STUDENT_ID.test(trimmedID)) {
    throw createValidationError(
      ERROR_CODES.INVALID_INPUT,
      `Student ID must be alphanumeric, 3-20 characters`
    );
  }

  return trimmedID;
};

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (!@#$%^&*)
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    throw createValidationError(ERROR_CODES.MISSING_FIELD, 'Password is required');
  }

  const errors = [];

  if (password.length < PASSWORD_RULES.MIN_LENGTH) {
    errors.push(`At least ${PASSWORD_RULES.MIN_LENGTH} characters`);
  }
  if (PASSWORD_RULES.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('At least one uppercase letter (A-Z)');
  }
  if (PASSWORD_RULES.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('At least one lowercase letter (a-z)');
  }
  if (PASSWORD_RULES.REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('At least one number (0-9)');
  }
  if (PASSWORD_RULES.REQUIRE_SPECIAL && !/[!@#$%^&*()_+-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('At least one special character (!@#$%^&*)');
  }

  if (errors.length > 0) {
    throw createValidationError(
      ERROR_CODES.INVALID_PASSWORD,
      'Password does not meet security requirements',
      { requirements: errors }
    );
  }

  return password;
};

/**
 * Validate graduation year
 */
export const validateGraduationYear = (year) => {
  if (year === undefined || year === null) {
    throw createValidationError(ERROR_CODES.MISSING_FIELD, 'Graduation year is required');
  }

  const numYear = parseInt(year, 10);
  if (isNaN(numYear) || numYear < 2020 || numYear > 2035) {
    throw createValidationError(
      ERROR_CODES.INVALID_GRADUATION_YEAR,
      'Graduation year must be between 2020 and 2035'
    );
  }

  return numYear;
};

/**
 * Validate invitation code format
 */
export const validateInvitationCodeFormat = (code) => {
  if (!code || typeof code !== 'string') {
    throw createValidationError(ERROR_CODES.MISSING_FIELD, 'Invitation code is required');
  }

  const trimmedCode = code.trim().toUpperCase();
  if (!REGEX_PATTERNS.INVITATION_CODE.test(trimmedCode)) {
    throw createValidationError(
      ERROR_CODES.INVALID_INPUT,
      'Invalid invitation code format'
    );
  }

  return trimmedCode;
};

/**
 * Validate full name
 */
export const validateFullName = (name) => {
  if (!name || typeof name !== 'string') {
    throw createValidationError(ERROR_CODES.MISSING_FIELD, 'Full name is required');
  }

  const trimmedName = name.trim();
  if (trimmedName.length < 3 || trimmedName.length > 100) {
    throw createValidationError(
      ERROR_CODES.INVALID_INPUT,
      'Full name must be between 3 and 100 characters'
    );
  }

  return trimmedName;
};

/**
 * Validate positive integer (for RoleID, BranchID)
 */
export const validatePositiveInteger = (value, fieldName) => {
  const num = parseInt(value, 10);
  if (isNaN(num) || num <= 0) {
    throw createValidationError(
      ERROR_CODES.INVALID_INPUT,
      `${fieldName} must be a positive integer`
    );
  }
  return num;
};
/**
 * Validate username (alphanumeric, 3-20 chars, case insensitive)
 */
export const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    throw createValidationError(ERROR_CODES.MISSING_FIELD, 'Username is required');
  }

  const trimmedUsername = username.trim().toLowerCase();
  if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
    throw createValidationError(
      ERROR_CODES.INVALID_USERNAME,
      'Username must be between 3 and 20 characters'
    );
  }

  if (!/^[a-z0-9_.-]+$/.test(trimmedUsername)) {
    throw createValidationError(
      ERROR_CODES.INVALID_USERNAME,
      'Username can only contain letters, numbers, underscores, dots, and hyphens'
    );
  }

  return trimmedUsername;
};