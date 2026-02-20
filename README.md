# GFG Event Management System

A comprehensive event management platform for GeeksforGeeks clubs to manage admin accounts, user registrations, and event operations.

---

## Features

✨ **Admin Management**
- Admin onboarding with invitation codes
- Secure authentication with JWT tokens
- Profile management (update name, phone, password)

📅 **Event Management**
- Create and publish events
- Track event registrations
- Manage event venues and schedules


👥 **User Management**
- Student registration and authentication
- User profiles with branch and university information
- Registration tracking

🔒 **Security**
- Password hashing with bcrypt
- JWT-based authentication
- Input validation and sanitization
- Database transaction support

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher) - [Download](https://nodejs.org/)
- **Git** (for cloning)

---

## Installation

### Step 1: Clone or Download the Project

```bash
# Using git
git clone https://github.com/GeeksForGeeksSIT/event_management.git
cd gfg_event_management

# Or extract the ZIP file and navigate to the folder
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`.

### Step 3: Configure Environment Variables

Run the following command to copy the example environment file:

```bash
cp .env.example .env
```

Then, edit the `.env` file and replace the placeholder values with your actual database credentials and a secure JWT secret.

---

## How to Run

### Development Mode (with auto-reload)

```bash
npm run dev
```

The server will start on `http://localhost:3000`

---

## Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **Validation:** Custom validators
- **Environment:** dotenv

---

## API Documentation

For detailed API documentation, see [ADMIN_API_DOCUMENTATION.md](ADMIN_API_DOCUMENTATION.md)

---

## License

This project is part of the GeeksforGeeks Event Management Initiative.
