# Event Registration System

An Express and PostgreSQL based event registration platform for technical association events. It supports student authentication, team creation, event enrollment, QR data generation, moderator workflows, attendance marking, and admin dashboards.

## Features

- User registration and login with JWT authentication
- Team creation and member management
- Event listing and event-specific enrollment
- Team leader controlled registration flow
- Per-participant QR data generation
- Moderator and admin routes
- Attendance marking and CSV export
- Static HTML/CSS/JavaScript frontend served from `public/`

## Tech Stack

| Area | Technology |
| --- | --- |
| Runtime | Node.js |
| API | Express |
| Database | PostgreSQL |
| Auth | JWT, bcryptjs |
| Utilities | QRCode, uuid, json2csv |
| Frontend | Static HTML, CSS, JavaScript |

## Project Structure

```text
event-registration-system/
├── public/                  # Static pages and assets
├── routes/                  # Express route modules
│   ├── admin.js
│   ├── attendance.js
│   ├── auth.js
│   ├── dashboard.js
│   ├── event.js
│   ├── moderator.js
│   └── team.js
├── middleware/
│   └── auth.js              # JWT middleware
├── db.js                    # PostgreSQL connection pool
├── server.js                # App entry point
├── package.json
└── package-lock.json
```

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=5050
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=event_registration
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=change_this_secret
```

## Installation

```bash
npm install
```

## Run

The source entry point is `server.js`.

```bash
node server.js
```

For development with restart-on-change:

```bash
npx nodemon server.js
```

The server runs on:

```text
http://localhost:5050
```

## Main API Routes

| Area | Base Route |
| --- | --- |
| Authentication | `/api/auth` |
| Team Management | `/api/team` |
| Events | `/api/event` |
| Admin | `/api/admin` |
| Moderator | `/api/moderator` |
| Dashboard | `/api/dashboard` |
| Attendance | `/api/attendance` |

## Attendance Export

Attendance can be exported as CSV through:

```text
GET /api/attendance/export?event_id=<event_id>
```

The route returns participant details, attendance status, and timestamps for the selected event.

## Static Pages

The `public/` directory contains the browser-facing pages, including login, registration, event enrollment, dashboards, moderator views, admin views, and informational pages.

## Notes

- Keep `.env` out of source control.
- Confirm the PostgreSQL schema exists before starting the server.
- The current `package.json` scripts reference `index.js`, while the app entry point in this repository is `server.js`. Use `node server.js` unless the scripts are updated.
