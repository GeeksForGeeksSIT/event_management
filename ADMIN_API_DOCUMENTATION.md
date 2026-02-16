# Admin API Documentation - Postman Testing Guide

## Overview

This document provides a complete reference for the Admin API endpoints and step-by-step instructions for testing each endpoint using Postman.

---

## API Base URL

```
http://localhost:3000/admin
```

> **Note:** Update this URL for different environments (development, staging, production)

---

## Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/admin/onboard` | Register a new admin using invitation code | No |
| POST | `/admin/login` | Authenticate admin and get JWT token | No |
| PUT | `/admin/:adminId` | Update admin profile details | Yes |

---

## 1. POST /admin/onboard - Register New Admin

**Description:** Register a new admin user with invitation code validation.

### Postman Setup

#### Step 1: Create Request
1. Open Postman and click **New** → **Request**
2. Name: `Admin Onboard`
3. Method: **POST**
4. URL: `http://localhost:3000/admin/onboard`

#### Step 2: Configure Headers
1. Click **Headers** tab
2. Add the following header:

| Key | Value |
|-----|-------|
| Content-Type | application/json |

#### Step 3: Add Request Body
1. Click **Body** tab
2. Select **raw** and choose **JSON** from dropdown
3. Enter the request payload:

```json
{
  "studentID": "CS2024001",
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "phone": "+919876543210",
  "roleID": 1,
  "branchID": 1,
  "graduationYear": 2026,
  "invitationCode": "INVITE2024ABC"
}
```

#### Step 4: Send Request
1. Click **Send** button
2. View response in the **Body** tab below

#### Step 5: Verify Success Response
Expected HTTP Status: **201 Created**

Response structure:
```json
{
  "success": true,
  "message": "Admin onboarded successfully",
  "data": {
    "admin": {
      "adminID": 1,
      "studentID": "CS2024001",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+919876543210",
      "roleID": 1,
      "branchID": 1,
      "graduationYear": 2026,
      "currentYear": null,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "tokenType": "Bearer",
      "expiresIn": 86400
    }
  }
}
```

### Request Field Reference

| Field | Type | Required | Format | Example |
|-------|------|----------|--------|---------|
| studentID | String | Yes | Alphanumeric, 3-20 chars | `CS2024001` |
| fullName | String | Yes | Text, 2-100 chars | `John Doe` |
| email | String | Yes | Valid email format | `john@example.com` |
| password | String | Yes | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char | `SecurePass@123` |
| phone | String | Yes | E.164 international format | `+919876543210` |
| roleID | Integer | Yes | Valid role ID from database | `1` |
| branchID | Integer | No | Valid branch ID from database | `1` |
| graduationYear | Integer | Yes | 2020-2035 | `2026` |
| invitationCode | String | Yes | Uppercase alphanumeric, 8-20 chars | `INVITE2024ABC` |

### Test Cases

#### Test Case 1.1: Successful Onboarding
- **Input:** Valid data with all required fields
- **Expected Status:** 201
- **Expected Result:** Admin created, JWT token returned
- **Save Token:** Copy the `accessToken` from response (needed for authenticated requests)

#### Test Case 1.2: Invalid Email Format
- **Input:** Change email to `invalidemail`
- **Expected Status:** 400
- **Expected Error Code:** `INVALID_EMAIL`

#### Test Case 1.3: Weak Password
- **Input:** Change password to `weak`
- **Expected Status:** 400
- **Expected Error Code:** `INVALID_PASSWORD`

#### Test Case 1.4: Duplicate Email
- **Input:** Use an email that was already registered
- **Expected Status:** 409
- **Expected Error Code:** `DUPLICATE_EMAIL`

#### Test Case 1.5: Invalid Invitation Code
- **Input:** Change invitationCode to `INVALID123`
- **Expected Status:** 404
- **Expected Error Code:** `INVALID_INVITATION_CODE`

#### Test Case 1.6: Expired Invitation Code
- **Input:** Use an expired invitation code
- **Expected Status:** 400
- **Expected Error Code:** `INVITATION_CODE_EXPIRED`

#### Test Case 1.7: Missing Required Field
- **Input:** Remove the `fullName` field
- **Expected Status:** 400
- **Expected Error Code:** `MISSING_FIELD`

---

## 2. POST /admin/login - Authenticate Admin

**Description:** Login with email and password to get a JWT token for authenticated requests.

### Postman Setup

#### Step 1: Create Request
1. Click **New** → **Request**
2. Name: `Admin Login`
3. Method: **POST**
4. URL: `http://localhost:3000/admin/login`

#### Step 2: Configure Headers
1. Click **Headers** tab
2. Add the following header:

| Key | Value |
|-----|-------|
| Content-Type | application/json |

#### Step 3: Add Request Body
1. Click **Body** tab
2. Select **raw** and choose **JSON**
3. Enter the request payload:

```json
{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

Use credentials from the onboarded admin created in Step 1.

#### Step 4: Send Request
1. Click **Send** button
2. View response in the **Body** tab

#### Step 5: Verify Success Response
Expected HTTP Status: **200 OK**

Response structure:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "admin": {
      "adminID": 1,
      "studentID": "CS2024001",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+919876543210",
      "roleID": 1,
      "branchID": 1,
      "graduationYear": 2026,
      "currentYear": null,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "tokenType": "Bearer",
      "expiresIn": 86400
    }
  }
}
```

#### Step 6: Save Token for Authenticated Requests
1. Copy the `accessToken` value from the response
2. Store it for use in the Update Admin endpoint (Step 3)

### Request Field Reference

| Field | Type | Required | Format | Example |
|-------|------|----------|--------|---------|
| email | String | Yes | Valid email format | `john@example.com` |
| password | String | Yes | Correct admin password | `SecurePass@123` |

### Test Cases

#### Test Case 2.1: Successful Login
- **Input:** Valid registered admin email and password
- **Expected Status:** 200
- **Expected Result:** JWT token returned
- **Action:** Save token for authenticated endpoints

#### Test Case 2.2: Invalid Email Format
- **Input:** Change email to `invalidemail`
- **Expected Status:** 400
- **Expected Error Code:** `INVALID_INPUT`

#### Test Case 2.3: Non-existent Email
- **Input:** Email that doesn't exist: `nonexistent@example.com`
- **Expected Status:** 401
- **Expected Error Code:** `INVALID_INPUT`
- **Expected Message:** "Invalid email or password"

#### Test Case 2.4: Incorrect Password
- **Input:** Correct email, wrong password: `WrongPass@123`
- **Expected Status:** 401
- **Expected Error Code:** `INVALID_INPUT`
- **Expected Message:** "Invalid email or password"

#### Test Case 2.5: Missing Email
- **Input:** Remove email field from body
- **Expected Status:** 400
- **Expected Error Code:** `MISSING_FIELD`

#### Test Case 2.6: Missing Password
- **Input:** Remove password field from body
- **Expected Status:** 400
- **Expected Error Code:** `MISSING_FIELD`

---

## 3. PUT /admin/:adminId - Update Admin Profile

**Description:** Update admin profile details (name, phone, password). Requires JWT authentication.

### Postman Setup

#### Step 1: Create Request
1. Click **New** → **Request**
2. Name: `Admin Update`
3. Method: **PUT**
4. URL: `http://localhost:3000/admin/1`

> **Note:** Replace `1` with the actual admin ID to update

#### Step 2: Configure Headers
1. Click **Headers** tab
2. Add the following headers:

| Key | Value |
|-----|-------|
| Content-Type | application/json |
| Authorization | Bearer <YOUR_JWT_TOKEN> |

> Replace `<YOUR_JWT_TOKEN>` with the token obtained from login (Step 2)

**How to add Authorization header:**
- Copy the `accessToken` from login response
- Paste it in the Authorization field value after `Bearer ` (note the space)

#### Step 3: Add Request Body
1. Click **Body** tab
2. Select **raw** and choose **JSON**
3. Enter the request payload (update one or more fields):

```json
{
  "fullName": "John Updated",
  "phone": "+919876543211"
}
```

#### Step 4: Send Request
1. Click **Send** button
2. View response in the **Body** tab

#### Step 5: Verify Success Response
Expected HTTP Status: **200 OK**

Response structure:
```json
{
  "success": true,
  "message": "Admin details updated successfully",
  "data": {
    "admin": {
      "adminID": 1,
      "studentID": "CS2024001",
      "fullName": "John Updated",
      "email": "john@example.com",
      "phone": "+919876543211",
      "roleID": 1,
      "branchID": 1,
      "graduationYear": 2026,
      "currentYear": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-16T14:45:30.000Z"
    }
  }
}
```

### Request Field Reference

| Field | Type | Required | Format | Example |
|-------|------|----------|--------|---------|
| fullName | String | No | Text, 2-100 chars | `John Updated` |
| phone | String | No | E.164 international format | `+919876543211` |
| password | String | No | Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char | `NewPassword@456` |
| oldPassword | String | Required if password provided | Current admin password | `SecurePass@123` |

> **Note:** At least one field must be provided. If changing password, oldPassword is required.

### Test Cases

#### Test Case 3.1: Update Full Name
- **Body:**
  ```json
  {
    "fullName": "Jane Smith"
  }
  ```
- **Expected Status:** 200
- **Verify:** Response shows updated name and new `updatedAt` timestamp

#### Test Case 3.2: Update Phone
- **Body:**
  ```json
  {
    "phone": "+441234567890"
  }
  ```
- **Expected Status:** 200
- **Verify:** Phone updated in response

#### Test Case 3.3: Update Password
- **Body:**
  ```json
  {
    "password": "NewSecure@Pass789",
    "oldPassword": "SecurePass@123"
  }
  ```
- **Expected Status:** 200
- **Verify:** Password updated (cannot verify in response as password is hashed)

#### Test Case 3.4: Update Multiple Fields
- **Body:**
  ```json
  {
    "fullName": "John Doe Updated",
    "phone": "+919876543212"
  }
  ```
- **Expected Status:** 200
- **Verify:** All specified fields updated

#### Test Case 3.5: Invalid Phone Format
- **Body:**
  ```json
  {
    "phone": "123"
  }
  ```
- **Expected Status:** 400
- **Expected Error Code:** `INVALID_PHONE`

#### Test Case 3.6: Weak New Password
- **Body:**
  ```json
  {
    "password": "weak",
    "oldPassword": "SecurePass@123"
  }
  ```
- **Expected Status:** 400
- **Expected Error Code:** `INVALID_PASSWORD`

#### Test Case 3.7: Wrong Old Password
- **Body:**
  ```json
  {
    "password": "NewSecure@Pass789",
    "oldPassword": "WrongPassword@123"
  }
  ```
- **Expected Status:** 400
- **Expected Error Code:** `INVALID_INPUT`
- **Expected Message:** "Current password is incorrect"

#### Test Case 3.8: Missing JWT Token
- **Remove** the Authorization header
- **Expected Status:** 401
- **Expected Error Code:** `UNAUTHORIZED`

#### Test Case 3.9: Invalid JWT Token
- **Header:** `Authorization: Bearer invalid_token_here`
- **Expected Status:** 401
- **Expected Error Code:** `UNAUTHORIZED`

#### Test Case 3.10: No Fields Provided
- **Body:** `{}`
- **Expected Status:** 400
- **Expected Error Code:** `INVALID_INPUT`
- **Expected Message:** "At least one field must be provided"

#### Test Case 3.11: Non-existent Admin ID
- **URL:** `http://localhost:3000/admin/9999`
- **Expected Status:** 404
- **Expected Error Code:** `INVALID_INPUT`

---

## Password Requirements

When setting or updating passwords, ensure they meet these requirements:

✅ **Minimum 8 characters**  
✅ **At least 1 uppercase letter** (A-Z)  
✅ **At least 1 lowercase letter** (a-z)  
✅ **At least 1 digit** (0-9)  
✅ **At least 1 special character** (!@#$%^&*-_=+)  

**Valid Examples:**
- `SecurePass@123`
- `MyPassword!2024`
- `Admin@2024New`

**Invalid Examples:**
- `password123` (no uppercase, no special char)
- `PASSWORD@123` (no lowercase)
- `Pass@1` (too short)
- `weak` (doesn't meet any advanced requirements)

---

## Phone Number Format (E.164)

Phone numbers must be in E.164 international format:

**Format:** `+[country code][number]`

**Examples:**
- `+919876543210` (India)
- `+14155552671` (USA)
- `+441234567890` (UK)
- `+86134567890` (China)
- `+33123456789` (France)

---

## Common HTTP Status Codes

| Status | Meaning | When It Occurs |
|--------|---------|---|
| 200 | OK | Successful request completed |
| 201 | Created | Resource successfully created |
| 400 | Bad Request | Invalid input, validation error, or missing field |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Sufficient permissions not available |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (duplicate) |
| 500 | Internal Server Error | Server-side error |

---

## Postman Tips & Tricks

### 1. Using Environment Variables
Store base URL as a variable to easily switch between environments:

1. Click **Environment** (top right)
2. Click **Create** → **New Environment**
3. Add variable: `baseUrl` = `http://localhost:3000/admin`
4. In requests, use: `{{baseUrl}}/onboard`

### 2. Saving Response Data
Save JWT token from login for use in authenticated requests:

1. Go to **Tests** tab of login request
2. Add script:
   ```javascript
   if (pm.response.code === 200) {
     var jsonData = pm.response.json();
     pm.environment.set("jwtToken", jsonData.data.token.accessToken);
   }
   ```
3. Use in other requests: `Authorization: Bearer {{jwtToken}}`

### 3. Pre-request Scripts
Auto-format headers or modify requests before sending:

1. Go to **Pre-request Script** tab
2. Add JavaScript code to manipulate request data

### 4. Collection Organization
Group related requests:
1. Create a folder: `Right-click` → **Add Folder**
2. Move all admin endpoints into it
3. Set folder-level authentication that applies to all requests

### 5. Testing with Different Data
Use Postman's **Collection Runner** for running multiple test cases:

1. Click **Collection** → **Run**
2. Select test cases to run sequentially
3. View results and pass/fail status

---

## Testing Workflow

### Recommended Testing Sequence

1. **Test Onboarding First**
   - Register a new admin
   - Save the JWT token from response

2. **Test Login**
   - Use credentials from step 1
   - Verify you get a JWT token
   - Save this token for authenticated requests

3. **Test Update Operations**
   - Use the JWT token from step 2
   - Test updating different fields
   - Test error cases

### Full End-to-End Test Flow

```
1. POST /admin/onboard
   ↓ (Save adminID and token)
   
2. POST /admin/login
   ↓ (Save JWT token)
   
3. PUT /admin/:adminId (Update name)
   ↓
   
4. PUT /admin/:adminId (Update phone)
   ↓
   
5. PUT /admin/:adminId (Update password)
   ↓
   
6. POST /admin/login (With new password to verify it works)
```

---

## Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "statusCode": 400,
  "errorCode": "ERROR_CODE_HERE",
  "message": "Human-readable error message",
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

Example error response:
```json
{
  "success": false,
  "statusCode": 400,
  "errorCode": "INVALID_PASSWORD",
  "message": "Password does not meet security requirements",
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

---

## Troubleshooting

### Issue: "Cannot GET /admin/onboard"
- **Cause:** Server not running or wrong method used
- **Solution:** Start server with `npm run dev` and ensure POST method is selected

### Issue: "Unauthorized" response
- **Cause:** Missing or invalid JWT token
- **Solution:** Get a fresh token from login endpoint and add it to Authorization header

### Issue: "Invalid email" error
- **Cause:** Email format doesn't match standard email pattern
- **Solution:** Use format like `user@example.com`

### Issue: "Invitation code does not exist"
- **Cause:** Using non-existent or invalid invitation code
- **Solution:** Verify the invitation code exists in database

### Issue: "CORS error"
- **Cause:** CORS not configured or different origin
- **Solution:** Check server CORS configuration, use same origin

---

## Next Steps

After completing all tests:
- ✅ Verify all endpoints are working
- ✅ Test all error scenarios
- ✅ Validate response formats
- ✅ Check HTTP status codes
- ✅ Review JSON structure consistency
