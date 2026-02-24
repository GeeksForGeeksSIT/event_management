/**
 * Parameter Validation Middleware
 * Validates URL parameters for API endpoints
 */
import { createValidationError } from '../utils/errors.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Validate userId parameter
 */
export const validateUserIdParam = (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: {
        code: ERROR_CODES.INVALID_INPUT,
        message: 'User ID is required',
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Basic validation - ensure userId is a positive integer
  const userIdNum = parseInt(userId, 10);
  if (isNaN(userIdNum) || userIdNum <= 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: ERROR_CODES.INVALID_INPUT,
        message: 'User ID must be a positive integer',
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Attach validated data to request
  req.validated = req.validated || {};
  req.validated.userId = userIdNum;
  next();
};
