/**
 * Global Error Handling Middleware
 * Catches and formats all application errors consistently
 */
import { APIError } from '../utils/errors.js';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants/errorCodes.js';

/**
 * Global error handler middleware
 * Must be registered AFTER all other middleware and routes
 */
export const globalErrorHandler = (err, req, res, next) => {
  console.error('[ERROR]', {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // If it's an APIError, use its response format
  if (err instanceof APIError) {
    return res.status(err.statusCode).json(err.toResponse());
  }

  // Handle specific error types
  if (err.code === '23505') {
    // PostgreSQL unique constraint violation
    const errorResponse = new APIError(
      409,
      ERROR_CODES.DATABASE_ERROR,
      'Resource already exists (duplicate entry)',
      { postgresCode: err.code }
    );
    return res.status(409).json(errorResponse.toResponse());
  }

  if (err.code === '23503') {
    // PostgreSQL foreign key constraint violation
    const errorResponse = new APIError(
      400,
      ERROR_CODES.DATABASE_ERROR,
      'Invalid reference to related resource',
      { postgresCode: err.code }
    );
    return res.status(400).json(errorResponse.toResponse());
  }

  // Handle JSON parse errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    const errorResponse = new APIError(
      400,
      ERROR_CODES.INVALID_INPUT,
      'Invalid JSON in request body'
    );
    return res.status(400).json(errorResponse.toResponse());
  }

  // Generic server error
  const errorResponse = new APIError(
    500,
    ERROR_CODES.INTERNAL_ERROR,
    'Internal server error',
    process.env.NODE_ENV === 'development' ? { originalError: err.message } : undefined
  );

  res.status(500).json(errorResponse.toResponse());
};

/**
 * 404 Not Found middleware
 * Should be registered AFTER all routes
 */
export const notFoundHandler = (req, res) => {
  const errorResponse = new APIError(
    404,
    'NOT_FOUND',
    `Route not found: ${req.method} ${req.path}`
  );
  res.status(404).json(errorResponse.toResponse());
};
