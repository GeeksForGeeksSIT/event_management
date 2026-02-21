/**
 * Event Routes
 * Handles all event-related endpoints for admin management
 */
import express from 'express';
import {
  createEventHandler,
  getAllEventsHandler,
  getEventByIdHandler,
  updateEventHandler,
  publishEventHandler,
  unpublishEventHandler,
  deleteEventHandler,
  getEventRegistrationsHandler,
  getAllVenuesHandler,
  getVenueByIdHandler,
} from '../controllers/eventController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All event routes require admin authentication
router.use(authenticateAdmin);

/**
 * Event Management Routes
 */

// Create new event
router.post('/', createEventHandler);

// Get all events (with optional filters)
router.get('/', getAllEventsHandler);

// Get single event by ID
router.get('/:id', getEventByIdHandler);

// Update event
router.put('/:id', updateEventHandler);

// Delete event
router.delete('/:id', deleteEventHandler);

/**
 * Event Publishing Routes
 */

// Publish event
router.post('/:id/publish', publishEventHandler);

// Unpublish event
router.post('/:id/unpublish', unpublishEventHandler);

/**
 * Event Registration Management Routes
 */

// Get all registrations for an event
router.get('/:id/registrations', getEventRegistrationsHandler);

/**
 * Venue Management Routes
 */

// Get all venues
router.get('/venues/all', getAllVenuesHandler);

// Get venue by ID
router.get('/venues/:id', getVenueByIdHandler);

export default router;
