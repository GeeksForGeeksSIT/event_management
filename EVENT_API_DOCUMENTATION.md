# Event Management API Documentation

## Overview
This API provides comprehensive event management functionality for admins including creating events, publishing them, tracking registrations, and managing venues.

## Base URL
```
http://localhost:3000/events
```

## Authentication
All event management endpoints require admin authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Event Endpoints

### 1. Create Event
**POST** `/events`

Creates a new event in draft status.

**Request Body:**
```json
{
  "eventName": "Tech Conference 2026",
  "description": "Annual technology conference for students",
  "startTime": "2026-03-15T09:00:00",
  "endTime": "2026-03-15T17:00:00",
  "maxSlots": 200,
  "registrationFee": 50.00,
  "venueID": 1,
  "status": "Draft"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "EventID": 1,
    "EventName": "Tech Conference 2026",
    "Description": "Annual technology conference for students",
    "StartTime": "2026-03-15T09:00:00.000Z",
    "EndTime": "2026-03-15T17:00:00.000Z",
    "MaxSlots": 200,
    "Status": "Draft",
    "RegistrationFee": 50.00,
    "IsPublished": false,
    "VenueID": 1,
    "CreatedAt": "2026-02-21T10:30:00.000Z"
  }
}
```

**Validations:**
- Event name, start time, end time, and venue ID are required
- Max slots cannot exceed venue capacity
- End time must be after start time
- Venue must exist

---

### 2. Get All Events
**GET** `/events`

Retrieves all events with optional filters.

**Query Parameters:**
- `status` (optional): Filter by event status (Draft, Active, Completed, Cancelled)
- `isPublished` (optional): Filter by published status (true/false)
- `venueID` (optional): Filter by venue ID

**Example Request:**
```
GET /events?status=Active&isPublished=true
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "EventID": 1,
      "EventName": "Tech Conference 2026",
      "Description": "Annual technology conference",
      "StartTime": "2026-03-15T09:00:00.000Z",
      "EndTime": "2026-03-15T17:00:00.000Z",
      "MaxSlots": 200,
      "Status": "Active",
      "RegistrationFee": 50.00,
      "IsPublished": true,
      "VenueID": 1,
      "CreatedAt": "2026-02-21T10:30:00.000Z",
      "VenueName": "Main Auditorium",
      "Location": "Building A, Floor 2",
      "Capacity": 300,
      "CurrentRegistrations": 45
    }
  ]
}
```

---

### 3. Get Event by ID
**GET** `/events/:id`

Retrieves detailed information about a specific event.

**Example Request:**
```
GET /events/1
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "EventID": 1,
    "EventName": "Tech Conference 2026",
    "Description": "Annual technology conference",
    "StartTime": "2026-03-15T09:00:00.000Z",
    "EndTime": "2026-03-15T17:00:00.000Z",
    "MaxSlots": 200,
    "Status": "Active",
    "RegistrationFee": 50.00,
    "IsPublished": true,
    "VenueID": 1,
    "CreatedAt": "2026-02-21T10:30:00.000Z",
    "VenueName": "Main Auditorium",
    "Location": "Building A, Floor 2",
    "Capacity": 300,
    "CurrentRegistrations": 45
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "EVENT_NOT_FOUND",
    "message": "Event not found",
    "details": null,
    "timestamp": "2026-02-21T10:30:00.000Z"
  }
}
```

---

### 4. Update Event
**PUT** `/events/:id`

Updates event details. Cannot update published events with existing registrations.

**Request Body (all fields optional):**
```json
{
  "eventName": "Updated Tech Conference",
  "description": "Updated description",
  "startTime": "2026-03-20T09:00:00",
  "endTime": "2026-03-20T17:00:00",
  "maxSlots": 250,
  "registrationFee": 60.00,
  "venueID": 2,
  "status": "Active"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Event updated successfully",
  "data": {
    "EventID": 1,
    "EventName": "Updated Tech Conference",
    "Description": "Updated description",
    "StartTime": "2026-03-20T09:00:00.000Z",
    "EndTime": "2026-03-20T17:00:00.000Z",
    "MaxSlots": 250,
    "Status": "Active",
    "RegistrationFee": 60.00,
    "IsPublished": false,
    "VenueID": 2,
    "CreatedAt": "2026-02-21T10:30:00.000Z"
  }
}
```

**Restrictions:**
- Cannot update published events that have confirmed registrations
- All validations from create event apply

---

### 5. Publish Event
**POST** `/events/:id/publish`

Publishes an event, making it visible and available for user registration.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Event published successfully",
  "data": {
    "EventID": 1,
    "EventName": "Tech Conference 2026",
    "IsPublished": true,
    "Status": "Active"
  }
}
```

**Requirements:**
- Event must have venue, start time, and end time
- Event cannot already be published

**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "INCOMPLETE_EVENT",
    "message": "Event must have venue, start time, and end time to be published",
    "details": null,
    "timestamp": "2026-02-21T10:30:00.000Z"
  }
}
```

---

### 6. Unpublish Event
**POST** `/events/:id/unpublish`

Unpublishes an event, hiding it from users.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Event unpublished successfully",
  "data": {
    "EventID": 1,
    "EventName": "Tech Conference 2026",
    "IsPublished": false,
    "Status": "Draft"
  }
}
```

---

### 7. Delete Event
**DELETE** `/events/:id`

Deletes an event. Cannot delete events with confirmed registrations.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

**Error Response (409):**
```json
{
  "success": false,
  "error": {
    "code": "EVENT_HAS_REGISTRATIONS",
    "message": "Cannot delete event with confirmed registrations",
    "details": null,
    "timestamp": "2026-02-21T10:30:00.000Z"
  }
}
```

---

### 8. Get Event Registrations
**GET** `/events/:id/registrations`

Retrieves all registrations for a specific event.

**Success Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "RegID": 1,
      "UserID": 10,
      "EventID": 1,
      "RegDate": "2026-02-20T14:30:00.000Z",
      "RegStatus": "confirmed",
      "FullName": "John Doe",
      "Email": "john@example.com",
      "StudentID": "CS2024001",
      "Phone": "+919876543210",
      "PaymentStatus": "completed",
      "Amount": 50.00,
      "TransactionRef": "TXN123456789",
      "PaymentMode": "online"
    }
  ]
}
```

---

## Venue Endpoints

### 9. Get All Venues
**GET** `/events/venues/all`

Retrieves all available venues.

**Success Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "VenueID": 1,
      "VenueName": "Main Auditorium",
      "Location": "Building A, Floor 2",
      "Capacity": 300,
      "CreatedAt": "2026-01-15T10:00:00.000Z"
    },
    {
      "VenueID": 2,
      "VenueName": "Conference Room 1",
      "Location": "Building B, Floor 3",
      "Capacity": 50,
      "CreatedAt": "2026-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### 10. Get Venue by ID
**GET** `/events/venues/:id`

Retrieves detailed information about a specific venue.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "VenueID": 1,
    "VenueName": "Main Auditorium",
    "Location": "Building A, Floor 2",
    "Capacity": 300,
    "CreatedAt": "2026-01-15T10:00:00.000Z"
  }
}
```

---

## Event Status Values

- `Draft`: Event is being created/edited
- `Active`: Event is published and accepting registrations
- `Completed`: Event has finished
- `Cancelled`: Event was cancelled

---

## Registration Status Values

- `pending`: Registration awaiting confirmation/payment
- `confirmed`: Registration confirmed
- `cancelled`: Registration cancelled
- `waitlisted`: User on waiting list

---

## Error Codes

### Event Errors
- `EVENT_NOT_FOUND`: Event does not exist
- `EVENT_ALREADY_PUBLISHED`: Event is already published
- `EVENT_NOT_PUBLISHED`: Event is not published
- `EVENT_HAS_REGISTRATIONS`: Event has existing registrations
- `INCOMPLETE_EVENT`: Event details are incomplete

### Venue Errors
- `VENUE_NOT_FOUND`: Venue does not exist
- `INVALID_MAX_SLOTS`: Max slots exceed venue capacity

### Validation Errors
- `INVALID_TIME_RANGE`: End time must be after start time
- `NO_UPDATE_FIELDS`: No valid fields provided for update

### Authentication Errors
- `UNAUTHORIZED`: Missing or invalid authentication token
- `FORBIDDEN`: Insufficient permissions

---

## Example Usage Flow

### 1. Create a Draft Event
```bash
POST /events
{
  "eventName": "Workshop on AI",
  "description": "Introduction to AI and ML",
  "startTime": "2026-04-10T14:00:00",
  "endTime": "2026-04-10T16:00:00",
  "maxSlots": 50,
  "registrationFee": 0,
  "venueID": 2,
  "status": "Draft"
}
```

### 2. Review and Update If Needed
```bash
PUT /events/1
{
  "maxSlots": 60,
  "description": "Updated description"
}
```

### 3. Publish the Event
```bash
POST /events/1/publish
```

### 4. Track Registrations
```bash
GET /events/1/registrations
```

### 5. View Event Details
```bash
GET /events/1
```

---

## Notes

- All timestamps are in ISO 8601 format
- All monetary values are in decimal format
- Admin authentication is required for all endpoints
- Events cannot be deleted if they have confirmed registrations
- Published events with registrations cannot be modified
- Venue capacity is automatically validated against max slots

---

## Database Schema Reference

### Event Table
- EventID (PK)
- EventName
- Description
- StartTime
- EndTime
- MaxSlots
- Status (Draft, Active, Completed, Cancelled)
- RegistrationFee
- IsPublished (boolean)
- VenueID (FK)
- CreatedAt

### Venue Table
- VenueID (PK)
- VenueName
- Location
- Capacity
- CreatedAt

### Registration Table
- RegID (PK)
- UserID (FK)
- EventID (FK)
- RegDate
- RegStatus (pending, confirmed, cancelled, waitlisted)
