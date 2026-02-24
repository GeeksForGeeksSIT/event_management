# Registration System - Quick Start Guide

## Overview
Complete event registration system with 11 API endpoints for user management and event registrations.

## Quick API Reference

### User Management
```bash
# Register new user
POST /users/register
Body: {studentID, fullName, username, email, password, phone, branchID?, graduationYear}
Response: {user, token}

# Login user
POST /users/login
Body: {email, password}
Response: {user, token}

# Get profile (protected)
GET /users/:userId
Authorization: Bearer <token>
Response: {user}

# Update profile (protected)
PUT /users/:userId
Authorization: Bearer <token>
Body: {fullName?, phone?, password?, oldPassword?}
Response: {user}
```

### Event Registrations
```bash
# Register for event (protected)
POST /events/:eventId/registrations
Authorization: Bearer <token>
Response: {registration}

# Get registration (protected)
GET /events/:eventId/registrations/:registrationId
Authorization: Bearer <token>
Response: {registration}

# Cancel registration (protected)
DELETE /events/:eventId/registrations/:registrationId
Authorization: Bearer <token>
Response: {registration}

# List user registrations (protected)
GET /users/:userId/registrations?status=CONFIRMED&limit=10&offset=0
Authorization: Bearer <token>
Response: {registrations, pagination}
```

### Admin Only
```bash
# List event registrations (admin only)
GET /events/:eventId/registrations?limit=10&offset=0
Authorization: Bearer <admin-token>
Response: {registrations, pagination}

# Get registration stats (admin only)
GET /events/:eventId/registrations/stats
Authorization: Bearer <admin-token>
Response: {stats: {total, confirmed, pending, attended, cancelled, waitlisted}}

# Update registration status (admin only)
PUT /registrations/:registrationId
Authorization: Bearer <admin-token>
Body: {status, reason?}
Response: {registration}
```

## Key Features

### Security
- bcrypt password hashing (12 rounds)
- JWT authentication (24h expiry)
- Role-based authorization (RoleID=1 is admin)
- Input validation & sanitization
- SQL injection prevention (prepared statements)

### Data Management
- Atomic transactions for consistency
- Event capacity management
- Automatic waitlisting when event is full
- Duplicate prevention (email, studentID, username)
- Status transition validation

### User Features
- User registration with password strength validation
- Email & username uniqueness checks
- Profile management (name, phone, password)
- Event registration with waitlist support
- Registration history with filters
- Pagination support

## Status Values
- `PENDING` - Awaiting confirmation
- `CONFIRMED` - Confirmed registration
- `ATTENDED` - Attended the event
- `CANCELLED` - Cancelled by user/admin
- `WAITLISTED` - On waitlist (when event full)

## File Structure
```
src/
├── middleware/
│   ├── validateUser.js (user validation)
│   ├── validateRegistration.js (registration validation)
│   ├── authMiddleware.js (JWT verification)
│   ├── errorHandler.js (error handling)
│   └── validateAdmin.js (admin validation)
├── services/
│   ├── userRegistrationService.js (user logic)
│   ├── eventRegistrationService.js (registration logic)
│   └── adminOnboardingService.js (admin logic)
├── controllers/
│   ├── userController.js (user handlers)
│   ├── eventRegistrationController.js (registration handlers)
│   └── adminController.js (admin handlers)
├── routes/
│   ├── users.js (user endpoints)
│   ├── registrations.js (registration endpoints)
│   └── admin.js (admin endpoints)
├── constants/
│   └── errorCodes.js (error definitions)
├── utils/
│   ├── validators.js (validation functions)
│   ├── errors.js (error classes)
│   └── jwt.js (JWT operations)
└── server.js (entry point)
```

## Environment Variables
```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/event_db
NODE_ENV=development
JWT_SECRET=your-secret-key
JWT_ISSUER=gfg-event-management
JWT_AUDIENCE=admin-api
```

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "studentID": "CS2024001",
    "fullName": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "phone": "+919876543210",
    "graduationYear": 2024
  }'
```

### Login User
```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Register for Event
```bash
curl -X POST http://localhost:3000/events/5/registrations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Error Codes
- `INVALID_INPUT` - Bad input provided
- `MISSING_FIELD` - Required field missing
- `INVALID_EMAIL` - Email format invalid
- `INVALID_PASSWORD` - Password doesn't meet requirements
- `UNAUTHORIZED` - Missing/invalid authentication
- `FORBIDDEN` - Not authorized for resource
- `DUPLICATE_EMAIL` - Email already registered
- `DUPLICATE_STUDENT_ID` - StudentID already exists
- `DUPLICATE_USERNAME` - Username already exists
- `USER_NOT_FOUND` - User doesn't exist
- `EVENT_NOT_FOUND` - Event doesn't exist
- `EVENT_FULL` - Event at capacity
- `ALREADY_REGISTERED` - User already registered for event
- `REGISTRATION_NOT_FOUND` - Registration doesn't exist
- `INVALID_STATUS_TRANSITION` - Invalid status change

## Next Steps
1. Create database migration scripts
2. Set up PostgreSQL tables
3. Configure environment variables
4. Run integration tests
5. Deploy to production

## Documentation Files
- `REGISTRATION_API_DOCUMENTATION.md` - Complete API reference
- `IMPLEMENTATION_SUMMARY.md` - Implementation details
- `ADMIN_API_DOCUMENTATION.md` - Admin endpoints (existing)

## Support
For issues or questions, refer to:
1. REGISTRATION_API_DOCUMENTATION.md for endpoint details
2. IMPLEMENTATION_SUMMARY.md for architecture details
3. Error codes in src/constants/errorCodes.js
