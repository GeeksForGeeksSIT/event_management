/**
 * JWT Token Generation and Verification
 * Handles secure token creation for authenticated admin sessions
 */
import jwt from 'jsonwebtoken';
import { createServerError } from './errors.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Generate JWT token for admin after successful onboarding
 * @param {Object} adminData - Admin data from database
 * @returns {string} JWT token
 */
export const generateJWT = (adminData) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h'; // Default 24 hours

  if (!JWT_SECRET) {
    throw createServerError(
      ERROR_CODES.INTERNAL_ERROR,
      'JWT_SECRET not configured in environment variables'
    );
  }

  try {
    const token = jwt.sign(
      {
        // Payload
        adminID: adminData.AdminID,
        studentID: adminData.StudentID,
        email: adminData.Email,
        roleID: adminData.RoleID,
        fullName: adminData.FullName,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRY,
        issuer: 'gfg-event-management',
        audience: 'admin-api',
        subject: `admin-${adminData.AdminID}`,
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
      audience: 'admin-api',
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
