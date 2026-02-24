/**
 * JWT Token Generation and Verification
 * Handles secure token creation for authenticated admin sessions
 */
import jwt from 'jsonwebtoken';
import { createServerError } from './errors.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Generate JWT token for authenticated users and admins
 * @param {Object} data - User or Admin data from database
 * @returns {string} JWT token
 */
export const generateJWT = (data) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h'; // Default 24 hours

  if (!JWT_SECRET) {
    throw createServerError(
      ERROR_CODES.INTERNAL_ERROR,
      'JWT_SECRET not configured in environment variables'
    );
  }

  // Extract IDs (handle both camelCase and PascalCase)
  const adminID = data.AdminID || data.adminID;
  const userID = data.UserID || data.userID;
  const id = adminID || userID;
  const prefix = adminID ? 'admin' : 'user';

  try {
    const token = jwt.sign(
      {
        // Payload
        adminID: adminID,
        userID: userID,
        studentID: data.StudentID || data.studentID,
        email: data.Email || data.email,
        roleID: data.RoleID || data.roleID,
        fullName: data.FullName || data.fullName,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRY,
        issuer: 'gfg-event-management',
        audience: adminID ? 'admin-api' : 'user-api',
        subject: `${prefix}-${id}`,
      }
    );

    return token;
  } catch (error) {
    throw createServerError(ERROR_CODES.INTERNAL_ERROR, 'Error generating JWT token');
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyJWT = (token) => {
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    throw createServerError(
      ERROR_CODES.INTERNAL_ERROR,
      'JWT_SECRET not configured'
    );
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'gfg-event-management',
      audience: ['admin-api', 'user-api'],
    });
    return decoded;
  } catch (error) {
    throw createServerError(ERROR_CODES.INTERNAL_ERROR, `JWT verification failed: ${error.message}`);
  }
};

/**
 * Create token response object
 * @param {string} token - JWT token
 * @param {string} type - Token type (default: Bearer)
 * @returns {Object} Token response object
 */
export const createTokenResponse = (token, type = 'Bearer') => {
  const decoded = jwt.decode(token);
  return {
    token,
    type,
    expiresAt: new Date(decoded.exp * 1000).toISOString(),
  };
};
