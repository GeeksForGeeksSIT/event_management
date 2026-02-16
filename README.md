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
- **npm** (comes with Node.js)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** (optional, for cloning)

---

## Installation

### Step 1: Clone or Download the Project

```bash
# Using git
git clone <repository-url>
cd gfg_event_management

# Or extract the ZIP file and navigate to the folder
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`.

### Step 3: Configure Environment Variables

Create a `.env` file in the project root with the following variables:

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=gfg_event_management
JWT_SECRET=your_secret_key_here
```

Replace the values with your actual database credentials and a secure JWT secret.

---

## How to Run

### Development Mode (with auto-reload)

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Production Mode

```bash
npm start
```

---

## Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **Validation:** Custom validators
- **Environment:** dotenv

---

## License

This project is part of the GeeksforGeeks Event Management Initiative.
