/**
 * Error Codes and Messages for Admin Onboarding API
 */
export const ERROR_CODES = {
  // Validation Errors
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_FIELD: 'MISSING_FIELD',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  INVALID_GRADUATION_YEAR: 'INVALID_GRADUATION_YEAR',
  INVALID_PHONE: 'INVALID_PHONE',

  // Authentication & Authorization Errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Database Errors
  DUPLICATE_STUDENT_ID: 'DUPLICATE_STUDENT_ID',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  INVALID_ROLE: 'INVALID_ROLE',
  INVALID_BRANCH: 'INVALID_BRANCH',

  // Invitation Code Errors
  INVALID_INVITATION_CODE: 'INVALID_INVITATION_CODE',
  INVITATION_CODE_INACTIVE: 'INVITATION_CODE_INACTIVE',
  INVITATION_CODE_EXPIRED: 'INVITATION_CODE_EXPIRED',
  INVITATION_CODE_ALREADY_USED: 'INVITATION_CODE_ALREADY_USED',

  // Event Management Errors
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  VENUE_NOT_FOUND: 'VENUE_NOT_FOUND',
  INVALID_MAX_SLOTS: 'INVALID_MAX_SLOTS',
  INVALID_TIME_RANGE: 'INVALID_TIME_RANGE',
  EVENT_HAS_REGISTRATIONS: 'EVENT_HAS_REGISTRATIONS',
  EVENT_ALREADY_PUBLISHED: 'EVENT_ALREADY_PUBLISHED',
  EVENT_NOT_PUBLISHED: 'EVENT_NOT_PUBLISHED',
  INCOMPLETE_EVENT: 'INCOMPLETE_EVENT',
  NO_UPDATE_FIELDS: 'NO_UPDATE_FIELDS',

  // Server Errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};

export const ERROR_MESSAGES = {
  [ERROR_CODES.INVALID_INPUT]: 'Invalid input provided',
  [ERROR_CODES.MISSING_FIELD]: 'Required field is missing',
  [ERROR_CODES.INVALID_EMAIL]: 'Invalid email format',
  [ERROR_CODES.INVALID_PASSWORD]: 'Password does not meet security requirements',
  [ERROR_CODES.INVALID_GRADUATION_YEAR]: 'Graduation year must be between 2020 and 2035',
  [ERROR_CODES.INVALID_PHONE]: 'Invalid phone number format',
  [ERROR_CODES.UNAUTHORIZED]: 'Unauthorized - Missing or invalid authentication',
  [ERROR_CODES.FORBIDDEN]: 'Forbidden - You do not have permission to access this resource',
  [ERROR_CODES.DUPLICATE_STUDENT_ID]: 'Student ID already exists',
  [ERROR_CODES.DUPLICATE_EMAIL]: 'Email already registered',
  [ERROR_CODES.INVALID_ROLE]: 'Invalid Role ID',
  [ERROR_CODES.INVALID_BRANCH]: 'Invalid Branch ID',
  [ERROR_CODES.INVALID_INVITATION_CODE]: 'Invitation code does not exist',
  [ERROR_CODES.INVITATION_CODE_INACTIVE]: 'Invitation code is inactive',
  [ERROR_CODES.INVITATION_CODE_EXPIRED]: 'Invitation code has expired',
  [ERROR_CODES.INVITATION_CODE_ALREADY_USED]: 'Invitation code has already been used',
  [ERROR_CODES.EVENT_NOT_FOUND]: 'Event not found',
  [ERROR_CODES.VENUE_NOT_FOUND]: 'Venue not found',
  [ERROR_CODES.INVALID_MAX_SLOTS]: 'Max slots exceed venue capacity',
  [ERROR_CODES.INVALID_TIME_RANGE]: 'Invalid time range for event',
  [ERROR_CODES.EVENT_HAS_REGISTRATIONS]: 'Event has existing registrations',
  [ERROR_CODES.EVENT_ALREADY_PUBLISHED]: 'Event is already published',
  [ERROR_CODES.EVENT_NOT_PUBLISHED]: 'Event is not published',
  [ERROR_CODES.INCOMPLETE_EVENT]: 'Event details are incomplete',
  [ERROR_CODES.NO_UPDATE_FIELDS]: 'No valid fields provided for update',
  [ERROR_CODES.DATABASE_ERROR]: 'Database error occurred',
  [ERROR_CODES.TRANSACTION_FAILED]: 'Transaction could not be completed',
  [ERROR_CODES.INTERNAL_ERROR]: 'Internal server error',
};

// Password validation rules
export const PASSWORD_RULES = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL: true,
};

// Regex patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/, // E.164 format
  STUDENT_ID: /^[A-Za-z0-9]{3,20}$/, // Alphanumeric, 3-20 chars
  INVITATION_CODE: /^[A-Z0-9]{8,20}$/, // Alphanumeric uppercase, 8-20 chars
};
