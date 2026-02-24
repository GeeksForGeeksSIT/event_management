/**
 * Authentication and Authorization Middleware
 * Handles JWT verification and access control
 */
import { verifyJWT } from '../utils/jwt.js';
import { createUnauthorizedError, createForbiddenError } from '../utils/errors.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Generic Authentication Middleware for Users and Admins
 * Verifies JWT token from Authorization header and extracts user/admin data
 * Expects: Authorization: Bearer <token>
 * Attaches decoded JWT data to req.auth
 */
export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createUnauthorizedError(
        ERROR_CODES.UNAUTHORIZED,
        'Missing or invalid Authorization header'
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyJWT(token);

    // Attach decoded data to request object
    // Handle both user and admin token structures
    req.auth = {
      userID: decoded.UserID || decoded.userID,
      sub: decoded.UserID || decoded.userID || decoded.adminID || decoded.AdminID,
      email: decoded.Email || decoded.email,
      roleID: decoded.RoleID || decoded.roleID || 2, // Default to user role (2) if not specified
      fullName: decoded.FullName || decoded.fullName,
      studentID: decoded.StudentID || decoded.studentID,
    };

    next();
  } catch (error) {
    if (error.statusCode) {
      next(error);
    } else {
      next(createUnauthorizedError(ERROR_CODES.UNAUTHORIZED, 'Invalid or expired token'));
    }
  }
};

/**
 * Authentication Middleware for Admins
 * Verifies JWT token from Authorization header and extracts admin data
 * Expects: Authorization: Bearer <token>
 */
export const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createUnauthorizedError(
        ERROR_CODES.UNAUTHORIZED,
        'Missing or invalid Authorization header'
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyJWT(token);

    // Attach admin data to request object
    req.user = {
      AdminID: decoded.adminID,
      Email: decoded.email,
      RoleID: decoded.roleID,
    };

    next();
  } catch (error) {
    if (error.statusCode) {
      next(error);
    } else {
      next(createUnauthorizedError(ERROR_CODES.UNAUTHORIZED, 'Invalid or expired token'));
    }
  }
};

/**
 * Authorization Middleware
 * Ensures user can only update their own profile or has admin role
 * RoleID 1 = Super Admin (can update any admin)
 * Other roles = Can only update their own profile
 */
export const authorizeUpdateAdmin = (req, res, next) => {
  try {
    const { adminId } = req.params;
    const targetAdminID = parseInt(adminId, 10);
    const currentAdminID = req.user.AdminID;
    const currentRoleID = req.user.RoleID;

    // Check if admin is authorized
    const isSuperAdmin = currentRoleID === 1;
    const isOwnProfile = currentAdminID === targetAdminID;

    if (!isSuperAdmin && !isOwnProfile) {
      throw createForbiddenError(
        ERROR_CODES.FORBIDDEN,
        'You do not have permission to update this profile'
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authentication Middleware
 * Verifies JWT token from Authorization header and extracts user data
 * Expects: Authorization: Bearer <token>
 */

export const authenticateUser = (req,res,next)=>{
    try{
        const authHeader= req.header.authorization;

        if(!authHeader || !authHeader.startsWith('Bearer ')){
            throw createUnauthorizedError(
                ERROR_CODES.UNAUTHORIZED,
                'Missing or invalid Authorization header'
        );
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const decoded = verifyJWT(token);

        req.user={
            userId: decoded.userId,
            userName: decoded.name,
            userEmail: decode.email
        }
        next();
    }
    catch{
        if (error.statusCode) {
        next(error);
        } else {
            next(createUnauthorizedError(ERROR_CODES.UNAUTHORIZED, 'Invalid or expired token'));
        }
    }
} 