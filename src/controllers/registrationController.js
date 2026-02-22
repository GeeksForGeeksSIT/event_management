import { APIError } from "../utils/errors";
import { v4 as uuidv4 } from "uuid";
import pool from "../db.js"

/* 
json body
{
  "eventId": 12
}

 response
{
  "status": "OK",
  "message": "Registration created",
  "paymentRef": "b4c7d9d2-89e3-4b90-a3fc-72f4f9d3a321",
  "data": {
    "RegId": 45,
    "userId": 7,
    "EventId": 12,
    "RegDate": "2026-02-20T14:32:11.000Z",
    "RegStatus": "CONFIRMED",
    "PayId": 103
  }
}
*/

export const createRegistration = async (req, res, next) => {
  try {
    const { eventId } = req.body;
    const userId = req.userId;

    // 1) Validate inputs
    if (!userId) {
      throw new APIError(401, "UNAUTHORIZED", "Login required");
    }

    if (!eventId || isNaN(Number(eventId))) {
      throw new APIError(400, "BAD_REQUEST", "eventId is required and must be a number");
    }

    // 2) Payment reference (generated)
    const paymentRef = uuidv4();

    // 3) Razorpay verify (placeholder)
    // const paymentVerified = await payment(paymentRef);
    const paymentVerified = true;

    if (!paymentVerified) {
      throw new APIError(402, "PAYMENT_REQUIRED", "Payment not verified");
    }

    // 4) Get PayId from Payment table using TransactionRef = paymentRef
    // NOTE: This assumes you already inserted a row in Payment table when initiating payment
    const paymentIdQuery = `
      SELECT "PayId", "PaymentStatus"
      FROM "Payment"
      WHERE "TransactionRef" = $1
      LIMIT 1
    `;
    
    const paymentResult = await pool.query(paymentIdQuery, [paymentRef]);

    if (paymentResult.rowCount === 0) {
      throw new APIError(400, "PAYMENT_NOT_FOUND", "Payment record not found for this transaction");
    }

    const { PayId, PaymentStatus } = paymentResult.rows[0];

    // Optional: ensure payment is successful
    if (PaymentStatus !== "SUCCESS" && PaymentStatus !== "PAID") {
      throw new APIError(402, "PAYMENT_NOT_SUCCESS", `Payment status is ${PaymentStatus}`);
    }

    // 5) Prevent duplicate registration (same user, same event)
    const dupCheckQuery = `
      SELECT 1
      FROM "Registration"
      WHERE "userId" = $1 AND "EventId" = $2
      LIMIT 1
    `;
    const dup = await pool.query(dupCheckQuery, [userId, Number(eventId)]);
    if (dup.rowCount > 0) {
      throw new APIError(409, "ALREADY_REGISTERED", "User already registered for this event");
    }

    // 6) Insert into Registration
    const regDate = new Date();
    const regStatus = "CONFIRMED";

    const regQuery = `
      INSERT INTO "Registration" ("userId", "EventId", "RegDate", "RegStatus", "PayId")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const { rows } = await pool.query(regQuery, [
      userId,
      Number(eventId),
      regDate,
      regStatus,
      PayId,
    ]);

    return res.status(201).json({
      status: "OK",
      message: "Registration created",
      paymentRef, // helpful to return for tracking
      data: rows[0],
    });
  } catch (err) {
    next(err);
  }
};
