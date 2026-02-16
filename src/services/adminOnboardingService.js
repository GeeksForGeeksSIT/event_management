/**
 * Admin Onboarding Service Layer
 * Handles business logic for admin registration with transaction support
 */
import bcrypt from 'bcrypt';
import pool from '../db.js';
import {
  createConflictError,
  createNotFoundError,
  createValidationError,
  createServerError,
} from '../utils/errors.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * STEP 1: Validate Invitation Code
 * - Check if code exists
 * - Check if code is active
 * - Check if code is not already used
 * - Check if code is not expired
 */
export const validateInvitationCode = async (code) => {
  const query = `
    SELECT 
      ic."CodeID",
      ic."Code",
      ic."RoleID",
      ic."IsActive",
      ic."IsUsed",
      ic."ExpiresAt",
      r."RoleName"
    FROM "InvitationCode" ic
    JOIN "Role" r ON ic."RoleID" = r."RoleID"
    WHERE ic."Code" = $1
  `;

  try {
    const result = await pool.query(query, [code]);

    if (result.rows.length === 0) {
      throw createNotFoundError(
        ERROR_CODES.INVALID_INVITATION_CODE,
        'Invitation code does not exist'
      );
    }

    const invitationCode = result.rows[0];

    // Check if code is active
    if (!invitationCode.IsActive) {
      throw createValidationError(
        ERROR_CODES.INVITATION_CODE_INACTIVE,
        'Invitation code is inactive'
      );
    }

    // Check if code is already used
    if (invitationCode.IsUsed) {
      throw createValidationError(
        ERROR_CODES.INVITATION_CODE_ALREADY_USED,
        'Invitation code has already been used'
      );
    }

    // Check if code is expired
    if (invitationCode.ExpiresAt && new Date(invitationCode.ExpiresAt) < new Date()) {
      throw createValidationError(
        ERROR_CODES.INVITATION_CODE_EXPIRED,
        'Invitation code has expired'
      );
    }

    return invitationCode;
  } catch (error) {
    if (error.statusCode) throw error;
    throw createServerError(ERROR_CODES.DATABASE_ERROR, 'Error validating invitation code');
  }
};

/**
 * STEP 2: Check if StudentID already exists
 */
export const checkStudentIDExists = async (studentID) => {
  const query = `
    SELECT "AdminID" FROM "Admin" WHERE "StudentID" = $1 LIMIT 1
  `;

  try {
    const result = await pool.query(query, [studentID]);
    return result.rows.length > 0;
  } catch (error) {
    throw createServerError(ERROR_CODES.DATABASE_ERROR, 'Error checking student ID');
  }
};

/**
 * STEP 3: Check if Email already exists
 */
export const checkEmailExists = async (email) => {
  const query = `
    SELECT "AdminID" FROM "Admin" WHERE "Email" = $1 LIMIT 1
  `;

  try {
    const result = await pool.query(query, [email]);
    return result.rows.length > 0;
  } catch (error) {
    throw createServerError(ERROR_CODES.DATABASE_ERROR, 'Error checking email');
  }
};

/**
 * STEP 4: Validate RoleID exists and matches invitation code
 */
export const validateRole = async (roleID) => {
  const query = `
    SELECT "RoleID", "RoleName", "AccessLevel" FROM "Role" WHERE "RoleID" = $1
  `;

  try {
    const result = await pool.query(query, [roleID]);

    if (result.rows.length === 0) {
      throw createValidationError(
        ERROR_CODES.INVALID_ROLE,
        'Invalid Role ID'
      );
    }

    return result.rows[0];
  } catch (error) {
    if (error.statusCode) throw error;
    throw createServerError(ERROR_CODES.DATABASE_ERROR, 'Error validating role');
  }
};

/**
 * STEP 5: Validate BranchID if provided
 */
export const validateBranch = async (branchID) => {
  if (!branchID) return null;

  const query = `
    SELECT "BranchID", "BranchName" FROM "Branch" WHERE "BranchID" = $1
  `;

  try {
    const result = await pool.query(query, [branchID]);

    if (result.rows.length === 0) {
      throw createValidationError(
        ERROR_CODES.INVALID_BRANCH,
        'Invalid Branch ID'
      );
    }

    return result.rows[0];
  } catch (error) {
    if (error.statusCode) throw error;
    throw createServerError(ERROR_CODES.DATABASE_ERROR, 'Error validating branch');
  }
};

/**
 * STEP 6: Hash password using bcrypt
 */
export const hashPassword = async (password) => {
  const SALT_ROUNDS = 12; // Production-grade cost factor
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    throw createServerError(ERROR_CODES.INTERNAL_ERROR, 'Error hashing password');
  }
};

/**
 * STEP 7: Create admin in database with transaction support
 * Ensures atomic operation: either admin is created AND invitation code is marked as used, or both fail
 */
export const createAdminWithTransaction = async (adminData, invitationCodeData) => {
  const client = await pool.connect();

  try {
    // Start transaction
    await client.query('BEGIN');

    // Insert admin
    const adminQuery = `
      INSERT INTO "Admin" (
        "StudentID",
        "FullName",
        "Email",
        "PasswordHash",
        "Phone",
        "RoleID",
        "BranchID",
        "GraduationYear",
        "InvitationCode"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING 
        "AdminID",
        "StudentID",
        "FullName",
        "Email",
        "Phone",
        "RoleID",
        "BranchID",
        "GraduationYear",
        "CurrentYear",
        "CreatedAt"
    `;

    const adminValues = [
      adminData.studentID,
      adminData.fullName,
      adminData.email,
      adminData.passwordHash,
      adminData.phone,
      adminData.roleID,
      adminData.branchID || null,
      adminData.graduationYear,
      adminData.invitationCode,
    ];

    const adminResult = await client.query(adminQuery, adminValues);

    if (adminResult.rows.length === 0) {
      throw new Error('Failed to create admin');
    }

    const createdAdmin = adminResult.rows[0];

    // Mark invitation code as used
    const updateCodeQuery = `
      UPDATE "InvitationCode"
      SET 
        "IsUsed" = TRUE,
        "UsedByAdminID" = $1,
        "UpdatedAt" = CURRENT_TIMESTAMP
      WHERE "CodeID" = $2
      RETURNING "CodeID"
    `;

    const codeResult = await client.query(updateCodeQuery, [
      createdAdmin.AdminID,
      invitationCodeData.CodeID,
    ]);

    if (codeResult.rows.length === 0) {
      throw new Error('Failed to mark invitation code as used');
    }

    // Commit transaction
    await client.query('COMMIT');

    return createdAdmin;
  } catch (error) {
    // Rollback on any error
    await client.query('ROLLBACK');
    throw createServerError(ERROR_CODES.TRANSACTION_FAILED, error.message);
  } finally {
    client.release();
  }
};

/**
 * ADMIN LOGIN SERVICE
 * Authenticates admin with email and password
 */
export const loginAdmin = async (email, password) => {
  const query = `
    SELECT 
      "AdminID",
      "StudentID",
      "Email",
      "FullName",
      "Phone",
      "RoleID",
      "BranchID",
      "GraduationYear",
      "CurrentYear",
      "PasswordHash",
      "CreatedAt"
    FROM "Admin"
    WHERE "Email" = $1
  `;

  try {
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      throw createValidationError(
        ERROR_CODES.INVALID_INPUT,
        'Invalid email or password'
      );
    }

    const admin = result.rows[0];

    // Verify password against hash
    const isPasswordValid = await bcrypt.compare(password, admin.PasswordHash);

    if (!isPasswordValid) {
      throw createValidationError(
        ERROR_CODES.INVALID_INPUT,
        'Invalid email or password'
      );
    }

    // Return admin without password hash
    return {
      AdminID: admin.AdminID,
      StudentID: admin.StudentID,
      Email: admin.Email,
      FullName: admin.FullName,
      Phone: admin.Phone,
      RoleID: admin.RoleID,
      BranchID: admin.BranchID,
      GraduationYear: admin.GraduationYear,
      CurrentYear: admin.CurrentYear,
      CreatedAt: admin.CreatedAt,
    };
  } catch (error) {
    if (error.statusCode) throw error;
    throw createServerError(ERROR_CODES.DATABASE_ERROR, 'Error during login');
  }
};

/**
 * Update admin details
 * Allows admin to update fullName, phone, and password
 */
export const updateAdmin = async (AdminID, updateData) => {
  const { fullName, phone, password, oldPassword } = updateData;

  // First, get current admin details
  const getAdminQuery = `
    SELECT "AdminID", "PasswordHash" FROM "Admin" WHERE "AdminID" = $1
  `;

  try {
    const adminResult = await pool.query(getAdminQuery, [AdminID]);

    if (adminResult.rows.length === 0) {
      throw createNotFoundError(
        ERROR_CODES.INVALID_INPUT,
        'Admin not found'
      );
    }

    const admin = adminResult.rows[0];

    // If password update requested, verify old password
    if (password) {
      const isOldPasswordValid = await bcrypt.compare(oldPassword, admin.PasswordHash);
      if (!isOldPasswordValid) {
        throw createValidationError(
          ERROR_CODES.INVALID_INPUT,
          'Current password is incorrect'
        );
      }
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (fullName) {
      updateFields.push(`"FullName" = $${paramCount++}`);
      updateValues.push(fullName);
    }

    if (phone) {
      updateFields.push(`"Phone" = $${paramCount++}`);
      updateValues.push(phone);
    }

    let newPasswordHash = null;
    if (password) {
      newPasswordHash = await hashPassword(password);
      updateFields.push(`"PasswordHash" = $${paramCount++}`);
      updateValues.push(newPasswordHash);
    }

    // Always update UpdatedAt timestamp
    updateFields.push(`"UpdatedAt" = CURRENT_TIMESTAMP`);

    // Add adminID to values for WHERE clause
    updateValues.push(AdminID);
    const whereParam = paramCount++;

    const updateQuery = `
      UPDATE "Admin"
      SET ${updateFields.join(', ')}
      WHERE "AdminID" = $${whereParam}
      RETURNING 
        "AdminID",
        "StudentID",
        "FullName",
        "Email",
        "Phone",
        "RoleID",
        "BranchID",
        "GraduationYear",
        "CurrentYear",
        "CreatedAt",
        "UpdatedAt"
    `;

    const result = await pool.query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      throw createServerError(ERROR_CODES.DATABASE_ERROR, 'Failed to update admin');
    }

    return result.rows[0];
  } catch (error) {
    if (error.statusCode) throw error;
    throw createServerError(ERROR_CODES.DATABASE_ERROR, 'Error updating admin details');
  }
};

/**
 * Main service function: Orchestrates entire onboarding flow
 */
export const onboardAdmin = async (validatedData) => {
  // Step 1: Validate invitation code
  const invitationCode = await validateInvitationCode(validatedData.invitationCode);

  // Step 2: Validate role matches invitation code
  if (validatedData.roleID !== invitationCode.RoleID) {
    throw createValidationError(
      ERROR_CODES.INVALID_ROLE,
      `RoleID must match invitation code (expected: ${invitationCode.RoleID})`
    );
  }

  // Step 3: Check if StudentID already exists
  if (await checkStudentIDExists(validatedData.studentID)) {
    throw createConflictError(
      ERROR_CODES.DUPLICATE_STUDENT_ID,
      'Student ID already exists'
    );
  }

  // Step 4: Check if Email already exists
  if (await checkEmailExists(validatedData.email)) {
    throw createConflictError(
      ERROR_CODES.DUPLICATE_EMAIL,
      'Email already registered'
    );
  }

  // Step 5: Validate role
  await validateRole(validatedData.roleID);

  // Step 6: Validate branch if provided
  if (validatedData.branchID) {
    await validateBranch(validatedData.branchID);
  }

  // Step 7: Hash password
  const passwordHash = await hashPassword(validatedData.password);

  // Step 8: Create admin with transaction
  const admin = await createAdminWithTransaction(
    {
      ...validatedData,
      passwordHash,
    },
    invitationCode
  );

  return admin;
};
