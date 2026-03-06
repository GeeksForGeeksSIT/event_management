/**
 * Payment Routes
 * Mounted at /payments in server.js
 *
 *   POST /payments/:paymentId/screenshot  → uploadScreenshotHandler (user JWT + multer)
 */
import express from 'express';
import multer from 'multer';
import { uploadScreenshotHandler } from '../controllers/registrationController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// Keep files in memory (Buffer) — we stream directly to Supabase Storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },   // 5 MB max
});

// Upload payment screenshot (user must be logged in)
router.post(
  '/:paymentId/screenshot',
  authenticateUser,
  upload.single('screenshot'),
  uploadScreenshotHandler
);

export default router;
