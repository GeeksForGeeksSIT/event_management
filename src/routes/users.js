/**
 * User Routes
 * Defines API endpoints for user registration, login, and profile management
 */
import express from 'express';
import {
  registerUserHandler,
  loginUserHandler,
  getUserProfileHandler,
  updateUserProfileHandler,
} from '../controllers/userController.js';
import {
  sanitizeUserInput,
  validateUserRegistrationInput,
  validateUserLoginInput,
  validateUserUpdateInput,
} from '../middleware/validateUser.js';
import { validateUserIdParam } from '../middleware/validateParams.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /users/register
 * Public endpoint - User registration
 */
router.post('/register', sanitizeUserInput, validateUserRegistrationInput, registerUserHandler);

/**
 * POST /users/login
 * Public endpoint - User login
 */
router.post('/login', sanitizeUserInput, validateUserLoginInput, loginUserHandler);

/**
 * GET /users/:userId
 * Protected endpoint - Get user profile
 */
router.get('/:userId', validateUserIdParam, authenticateToken, getUserProfileHandler);

/**
 * PUT /users/:userId
 * Protected endpoint - Update user profile
 */
router.put(
  '/:userId',
  validateUserIdParam,
  authenticateToken,
  sanitizeUserInput,
  validateUserUpdateInput,
  updateUserProfileHandler
);

export default router;
