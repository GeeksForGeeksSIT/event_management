/**
 * Payment Service
 * Handles all business logic for the manual QR-based payment flow.
 *
 * Flow:
 *   1. initiateRegistration() in registrationService calls createPendingPayment()
 *      after inserting a Pending registration.
 *
 *   2. User scans QR, makes payment, then calls POST /payments/:paymentId/screenshot
 *      → attachScreenshot() uploads to Supabase and sets Payment → UnderReview
 *
 *   3. Admin calls GET  /admin/payments/review        → listPendingReviews()
 *              PUT  /admin/payments/:id/approve     → approvePayment()
 *              PUT  /admin/payments/:id/reject      → rejectPayment()
 */
import { v4 as uuidv4 } from 'uuid';
import pool from '../db.js';
import {
  APIError,
  createNotFoundError,
  createConflictError,
  createForbiddenError,
  createServerError,
} from '../utils/errors.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

// ---------------------------------------------------------------------------
// 1.  Create a Pending payment record after Registration is inserted.
// ---------------------------------------------------------------------------
export const createPendingPayment = async (regId, amount) => {
  const transactionRef = uuidv4();

  const query = `
    INSERT INTO "Payment" ("RegID", "Amount", "PaymentStatus", "PaymentMode", "TransactionRef")
    VALUES ($1, $2, 'Pending', 'QR', $3)
    RETURNING "PayID", "RegID", "Amount", "PaymentStatus", "PaymentMode", "TransactionRef", "CreatedAt"
  `;

  const { rows } = await pool.query(query, [regId, amount, transactionRef]);
  return rows[0];
};

// ---------------------------------------------------------------------------
// 2.  Attach screenshot URL after user uploads proof.
//     Transitions Payment: Pending / Failed → UnderReview
// ---------------------------------------------------------------------------
export const attachScreenshot = async (paymentId, userId, screenshotUrl) => {
  // Fetch payment + registration to verify ownership
  const fetchQuery = `
    SELECT p."PayID", p."PaymentStatus", r."UserID", r."RegStatus"
    FROM "Payment" p
    JOIN "Registration" r ON r."RegID" = p."RegID"
    WHERE p."PayID" = $1
    LIMIT 1
  `;
  const { rows } = await pool.query(fetchQuery, [Number(paymentId)]);

  if (rows.length === 0) {
    throw createNotFoundError(ERROR_CODES.PAYMENT_NOT_FOUND, 'Payment record not found');
  }

  const payment = rows[0];

  if (payment.UserID !== userId) {
    throw createForbiddenError(ERROR_CODES.FORBIDDEN, 'You are not authorised to update this payment');
  }

  // Allow upload only if payment is Pending or Failed (retry after rejection)
  if (payment.PaymentStatus !== 'Pending' && payment.PaymentStatus !== 'Failed') {
    throw new APIError(
      409,
      ERROR_CODES.INVALID_STATUS_TRANSITION,
      `Cannot upload screenshot when payment status is '${payment.PaymentStatus}'`
    );
  }

  if (payment.RegStatus === 'Cancelled') {
    throw new APIError(409, ERROR_CODES.INVALID_STATUS_TRANSITION, 'Registration has been cancelled');
  }

  const updateQuery = `
    UPDATE "Payment"
    SET "ScreenshotURL" = $1, "PaymentStatus" = 'UnderReview'
    WHERE "PayID" = $2
    RETURNING "PayID", "RegID", "Amount", "PaymentStatus", "ScreenshotURL", "CreatedAt"
  `;
  const result = await pool.query(updateQuery, [screenshotUrl, Number(paymentId)]);
  return result.rows[0];
};

// ---------------------------------------------------------------------------
// 3.  List all payments awaiting admin review.
// ---------------------------------------------------------------------------
export const listPendingReviews = async () => {
  const query = `
    SELECT
      p."PayID"         AS "paymentId",
      p."Amount"        AS "amount",
      p."PaymentStatus" AS "paymentStatus",
      p."PaymentMode"   AS "paymentMode",
      p."TransactionRef" AS "transactionRef",
      p."ScreenshotURL" AS "screenshotUrl",
      p."CreatedAt"     AS "paymentDate",
      r."RegID"         AS "registrationId",
      r."RegStatus"     AS "registrationStatus",
      r."RegDate"       AS "registrationDate",
      e."EventID"       AS "eventId",
      e."EventName"     AS "eventName",
      e."StartTime"     AS "eventStart",
      u."UserID"        AS "userId",
      u."FullName"      AS "userName",
      u."Email"         AS "userEmail",
      u."StudentID"     AS "studentId"
    FROM "Payment" p
    JOIN "Registration" r ON r."RegID" = p."RegID"
    JOIN "Event"        e ON e."EventID" = r."EventID"
    JOIN "User"         u ON u."UserID"  = r."UserID"
    WHERE p."PaymentStatus" = 'UnderReview'
    ORDER BY p."CreatedAt" ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

// ---------------------------------------------------------------------------
// 4.  Approve payment — Transaction: Payment → Success, Registration → Confirmed
// ---------------------------------------------------------------------------
export const approvePayment = async (paymentId) => {
  // Fetch to validate state
  const { rows } = await pool.query(
    `SELECT p."PayID", p."PaymentStatus", p."RegID", r."RegStatus"
     FROM "Payment" p
     JOIN "Registration" r ON r."RegID" = p."RegID"
     WHERE p."PayID" = $1 LIMIT 1`,
    [Number(paymentId)]
  );

  if (rows.length === 0) {
    throw createNotFoundError(ERROR_CODES.PAYMENT_NOT_FOUND, 'Payment record not found');
  }

  const payment = rows[0];

  if (payment.PaymentStatus !== 'UnderReview') {
    throw new APIError(
      409,
      ERROR_CODES.INVALID_STATUS_TRANSITION,
      `Payment must be 'UnderReview' to approve (current: '${payment.PaymentStatus}')`
    );
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updatedPayment = await client.query(
      `UPDATE "Payment" SET "PaymentStatus" = 'Success'
       WHERE "PayID" = $1
       RETURNING "PayID", "RegID", "Amount", "PaymentStatus", "ScreenshotURL"`,
      [Number(paymentId)]
    );

    const updatedReg = await client.query(
      `UPDATE "Registration" SET "RegStatus" = 'Confirmed'
       WHERE "RegID" = $1
       RETURNING "RegID", "UserID", "EventID", "RegStatus", "RegDate"`,
      [payment.RegID]
    );

    await client.query('COMMIT');

    return {
      payment: updatedPayment.rows[0],
      registration: updatedReg.rows[0],
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw createServerError(ERROR_CODES.TRANSACTION_FAILED, 'Failed to approve payment');
  } finally {
    client.release();
  }
};

// ---------------------------------------------------------------------------
// 5.  Reject payment — Transaction: Payment → Failed, Registration → Cancelled
// ---------------------------------------------------------------------------
export const rejectPayment = async (paymentId, reason) => {
  const { rows } = await pool.query(
    `SELECT p."PayID", p."PaymentStatus", p."RegID", r."RegStatus"
     FROM "Payment" p
     JOIN "Registration" r ON r."RegID" = p."RegID"
     WHERE p."PayID" = $1 LIMIT 1`,
    [Number(paymentId)]
  );

  if (rows.length === 0) {
    throw createNotFoundError(ERROR_CODES.PAYMENT_NOT_FOUND, 'Payment record not found');
  }

  const payment = rows[0];

  if (payment.PaymentStatus !== 'UnderReview') {
    throw new APIError(
      409,
      ERROR_CODES.INVALID_STATUS_TRANSITION,
      `Payment must be 'UnderReview' to reject (current: '${payment.PaymentStatus}')`
    );
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Store rejection reason in GatewayID field (repurposed for notes in manual flow)
    const updatedPayment = await client.query(
      `UPDATE "Payment"
       SET "PaymentStatus" = 'Failed', "GatewayID" = $1
       WHERE "PayID" = $2
       RETURNING "PayID", "RegID", "Amount", "PaymentStatus", "GatewayID", "ScreenshotURL"`,
      [reason || 'Rejected by admin', Number(paymentId)]
    );

    const updatedReg = await client.query(
      `UPDATE "Registration" SET "RegStatus" = 'Cancelled'
       WHERE "RegID" = $1
       RETURNING "RegID", "UserID", "EventID", "RegStatus", "RegDate"`,
      [payment.RegID]
    );

    await client.query('COMMIT');

    return {
      payment: updatedPayment.rows[0],
      registration: updatedReg.rows[0],
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw createServerError(ERROR_CODES.TRANSACTION_FAILED, 'Failed to reject payment');
  } finally {
    client.release();
  }
};
