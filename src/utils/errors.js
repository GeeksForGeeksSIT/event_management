/**
 * Custom API Error Class for consistent error handling
 */
export class APIError extends Error {
  constructor(statusCode, errorCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toResponse() {
    return {
      success: false,
      error: {
        code: this.errorCode,
        message: this.message,
        details: this.details,
        timestamp: this.timestamp,
      },
    };
  }
}

// Helper functions for common error responses
export const createValidationError = (errorCode, message, details = null) => {
  return new APIError(400, errorCode, message, details);
};

export const createUnauthorizedError = (errorCode, message) => {
  return new APIError(401, errorCode, message);
};

export const createForbiddenError = (errorCode, message) => {
  return new APIError(403, errorCode, message);
};

export const createNotFoundError = (errorCode, message) => {
  return new APIError(404, errorCode, message);
};

export const createConflictError = (errorCode, message) => {
  return new APIError(409, errorCode, message);
};

export const createServerError = (errorCode = 'INTERNAL_ERROR', message = 'Internal server error') => {
  return new APIError(500, errorCode, message);
};
