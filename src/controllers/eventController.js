/**
 * Event Controller
 * Handles HTTP requests for event management endpoints
 */
import {
  createEvent,
  getAllEvents,
  updateEvent,
  publishEvent,
  unpublishEvent,
  deleteEvent,
  getEventRegistrations,
  getAllVenues,
  getVenueById,
  uploadEventQRCode,
} from '../services/eventService.js';

/**
 * POST /events
 * Create a new event
 * 
 * Request Body:
 * {
 *   "eventName": "Tech Conference 2026",
 *   "description": "Annual technology conference",
 *   "startTime": "2026-03-15T09:00:00",
 *   "endTime": "2026-03-15T17:00:00",
 *   "maxSlots": 200,
 *   "registrationFee": 50.00,
 *   "venueID": 1,
 *   "status": "draft"
 * }
 */
export const createEventHandler = async (req, res, next) => {
  try {
    const event = await createEvent(req.body);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /events
 * Get all events with optional filters
 * 
 * Query Parameters:
 * - status: Filter by event status (draft, active, completed, cancelled)
 * - isPublished: Filter by published status (true/false)
 * - venueID: Filter by venue ID
 */
export const getAllEventsHandler = async (req, res, next) => {
  try {
    const { status, isPublished, venueID } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (isPublished !== undefined) filters.isPublished = isPublished === 'true';
    if (venueID) filters.venueID = parseInt(venueID);

    const events = await getAllEvents(filters);

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /events/:id
 * Update event details
 * 
 * Request Body: (all fields optional)
 * {
 *   "eventName": "Updated Tech Conference",
 *   "description": "Updated description",
 *   "startTime": "2026-03-20T09:00:00",
 *   "endTime": "2026-03-20T17:00:00",
 *   "maxSlots": 250,
 *   "registrationFee": 60.00,
 *   "venueID": 2,
 *   "status": "active"
 * }
 */
export const updateEventHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await updateEvent(parseInt(id), req.body);

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /events/:id/publish
 * Publish an event (make it visible to users)
 */
export const publishEventHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await publishEvent(parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Event published successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /events/:id/unpublish
 * Unpublish an event (hide from users)
 */
export const unpublishEventHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await unpublishEvent(parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Event unpublished successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /events/:id
 * Delete an event (only if no confirmed registrations)
 */
export const deleteEventHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteEvent(parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /events/:id/registrations
 * Get all registrations for a specific event
 */
export const getEventRegistrationsHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const registrations = await getEventRegistrations(parseInt(id));

    res.status(200).json({
      success: true,
      count: registrations.length,
      data: registrations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /venues
 * Get all venues
 */
export const getAllVenuesHandler = async (req, res, next) => {
  try {
    const venues = await getAllVenues();

    res.status(200).json({
      success: true,
      count: venues.length,
      data: venues,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /venues/:id
 * Get venue by ID
 */
export const getVenueByIdHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const venue = await getVenueById(parseInt(id));

    res.status(200).json({
      success: true,
      data: venue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /events/:id/upload-qrcode
 * Upload QR code for an event
 */
export const uploadEventQRCodeHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FILE',
          message: 'QR code image file is required',
        },
      });
    }

    // Validate file type (image only)
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: 'Only PNG, JPEG, or WebP images are allowed',
        },
      });
    }

    const event = await uploadEventQRCode(
      parseInt(id),
      req.file.buffer,
      req.file.mimetype
    );

    res.status(200).json({
      success: true,
      message: 'QR code uploaded successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};
