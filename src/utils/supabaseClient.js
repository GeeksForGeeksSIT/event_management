/**
 * Supabase Storage Client
 * Used for uploading files to Supabase Storage buckets:
 *   - 'payment-screenshots' – payment proof screenshots
 *   - 'event-qrcodes' – event payment QR codes
 *
 * Requires environment variables:
 *   SUPABASE_URL          – your project URL  (Settings → API → Project URL)
 *   SUPABASE_SERVICE_KEY  – service_role key  (Settings → API → service_role)
 *
 * The service_role key bypasses Row Level Security so the server can write to
 * private buckets without any additional RLS policies.
 */
import { createClient } from '@supabase/supabase-js';
import { createServerError } from './errors.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

const BUCKETS = {
  PAYMENT_SCREENSHOTS: 'payment-screenshots',
  EVENT_QRCODES: 'event-qrcodes',
};

let _client = null;

const getClient = () => {
  if (_client) return _client;

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw createServerError(
      ERROR_CODES.INTERNAL_ERROR,
      'SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment variables'
    );
  }

  _client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });

  return _client;
};

/**
 * Upload a file buffer to Supabase Storage.
 *
 * @param {Buffer}  buffer    – file buffer from multer (memoryStorage)
 * @param {string}  filename  – unique filename e.g. `pay_<paymentId>_<timestamp>.jpg`
 * @param {string}  mimeType  – e.g. 'image/jpeg', 'image/png'
 * @param {string}  bucket    – bucket name (from BUCKETS constants)
 * @returns {Promise<string>} – signed URL of the uploaded file
 */
const uploadFileToStorage = async (buffer, filename, mimeType, bucket) => {
  const supabase = getClient();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, {
      contentType: mimeType,
      upsert: true,           // overwrite if same filename exists (retry scenario)
    });

  if (error) {
    throw createServerError(
      ERROR_CODES.INTERNAL_ERROR,
      `File upload failed: ${error.message}`
    );
  }

  // Build a signed URL (1 year expiry) so admins can view private files
  const { data: signedData, error: signError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filename, 60 * 60 * 24 * 365);

  if (signError) {
    throw createServerError(
      ERROR_CODES.INTERNAL_ERROR,
      `Failed to generate file URL: ${signError.message}`
    );
  }

  return signedData.signedUrl;
};

/**
 * Upload a payment screenshot buffer to Supabase Storage.
 *
 * @param {Buffer}  buffer    – file buffer from multer (memoryStorage)
 * @param {string}  filename  – unique filename e.g. `pay_<paymentId>_<timestamp>.jpg`
 * @param {string}  mimeType  – e.g. 'image/jpeg', 'image/png'
 * @returns {Promise<string>} – public URL of the uploaded file
 */
export const uploadScreenshot = async (buffer, filename, mimeType) => {
  return uploadFileToStorage(buffer, filename, mimeType, BUCKETS.PAYMENT_SCREENSHOTS);
};

/**
 * Upload an event QR code to Supabase Storage.
 *
 * @param {Buffer}  buffer    – file buffer from multer (memoryStorage)
 * @param {string}  filename  – unique filename e.g. `qr_event_<eventId>_<timestamp>.png`
 * @param {string}  mimeType  – e.g. 'image/png', 'image/jpeg'
 * @returns {Promise<string>} – signed URL of the uploaded QR code
 */
export const uploadQRCode = async (buffer, filename, mimeType) => {
  return uploadFileToStorage(buffer, filename, mimeType, BUCKETS.EVENT_QRCODES);
};
