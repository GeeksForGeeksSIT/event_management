/**
 * Razorpay Utility
 * Initializes the Razorpay SDK instance and exposes signature verification helpers.
 */
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createServerError, APIError } from './errors.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

// ---------------------------------------------------------------------------
// Shared Razorpay instance (lazy-initialised so missing env vars surface early)
// ---------------------------------------------------------------------------
let _instance = null;

export const getRazorpayInstance = () => {
  if (_instance) return _instance;

  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw createServerError(
      ERROR_CODES.RAZORPAY_ERROR,
      'RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in environment variables'
    );
  }

  _instance = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
  return _instance;
};

// ---------------------------------------------------------------------------
// Verify payment signature (called after client-side checkout success)
//
//   Razorpay signs: HMAC-SHA256( "<orderId>|<paymentId>", key_secret )
//   We compare the hex digest against the razorpay_signature sent by the client.
// ---------------------------------------------------------------------------
export const verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  const { RAZORPAY_KEY_SECRET } = process.env;

  if (!RAZORPAY_KEY_SECRET) {
    throw createServerError(ERROR_CODES.RAZORPAY_ERROR, 'RAZORPAY_KEY_SECRET not configured');
  }

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    throw new APIError(400, ERROR_CODES.INVALID_PAYMENT_SIGNATURE, 'Payment signature verification failed');
  }

  return true;
};

// ---------------------------------------------------------------------------
// Verify webhook signature (called on POST /payments/webhook)
//
//   Razorpay signs: HMAC-SHA256( raw_request_body, webhook_secret )
//   Header: x-razorpay-signature
// ---------------------------------------------------------------------------
export const verifyWebhookSignature = (rawBody, signature) => {
  const { RAZORPAY_WEBHOOK_SECRET } = process.env;

  if (!RAZORPAY_WEBHOOK_SECRET) {
    throw createServerError(ERROR_CODES.RAZORPAY_ERROR, 'RAZORPAY_WEBHOOK_SECRET not configured');
  }

  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  return expectedSignature === signature;
};
