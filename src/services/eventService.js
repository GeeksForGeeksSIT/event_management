/**
 * Event Service Layer
 * Handles business logic for event management operations
 */
import pool from '../db.js';
import {
  createConflictError,
  createNotFoundError,
  createValidationError,
  createServerError,
} from '../utils/errors.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Create a new event
 * @param {Object} eventData - Event details
 * @returns {Promise<Object>} Created event
 */
export const createEvent = async (eventData) => {
  const {
    eventName,
    description,
    startTime,
    endTime,
    maxSlots,
    registrationFee,
    venueID,
    status = 'Draft',
  } = eventData;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Validate venue exists and has sufficient capacity
    const venueQuery = `SELECT "VenueID", "VenueName", "Capacity" FROM "Venue" WHERE "VenueID" = $1`;
    const venueResult = await client.query(venueQuery, [venueID]);

    if (venueResult.rows.length === 0) {
      throw createNotFoundError(
        ERROR_CODES.VENUE_NOT_FOUND,
        'Venue does not exist'
      );
    }

    const venue = venueResult.rows[0];

    if (maxSlots > venue.Capacity) {
      throw createValidationError(
        ERROR_CODES.INVALID_MAX_SLOTS,
        `Max slots (${maxSlots}) cannot exceed venue capacity (${venue.Capacity})`
      );
    }

    // Validate time range
    if (new Date(startTime) >= new Date(endTime)) {
      throw createValidationError(
        ERROR_CODES.INVALID_TIME_RANGE,
        'End time must be after start time'
      );
    }

    // Create event
    const insertQuery = `
      INSERT INTO "Event" (
        "EventName", "Description", "StartTime", "EndTime", 
        "MaxSlots", "Status", "RegistrationFee", "IsPublished", 
        "VenueID", "CreatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, false, $8, NOW())
      RETURNING *
    `;

    const insertResult = await client.query(insertQuery, [
      eventName,
      description,
      startTime,
      endTime,
      maxSlots,
      status,
      registrationFee || 0,
      venueID,
    ]);

    await client.query('COMMIT');

    return insertResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    
    // Log actual error details for debugging
    console.error('=== CREATE EVENT ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
    console.error('Error hint:', error.hint);
    console.error('Full error:', error);
    console.error('========================');
    
    if (error.statusCode) {
      throw error;
    }
    throw createServerError(ERROR_CODES.DATABASE_ERROR, `Failed to create event: ${error.message}`);
  } finally {
    client.release();
  }
};

/**
 * Get all events with optional filters
 * @param {Object} filters - Filter options (status, isPublished, venueID)
 * @returns {Promise<Array>} List of events
 */
export const getAllEvents = async (filters = {}) => {
  try {
    let query = `
      SELECT 
        e.*,
        v."VenueName",
        v."Location",
        v."Capacity",
        COUNT(DISTINCT r."RegID") FILTER (WHERE r."RegStatus" = 'confirmed') as "CurrentRegistrations"
      FROM "Event" e
      LEFT JOIN "Venue" v ON e."VenueID" = v."VenueID"
      LEFT JOIN "Registration" r ON e."EventID" = r."EventID"
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND e."Status" = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.isPublished !== undefined) {
      query += ` AND e."IsPublished" = $${paramCount}`;
      params.push(filters.isPublished);
      paramCount++;
    }

    if (filters.venueID) {
      query += ` AND e."VenueID" = $${paramCount}`;
      params.push(filters.venueID);
      paramCount++;
    }

    query += ` GROUP BY e."EventID", v."VenueID" ORDER BY e."StartTime" DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    throw createServerError(ERROR_CODES.DATABASE_ERROR, 'Failed to fetch events');
  }
};

/**
 * Get event by ID with details
 * @param {number} eventID - Event ID
 * @returns {Promise<Object>} Event details
 */
export const getEventById = async (eventID) => {
  try {
    const query = `
      SELECT 
        e.*,
        v."VenueName",
        v."Location",
        v."Capacity",
        COUNT(DISTINCT r."RegID") FILTER (WHERE r."RegStatus" = 'confirmed') as "CurrentRegistrations"
      FROM "Event" e
      LEFT JOIN "Venue" v ON e."VenueID" = v."VenueID"
      LEFT JOIN "Registration" r ON e."EventID" = r."EventID"
      WHERE e."EventID" = $1
      GROUP BY e."EventID", v."VenueID"
    `;

    const result = await pool.query(query, [eventID]);

    if (result.rows.length === 0) {
      throw createNotFoundError(
        ERROR_CODES.EVENT_NOT_FOUND,
        'Event not found'
      );
    }

    return result.rows[0];
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    throw createServerError(ERROR_CODES.DATABASE_ERROR, 'Failed to fetch event');
  }
};

/**
 * Update event details
 * @param {number} eventID - Event ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} Updated event
 */
export const updateEvent = async (eventID, updateData) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if event exists
    const eventCheck = await client.query(
      `SELECT "EventID", "IsPublished", "VenueID" FROM "Event" WHERE "EventID" = $1`,
      [eventID]
    );

    if (eventCheck.rows.length === 0) {
      throw createNotFoundError(
        ERROR_CODES.EVENT_NOT_FOUND,
        'Event not found'
      );
    }

    const event = eventCheck.rows[0];

    // Check if event is published and has registrations
    if (event.IsPublished) {
      const regCheck = await client.query(
        `SELECT COUNT(*) as count FROM "Registration" WHERE "EventID" = $1 AND "RegStatus" = 'confirmed'`,
        [eventID]
      );

      if (parseInt(regCheck.rows[0].count) > 0) {
        throw createValidationError(
          ERROR_CODES.EVENT_HAS_REGISTRATIONS,
          'Cannot update published event with existing registrations'
        );
      }
    }

    // Validate venue if being updated
    if (updateData.venueID && updateData.venueID !== event.VenueID) {
      const venueCheck = await client.query(
        `SELECT "Capacity" FROM "Venue" WHERE "VenueID" = $1`,
        [updateData.venueID]
      );

      if (venueCheck.rows.length === 0) {
        throw createNotFoundError(
          ERROR_CODES.VENUE_NOT_FOUND,
          'Venue does not exist'
        );
      }

      if (updateData.maxSlots && updateData.maxSlots > venueCheck.rows[0].Capacity) {
        throw createValidationError(
          ERROR_CODES.INVALID_MAX_SLOTS,
          `Max slots cannot exceed venue capacity (${venueCheck.rows[0].Capacity})`
        );
      }
    }

    // Validate time range if being updated
    if (updateData.startTime && updateData.endTime) {
      if (new Date(updateData.startTime) >= new Date(updateData.endTime)) {
        throw createValidationError(
          ERROR_CODES.INVALID_TIME_RANGE,
          'End time must be after start time'
        );
      }
    }

    // Build dynamic update query
    const allowedFields = [
      'EventName', 'Description', 'StartTime', 'EndTime',
      'MaxSlots', 'RegistrationFee', 'VenueID', 'Status'
    ];

    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updateData)) {
      const dbField = key.charAt(0).toUpperCase() + key.slice(1);
      if (allowedFields.includes(dbField)) {
        updateFields.push(`"${dbField}" = $${paramCount}`);
        updateValues.push(value);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      throw createValidationError(
        ERROR_CODES.NO_UPDATE_FIELDS,
        'No valid fields to update'
      );
    }

    updateValues.push(eventID);
    const updateQuery = `
      UPDATE "Event" 
      SET ${updateFields.join(', ')} 
      WHERE "EventID" = $${paramCount}
      RETURNING *
    `;

    const result = await client.query(updateQuery, updateValues);

    await client.query('COMMIT');

    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.statusCode) {
      throw error;
    }
    throw createServerError(ERROR_CODES.DATABASE_ERROR, 'Failed to update event');
  } finally {
    client.release();
  }
};

/**
 * Publish an event
 * @param {number} eventID - Event ID
 * @returns {Promise<Object>} Published event
 */
export const publishEvent = async (eventID) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get event details using the same client
    const eventQuery = `
      SELECT * FROM "Event" WHERE "EventID" = $1
    `;
    const eventResult = await client.query(eventQuery, [eventID]);

    console.log('Event lookup for publish:', eventResult.rows); // Debug

    if (eventResult.rows.length === 0) {
      throw createNotFoundError(
        ERROR_CODES.EVENT_NOT_FOUND,
        'Event not found'
      );
    }

    const event = eventResult.rows[0];

    if (event.IsPublished) {
      throw createConflictError(
        ERROR_CODES.EVENT_ALREADY_PUBLISHED,
        'Event is already published'
      );
    }

    // Validate event is complete
    if (!event.VenueID || !event.StartTime || !event.EndTime) {
      throw createValidationError(
        ERROR_CODES.INCOMPLETE_EVENT,
        'Event must have venue, start time, and end time to be published'
      );
    }

    console.log('Publishing event ID:', eventID); // Debug

    // Update event to published (only change IsPublished, keep current Status)
    const updateQuery = `
      UPDATE "Event" 
      SET "IsPublished" = true
      WHERE "EventID" = $1
      RETURNING *
    `;

    const result = await client.query(updateQuery, [eventID]);

    console.log('Publish result:', result.rows); // Debug

    await client.query('COMMIT');

    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    
    // Enhanced error logging
    console.error('=== PUBLISH EVENT ERROR ===');
    console.error('Event ID:', eventID);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
    console.error('SQL State:', error.sqlState);
    console.error('Full error:', error);
    console.error('==========================');
    
    if (error.statusCode) {
      throw error;
    }
    throw createServerError(ERROR_CODES.DATABASE_ERROR, `Failed to publish event: ${error.message}`);
  } finally {
    client.release();
  }
};

/**
 * Unpublish an event
 * @param {number} eventID - Event ID
 * @returns {Promise<Object>} Unpublished event
 */
export const unpublishEvent = async (eventID) => {
  try {
    // Check if event exists
    const event = await getEventById(eventID);

    if (!event.IsPublished) {
      throw createConflictError(
        ERROR_CODES.EVENT_NOT_PUBLISHED,
        'Event is not published'
      );
    }

    // Update event to unpublished
    const updateQuery = `
      UPDATE "Event" 
      SET "IsPublished" = false
      WHERE "EventID" = $1
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [eventID]);

    return result.rows[0];
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    throw createServerError(ERROR_CODES.DATABASE_ERROR, 'Failed to unpublish event');
  }
};

/**
 * Delete an event
 * @param {number} eventID - Event ID
 * @returns {Promise<boolean>}
 */
export const deleteEvent = async (eventID) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if event exists
    const eventCheck = await client.query(
      `SELECT "EventID" FROM "Event" WHERE "EventID" = $1`,
      [eventID]
    );

    if (eventCheck.rows.length === 0) {
      throw createNotFoundError(
        ERROR_CODES.EVENT_NOT_FOUND,
        'Event not found'
      );
    }

    // Check for confirmed registrations
    const regCheck = await client.query(
      `SELECT COUNT(*) as count FROM "Registration" WHERE "EventID" = $1 AND "RegStatus" = 'confirmed'`,
      [eventID]
    );

    if (parseInt(regCheck.rows[0].count) > 0) {
      throw createConflictError(
        ERROR_CODES.EVENT_HAS_REGISTRATIONS,
        'Cannot delete event with confirmed registrations'
      );
    }

    // Delete event
    const deleteQuery = `DELETE FROM "Event" WHERE "EventID" = $1`;
    await client.query(deleteQuery, [eventID]);

    await client.query('COMMIT');

    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.statusCode) {
      throw error;
    }
    throw createServerError(ERROR_CODES.DATABASE_ERROR, 'Failed to delete event');
  } finally {
    client.release();
  }
};

/**
 * Get all registrations for an event
 * @param {number} eventID - Event ID
 * @returns {Promise<Array>} List of registrations
 */
export const getEventRegistrations = async (eventID) => {
  try {
    // Check if event exists
    await getEventById(eventID);

    const query = `
      SELECT 
        r.*,
        u."FullName",
        u."Email",
        u."StudentID",
        u."Phone",
        p."PaymentStatus",
        p."Amount",
        p."TransactionRef",
        p."PaymentMode"
      FROM "Registration" r
      INNER JOIN "User" u ON r."UserID" = u."UserID"
      LEFT JOIN "Payment" p ON r."RegID" = p."RegID"
      WHERE r."EventID" = $1
      ORDER BY r."RegDate" DESC
    `;

    const result = await pool.query(query, [eventID]);
    return result.rows;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    throw createServerError(ERROR_CODES.DATABASE_ERROR, 'Failed to fetch registrations');
  }
};

/**
 * Get all venues
 * @returns {Promise<Array>} List of venues
 */
export const getAllVenues = async () => {
  try {
    const query = `SELECT * FROM "Venue" ORDER BY "VenueName"`;
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw createServerError(ERROR_CODES.DATABASE_ERROR, 'Failed to fetch venues');
  }
};

/**
 * Get venue by ID
 * @param {number} venueID - Venue ID
 * @returns {Promise<Object>} Venue details
 */
export const getVenueById = async (venueID) => {
  try {
    const query = `SELECT * FROM "Venue" WHERE "VenueID" = $1`;
    const result = await pool.query(query, [venueID]);

    if (result.rows.length === 0) {
      throw createNotFoundError(
        ERROR_CODES.VENUE_NOT_FOUND,
        'Venue not found'
      );
    }

    return result.rows[0];
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    throw createServerError(ERROR_CODES.DATABASE_ERROR, 'Failed to fetch venue');
  }
};
