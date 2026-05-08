# Education Management System — Technical Documentation

> **Stack:** MERN (MongoDB · Express 5 · React 19 · Node.js)  
> **Realtime:** Socket.IO 4  
> **Generated:** May 2026

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Getting Started](#5-getting-started)
6. [Environment Variables](#6-environment-variables)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [API Reference](#8-api-reference)
   - [Health](#81-health)
   - [Users & Registration](#82-users--registration)
   - [Students](#83-students)
   - [Staff](#84-staff)
   - [Admissions](#85-admissions)
   - [Courses](#86-courses)
   - [Course Registrations](#87-course-registrations)
   - [Rooms](#88-rooms)
   - [Bookings](#89-bookings)
   - [Maintenance](#810-maintenance)
   - [Transcripts](#811-transcripts)
   - [Office Hours](#812-office-hours)
   - [Announcements](#813-announcements)
   - [Forum](#814-forum)
   - [Messages](#815-messages)
   - [Meetings](#816-meetings)
   - [Leave Requests](#817-leave-requests)
   - [Assignments](#818-assignments)
9. [Database Schema](#9-database-schema)
10. [Business Logic & Services](#10-business-logic--services)
11. [Realtime (Socket.IO)](#11-realtime-socketio)
12. [Frontend](#12-frontend)
13. [Known Issues & Limitations](#13-known-issues--limitations)

---

## 1. System Overview

The **Education Management System (EMS)** is a full-stack web application that centralises the administrative and academic operations of an educational institution. It supports the following actors:

| Role | Capabilities |
|------|-------------|
| `admin` | Full system access: approve registrations, manage courses/rooms/staff, view audit logs |
| `instructor` / `professor` | Manage announcements, grade students, hold office hours |
| `ta` | Forum moderation, office hours (see role casing note in §13) |
| `student` | Enrol in courses, request meetings, participate in forums, book rooms |
| `staff` | Room booking, leave requests, maintenance reports |
| `parent` | Messaging only |
| `guest` | Read-only public endpoints |

The system exposes a REST API (served under `/api`) and a Socket.IO endpoint for realtime chat and notifications.

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Client (Browser)                   │
│              React 19 + Vite 6  (port 5173)             │
│  /api requests proxied ──────────────────────────────┐  │
└──────────────────────────────────────────────────────┼──┘
                                                       │
┌──────────────────────────────────────────────────────▼──┐
│                  Express 5  (port 8000)                 │
│                                                         │
│  Middleware stack                                       │
│  ├── CORS (configurable origins)                        │
│  ├── express.json()                                     │
│  ├── rateLimiter (per-route)                            │
│  ├── attachUser  (reads x-user-id / x-user-role)       │
│  └── requireRole (per-route guards)                     │
│                                                         │
│  Route modules  /api/*                                  │
│  Controllers → Services → Mongoose Models               │
│                                                         │
│  Socket.IO (same HTTP server)                           │
│  └── Chat rooms keyed by sorted user names             │
└──────────────────────────┬──────────────────────────────┘
                           │ Mongoose 8
┌──────────────────────────▼──────────────────────────────┐
│                     MongoDB Atlas / Local                │
└─────────────────────────────────────────────────────────┘
```

### Request lifecycle

1. Client calls `apiFetch()` which attaches `x-user-id`, `x-user-role`, and `x-user-department` headers from `localStorage`.
2. Express receives the request. `attachUser` middleware populates `req.user` from those headers.
3. `requireRole([...])` guards check `req.user.role`; forbidden requests receive **403**.
4. Controller calls service functions for domain logic, then responds with JSON.
5. Errors bubble to the global `errorHandler` middleware which returns `{ message }` and the appropriate status code.

---

## 3. Technology Stack

### Backend

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^5.2.1 | HTTP framework |
| `mongoose` | ^8.18.0 | MongoDB ODM |
| `socket.io` | ^4.8.3 | Realtime bidirectional events |
| `cors` | ^2.8.6 | Cross-origin resource sharing |
| `dotenv` | ^17.2.2 | Environment variable loading |
| `nodemon` | ^3.1.14 | Dev auto-restart |

### Frontend

| Package | Version | Purpose |
|---------|---------|---------|
| `react` / `react-dom` | ^19.2.5 | UI framework |
| `react-router-dom` | ^7.9.6 | Client-side routing |
| `socket.io-client` | ^4.8.3 | Realtime client |
| `lucide-react` | ^0.555.0 | Icon library |
| `vite` | ^6.0.0 | Build tool / dev server |

---

## 4. Project Structure

```
Education-Management-System/
├── README.md
├── backend/
│   ├── package.json
│   └── src/
│       ├── server.js              # App entry point
│       ├── config/
│       │   └── db.js              # Mongoose connection
│       ├── middleware/
│       │   ├── auth.js            # attachUser, requireRole
│       │   ├── errorHandler.js    # Global error handler
│       │   ├── notFound.js        # 404 fallback
│       │   └── rateLimiter.js     # express-rate-limit configs
│       ├── models/                # Mongoose schemas (see §9)
│       ├── controllers/           # HTTP handler functions
│       ├── services/              # Domain / business logic
│       ├── routes/
│       │   ├── index.js           # Mounts all routers under /api
│       │   └── *.js               # Per-resource routers
│       └── utils/
│           ├── socket.js          # Socket.IO setup & events
│           └── idGenerator.js     # Auto-incrementing ID generation
└── frontend/
    ├── package.json
    ├── vite.config.js             # /api proxy → localhost:8000
    └── src/
        ├── App.jsx                # Route tree + role guards
        ├── api/
        │   ├── http.js            # apiFetch — header injection
        │   └── *.js               # Per-resource fetch helpers
        ├── pages/                 # Screen components
        └── components/            # Reusable UI components
```

---

## 5. Getting Started

```bash
# 1. Install dependencies for both workspaces
cd backend  && npm install
cd ../frontend && npm install

# 2. Configure environment (see §6)
cp backend/.env.example backend/.env   # edit values

# 3. Start backend (default port 8000)
cd backend && npm run dev

# 4. Start frontend (default port 5173)
cd frontend && npm run dev
```

The Vite dev server proxies every `/api/*` request to `http://localhost:8000`, so no explicit API URL is needed in frontend code.

---

## 6. Environment Variables

Create `backend/.env` based on the following:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGO_URI` | Yes | — | MongoDB connection string |
| `PORT` | No | `8000` | HTTP server port |
| `CORS_ORIGIN` | No | `*` | Comma-separated allowed origins |
| `SUPER_ADMIN_EMAIL` | No | — | Email for built-in super-admin login |
| `SUPER_ADMIN_PASSWORD` | No | — | Password for built-in super-admin login |
| `SUPER_ADMIN_NAME` | No | `Super Admin` | Display name for super-admin |

> **Security note:** If `MONGO_URI` is not set the application starts without a database connection; all DB operations will throw errors at runtime.

---

## 7. Authentication & Authorization

### Login flow

`POST /api/users/login` validates credentials and returns a **synthetic token string** (`token_<userId>` or `admin_<timestamp>`) alongside a `user` object. There is **no JWT**. The token is stored in `localStorage` for session persistence only.

### Request authentication

Every subsequent request must include these HTTP headers:

| Header | Value | Notes |
|--------|-------|-------|
| `x-user-id` | MongoDB ObjectId string | `"super-admin"` for the built-in admin |
| `x-user-role` | `student` \| `instructor` \| `admin` \| `staff` \| `professor` \| `ta` \| `parent` \| `guest` | |
| `x-user-department` | Department string | Optional; used for course filtering |

The `attachUser` middleware populates `req.user`:

```js
req.user = {
  id:   req.header("x-user-id")   || null,
  role: req.header("x-user-role") || "guest",
};
```

### Role guard

Routes protected with `requireRole(allowedRoles)` return **403 Forbidden** when `req.user.role` is not in the allowed list.

### Super-admin

If `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` are set, matching credentials at login return `{ role: "admin", id: "super-admin" }` without touching the database.

---

## 8. API Reference

All endpoints are prefixed with `/api`. JSON is the default content type.

Standard error response:

```json
{ "message": "Human-readable error description" }
```

---

### 8.1 Health

#### `GET /api/health`

Returns server health information. No authentication required.

**Response 200**

```json
{
  "status": "ok",
  "uptime": 3600.5,
  "timestamp": "2026-05-08T10:00:00.000Z"
}
```

---

### 8.2 Users & Registration

Base path: `/api/users`

#### `POST /api/users/register`

Create a pending registration application. Public endpoint.

**Request body**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | Yes | |
| `email` | string | Yes | Must be unique |
| `password` | string | Yes | Stored plain-text (see §13) |
| `role` | string | Yes | `student` or `instructor` |
| `department` | string | No | |

**Response 201**

```json
{
  "success": true,
  "message": "Application submitted successfully",
  "applicationId": "<ObjectId>",
  "status": "pending"
}
```

---

#### `POST /api/users/login`

Authenticate a user.

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `email` | string | Yes |
| `password` | string | Yes |

**Response 200**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "token_<userId>",
  "user": {
    "_id": "<ObjectId>",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "student",
    "studentId": "STU-2026-001"
  }
}
```

**Response 401** — Invalid credentials.

---

#### `GET /api/users/application-status/:email`

Check the status of a registration application. Public endpoint.

**Response 200**

```json
{
  "success": true,
  "application": {
    "_id": "<ObjectId>",
    "email": "jane@example.com",
    "role": "student",
    "status": "pending",
    "createdAt": "2026-05-01T09:00:00.000Z",
    "rejectionReason": null
  }
}
```

---

#### `GET /api/users/admin/pending-applications`

List all pending registration applications.

> **Note:** This endpoint currently has no authentication guard. It should be restricted in production.

**Response 200**

```json
{
  "success": true,
  "count": 3,
  "applications": [ /* array of RegistrationApplication documents */ ]
}
```

---

#### `POST /api/users/admin/approve/:applicationId`

Approve a registration application; creates the corresponding `Student` or `Staff` document.

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `adminId` | string | No |

**Response 200** — `{ success, message, user }`

---

#### `POST /api/users/admin/reject/:applicationId`

Reject a registration application.

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `adminId` | string | No |
| `reason` | string | No |

**Response 200** — `{ success, message }`

---

### 8.3 Students

Base path: `/api/students`. All routes require `attachUser`.

#### `GET /api/students`

Search students.

**Query parameters**

| Param | Description |
|-------|-------------|
| `q` | Regex search across `name`, `studentId`, `email`, `department`, `parentEmail` |

**Response 200** — Array of student documents.

---

#### `POST /api/students`

Create a student directly (bypasses the application pipeline). Requires role `admin`.

**Response 201** — Created student document.

---

#### `GET /api/students/:id`

Get a single student by MongoDB `_id`.

**Response 200** — Student document.  
**Response 404** — `{ message: "Student not found" }`

---

#### `PATCH /api/students/:id`

Update student fields. Requires role `admin` or the student themselves (`req.user.id === id`).

**Updatable fields:** `name`, `email`, `department`, `parentEmail`, `password`

**Response 200** — Updated student document.

---

#### `DELETE /api/students/:id`

Delete a student. Requires role `admin`.

**Response 204** — No content.

---

### 8.4 Staff

Base path: `/api/staff`. All routes use `attachUser`.

#### `GET /api/staff`

Search staff members (merges `StaffProfile` and `Staff` collections).

**Query parameters**

| Param | Description |
|-------|-------------|
| `q` | Text search |
| `role` | Filter by role |
| `department` | Filter by department |

**Response 200** — Array of staff objects with a `_type` discriminator field.

---

#### `GET /api/staff/:id`

Get a single staff member by `_id`.

**Response 200** — Staff or StaffProfile document with `_type` field.

---

#### `POST /api/staff`

Create a staff member. Requires role `admin`. Generates a `staffId` automatically.

**Response 201** — Created staff document.

---

#### `PATCH /api/staff/:id`

Update staff fields. Requires role `admin` or the staff member themselves.

**Response 200** — Updated document.

---

#### `DELETE /api/staff/:id`

Delete a staff member. Requires role `admin`.

**Response 204** — No content.

---

### 8.5 Admissions

Base path: `/api/admissions`. All routes use `attachUser`.

#### `POST /api/admissions`

Submit a new admission application (prospective student).

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `applicantName` | string | Yes |
| `email` | string | Yes |
| `phone` | string | No |
| `desiredDepartment` | string | Yes |
| `highSchoolScore` | number | Yes |

**Response 201** — Created `AdmissionApplication` document.

---

#### `GET /api/admissions`

List admission applications. Requires role `admin`.

**Query parameters**

| Param | Description |
|-------|-------------|
| `status` | Filter by `submitted` \| `under-review` \| `accepted` \| `rejected` |

**Response 200** — Array of admission applications.

---

#### `PATCH /api/admissions/:id/status`

Update admission status. Requires role `admin`.

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `status` | string | Yes | One of `submitted`, `under-review`, `accepted`, `rejected` |

**Response 200** — Updated document.

---

### 8.6 Courses

Base path: `/api/courses`. All routes use `attachUser`.

#### `GET /api/courses/requirements`

Retrieve core and elective course requirements. When the caller is a logged-in student their completed courses are subtracted to show remaining requirements.

**Query parameters**

| Param | Description |
|-------|-------------|
| `department` | Filter by department (falls back to `req.user` department) |

**Response 200**

```json
{
  "core": [ /* Course documents */ ],
  "electives": [ /* Course documents */ ],
  "department": "Computer Science"
}
```

---

#### `GET /api/courses/instructor/:instructorId`

List courses assigned to an instructor. `instructorId` must be a valid MongoDB ObjectId.

**Response 200** — Array of course documents.

---

#### `GET /api/courses`

List all courses with optional filters.

**Query parameters**

| Param | Description |
|-------|-------------|
| `department` | Department name |
| `type` | Course type |
| `isActive` | `true` \| `false` |

**Response 200** — Array of course documents.

---

#### `POST /api/courses`

Create a course. Requires role `admin`.

**Required body fields:** `code` (unique), `title`, `department`, `credits`, `type`

**Response 201** — Created course document.

---

#### `GET /api/courses/:id`

Get a single course.

**Response 200** — Course document with populated `prerequisites` and `instructorId`.

---

#### `PATCH /api/courses/:id`

Partially update a course. Requires role `admin`.

**Response 200** — Updated course document.

---

#### `DELETE /api/courses/:id`

Delete a course. Requires role `admin`.

**Response 204** — No content.

---

### 8.7 Course Registrations

Base path: `/api/registrations`. All routes use `attachUser`.

#### `GET /api/registrations`

List registrations with optional filters.

**Query parameters**

| Param | Description |
|-------|-------------|
| `student` | Student ObjectId |
| `course` | Course ObjectId |
| `semester` | Semester string |

**Response 200** — Array of populated registration documents.

---

#### `GET /api/registrations/course/:courseId/students`

List all enrolled students for a given course.

**Response 200** — Array of students.

---

#### `POST /api/registrations`

Enrol a student in a course. Requires role `student` or `admin`.

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `student` | ObjectId | Yes |
| `course` | ObjectId | Yes |
| `semester` | string | Yes |

**Business rules enforced by service:**

- Course must be active
- Course must have available capacity
- Student must have completed all prerequisites
- Student cannot enrol in the same course twice
- Student cannot exceed 18 credits per semester

**Response 201** — Created registration document.  
**Response 400** — `{ message }` describing which rule was violated.

---

#### `PATCH /api/registrations/:id`

Update a registration (e.g. drop a course). Requires role `student` or `admin`.

**Response 200** — Updated document.

---

#### `PATCH /api/registrations/:id/grade`

Assign or update a grade. Requires role `admin` or `instructor`.

For instructors, the service verifies that an `Assignment` record links the instructor to the course being graded.

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `grade` | string | Yes | Letter grade (e.g. `A`, `B+`) |
| `status` | string | Yes | `completed` \| `enrolled` |

**Response 200** — Updated registration document.

---

### 8.8 Rooms

Base path: `/api/rooms`. All routes use `attachUser`.

#### `GET /api/rooms/available`

Find rooms with no approved booking conflicts in the requested window.

**Query parameters (all required unless noted)**

| Param | Required | Description |
|-------|----------|-------------|
| `date` | Yes | ISO date string |
| `startTime` | Yes | `HH:mm` |
| `endTime` | Yes | `HH:mm` |
| `type` | No | Room type filter |
| `building` | No | Building filter |
| `minCapacity` | No | Minimum seating capacity |
| `hasProjector` | No | `true` \| `false` |

**Response 200** — Array of available room documents.

---

#### `GET /api/rooms/status`

List all rooms annotated with current booking status.

**Query parameters (all optional)**

| Param | Description |
|-------|-------------|
| `date` | ISO date (defaults to today) |
| `time` | `HH:mm` (defaults to now) |
| `type` | Room type |
| `building` | Building |

**Response 200** — Array of rooms each with a `status` field (`"booked"` or `"available"`).

---

#### `GET /api/rooms/availability`

Legacy availability endpoint. Requires `date` query parameter.

**Response 200** — Array of rooms with availability flags.

---

#### `GET /api/rooms`

List all rooms, optionally filtered by `type`.

**Response 200** — Array of room documents.

---

#### `POST /api/rooms`

Create a room. Requires role `admin`. The `roomId` field is auto-generated via the `Counter` sequence.

**Response 201** — Created room document.

---

#### `GET /api/rooms/:roomId/timetable`

Retrieve the booking timetable for a room within a date range.

**Query parameters**

| Param | Required | Description |
|-------|----------|-------------|
| `startDate` | Yes | ISO date |
| `endDate` | Yes | ISO date |

**Response 200**

```json
{
  "room": { /* Room document */ },
  "bookings": [ /* RoomBooking documents */ ]
}
```

---

### 8.9 Bookings

Base path: `/api/bookings`. All routes use `attachUser`.

#### `GET /api/bookings/calendar`

Calendar-oriented booking list for a date range.

**Query parameters**

| Param | Required | Description |
|-------|----------|-------------|
| `startDate` | Yes | ISO date |
| `endDate` | Yes | ISO date |
| `roomId` | No | Numeric room ID |
| `type` | No | Room type |
| `building` | No | Building |

**Response 200** — Array of calendar event objects.

---

#### `GET /api/bookings`

List bookings with optional filters.

**Query parameters**

| Param | Description |
|-------|-------------|
| `room` | Numeric `roomId` |
| `bookedByName` | Partial name match |
| `status` | `pending` \| `approved` \| `rejected` |

**Response 200** — Array of booking documents.

---

#### `POST /api/bookings`

Create a room booking. Requires role `staff`, `admin`, `professor`, `ta`, `student`, or `instructor`.

Bookings from `admin`, `staff`, `professor`, and `ta` are **auto-approved**. Others start as `pending`.

**Request body**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `room` | number | Yes | Numeric `roomId` |
| `title` | string | Yes | |
| `bookedByName` | string | Yes | |
| `bookedByRole` | string | Yes | |
| `startsAt` | ISO datetime | Yes | |
| `endsAt` | ISO datetime | Yes | |

**Response 201** — Created booking document.  
**Response 409** — Conflict with an existing approved booking.

---

#### `PATCH /api/bookings/:id/status`

Approve or reject a booking. Requires role `admin`.

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `status` | string | Yes | `approved` or `rejected` |

**Response 200** — Updated booking document.

---

#### `DELETE /api/bookings/:id`

Delete a booking. Requires the same roles as POST.

**Response 204** — No content.

---

### 8.10 Maintenance

Base path: `/api/maintenance`. All routes use `attachUser`.

#### `GET /api/maintenance`

List maintenance reports.

- **Admin / staff:** all reports, filterable by `status`.
- **Other authenticated users:** only their own reports (matched by `req.user.id`). Returns **401** if `req.user.id` is null.

**Query parameters**

| Param | Description |
|-------|-------------|
| `status` | `open` \| `in-progress` \| `resolved` |

**Response 200** — Array of maintenance reports.

---

#### `POST /api/maintenance`

Submit a maintenance report. Requires an authenticated user.

A `maintenance:new` Socket.IO event is broadcast to connected admin sockets on creation.

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `room` | ObjectId | Yes | MongoDB `_id` of the room |
| `issueDescription` | string | Yes | |
| `priority` | string | No | `low` \| `medium` \| `high` |
| `reportedBy` | string | No | Display name |

**Response 201** — Created maintenance report.

---

#### `GET /api/maintenance/open-count`

Get count of open maintenance reports. Requires role `admin`.

**Response 200** — `{ count: 5 }`

---

#### `PATCH /api/maintenance/:id/status`

Update the status of a maintenance report. Requires role `admin` or `staff`.

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `status` | string | Yes | `open` \| `in-progress` \| `resolved` |

**Response 200** — Updated report.

---

### 8.11 Transcripts

Base path: `/api/transcripts`. All routes use `attachUser`.

#### `GET /api/transcripts/:studentId`

Retrieve a student's transcript.

**Query parameters**

| Param | Description |
|-------|-------------|
| `export` | Set to `json` to trigger a file download response |

**Response 200** — Transcript document with embedded records and CGPA.

---

#### `PUT /api/transcripts/:studentId`

Upsert a transcript document. Requires role `admin`.

**Response 200** — Upserted transcript document.

---

#### `POST /api/transcripts/:studentId/generate`

Generate a transcript from all `completed` course registrations that have a grade. Requires role `admin`.

**Response 200** — Generated transcript document.

---

### 8.12 Office Hours

Base path: `/api/office-hours`. All routes use `attachUser`.

#### `POST /api/office-hours`

Create an office-hours slot. Requires role `professor`, `TA`, or `instructor`.

**Request body**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `dayOfWeek` | string | Yes | e.g. `Monday` |
| `startTime` | string | Yes | `HH:mm` format |
| `endTime` | string | Yes | `HH:mm` format |

**Response 201** — Created office-hours document.

---

#### `GET /api/office-hours/:staffId`

List office-hours slots for a staff member. Each slot includes a computed `status` field (`"Available"` or `"Not Available"` based on current day/time).

**Response 200** — Array of office-hour documents with `status`.

---

#### `DELETE /api/office-hours/:id`

Delete an office-hours slot. Requires role `professor`, `TA`, or `instructor`. Owner-only enforcement.

**Response 204** — No content.

---

### 8.13 Announcements

Base path: `/api/announcements`. All routes use `attachUser`.

#### `GET /api/announcements`

List announcements.

**Query parameters**

| Param | Description |
|-------|-------------|
| `course` | Course ObjectId |
| `type` | `general` \| `course` |

**Response 200** — Array of announcement documents.

---

#### `GET /api/announcements/general`

List only general (non-course-specific) announcements.

#### `GET /api/announcements/course/:courseId`

List announcements for a specific course.

#### `GET /api/announcements/instructor/:instructorId`

List announcements created by a specific instructor.

---

#### `POST /api/announcements`

Create an announcement. Requires role `instructor` or `admin`.

**Request body**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | Yes | |
| `body` | string | Yes | |
| `type` | string | Yes | `general` or `course` |
| `course` | ObjectId | Conditional | Required when `type === "course"` |

**Response 201** — Created announcement document.

---

#### `PATCH /api/announcements/:id`

Update an announcement. Requires role `instructor` or `admin`.

**Response 200** — Updated document.

---

#### `DELETE /api/announcements/:id`

Delete an announcement. Requires role `instructor` or `admin`.

**Response 204** — No content.

---

### 8.14 Forum

Base path: `/api/forum`. All routes use `attachUser`.

#### `GET /api/forum/posts`

List forum posts, optionally filtered by `course` (ObjectId).

**Response 200** — Array of `ForumPost` documents.

---

#### `POST /api/forum/posts`

Create a forum post. Requires role `student`, `professor`, or `ta`.

**Response 201** — Created post document.

---

#### `PATCH /api/forum/posts/:postId`

Update a post. Requires role `student`, `professor`, or `ta`.

**Response 200** — Updated post.

---

#### `DELETE /api/forum/posts/:postId`

Delete a post. Requires role `student`, `professor`, or `ta`.

**Response 204** — No content.

---

#### `POST /api/forum/posts/:postId/upvote`

Toggle an upvote on a post. Uses `req.user.id` (as a string) to track voters in the `upvotedBy` array.

**Response 200** — Updated post with new `upvotes` count.

---

#### `GET /api/forum/posts/:postId/replies`

List replies for a post.

**Response 200** — Array of `ForumReply` documents.

---

#### `POST /api/forum/posts/:postId/replies`

Add a reply. Requires role `student`, `professor`, or `ta`.

**Response 201** — Created reply document.

---

#### `POST /api/forum/posts/:postId/replies/:replyId/official`

Mark a reply as the official answer. Requires role `professor` or `ta`.

**Response 200** — Updated reply.

---

### 8.15 Messages

Base path: `/api/messages`. All routes use `attachUser`.

> **Note:** Messages use **display names** (strings), not user ObjectIds, for sender/receiver identification.

#### `POST /api/messages`

Send a message. Requires role `student`, `parent`, `professor`, or `ta`.

**Response 201** — Created `Message` document.

---

#### `GET /api/messages/inbox`

Retrieve messages received by a user.

**Query parameters**

| Param | Required | Description |
|-------|----------|-------------|
| `user` | Yes | Receiver display name |

**Response 200** — Array of messages.

---

#### `GET /api/messages/outbox`

Retrieve messages sent by a user.

**Query parameters**

| Param | Required | Description |
|-------|----------|-------------|
| `user` | Yes | Sender display name |

**Response 200** — Array of messages.

---

#### `GET /api/messages/chats/all`

Get a paginated list of all chats for a user.

**Query parameters**

| Param | Required | Description |
|-------|----------|-------------|
| `user` | Yes | Display name |
| `limit` | No | Default 20 |
| `skip` | No | Default 0 |

**Response 200** — Array of conversation summaries.

---

#### `GET /api/messages/conversation`

Retrieve the full conversation between two users.

**Query parameters**

| Param | Required |
|-------|----------|
| `user` | Yes |
| `otherUser` | Yes |

**Response 200** — Array of messages in chronological order.

---

### 8.16 Meetings

Base path: `/api/meetings`. All routes use `attachUser`.

#### `GET /api/meetings`

List meeting requests.

**Query parameters**

| Param | Description |
|-------|-------------|
| `professorName` | Filter by professor display name |
| `studentName` | Filter by student display name |
| `status` | `pending` \| `approved` \| `rejected` |

**Response 200** — Array of `MeetingRequest` documents.

---

#### `POST /api/meetings`

Create a meeting request. Requires role `student`.

**Response 201** — Created meeting request.

---

#### `PATCH /api/meetings/:id/respond`

Respond to a meeting request. Requires role `professor`.

**Request body** — Passed directly to `findByIdAndUpdate`, e.g.:

```json
{
  "status": "approved",
  "responseNote": "See you at 2 PM."
}
```

**Response 200** — Updated meeting request.

---

### 8.17 Leave Requests

Base path: `/api/leave`. All routes use `attachUser`.

#### `POST /api/leave`

Submit a leave request. Requires any authenticated user.

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `startDate` | ISO date | Yes |
| `endDate` | ISO date | Yes |
| `leaveType` | string | Yes |

**Response 201** — `{ success: true, data: <LeaveRequest> }`

---

#### `GET /api/leave/my`

List the calling user's own leave requests.

**Response 200** — `{ success: true, data: [ ... ] }`

---

#### `GET /api/leave`

List all leave requests. Requires role `admin`.

**Query parameters**

| Param | Description |
|-------|-------------|
| `status` | Filter by status |
| `staffId` | Filter by staff member |
| `page` | Page number (default 1) |
| `limit` | Page size (default 10) |

**Response 200**

```json
{
  "success": true,
  "data": [ /* LeaveRequest documents */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "pages": 5
  }
}
```

---

#### `PUT /api/leave/:id/status`

Approve or reject a leave request. Requires role `admin`.

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `status` | string | Yes | `approved` or `rejected` |
| `reason` | string | No | Rejection reason |

**Response 200** — Updated leave request.

---

### 8.18 Assignments

Base path: `/api/assignments`. All routes are rate-limited (50 requests / 15 min per IP) and use `attachUser`.

#### `POST /api/assignments`

Assign a staff member to a course. Requires role `admin`.

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `staffId` | ObjectId | Yes |
| `courseId` | ObjectId | Yes |

The pair `(staffId, courseId)` must be unique.

**Response 201** — Created assignment document.

---

#### `GET /api/assignments`

List all assignments (paginated). Requires role `admin`.

**Query parameters**

| Param | Description |
|-------|-------------|
| `page` | Page number (default 1) |
| `limit` | Page size (default 10) |

**Response 200** — Paginated assignments with populated staff and course.

---

#### `DELETE /api/assignments/:id`

Remove a staff-course assignment. Requires role `admin`.

**Response 204** — No content.

---

#### `GET /api/assignments/courses`

List active courses for use in dropdowns. Any authenticated user.

**Response 200** — Array of active course documents.

---

#### `GET /api/assignments/staff/:id/courses`

List all courses assigned to a specific staff member.

**Response 200** — `{ data: [ /* Course documents */ ] }`

---

## 9. Database Schema

All collections are managed via Mongoose. The MongoDB connection uses the `MONGO_URI` environment variable.

---

### `RegistrationApplication`

Pending sign-up pipeline. Populated when a user registers; resolved when an admin approves or rejects.

| Field | Type | Constraints |
|-------|------|-------------|
| `name` | String | Required |
| `email` | String | Required, unique |
| `password` | String | Required |
| `role` | String | Enum: `student`, `instructor`, `admin` |
| `department` | String | Optional |
| `status` | String | Enum: `pending`, `approved`, `rejected`; default `pending` |
| `rejectionReason` | String | Optional |
| `approvedAt` | Date | Set on approval |
| `createdAt` | Date | Auto (timestamps) |

---

### `Student`

| Field | Type | Constraints |
|-------|------|-------------|
| `name` | String | Required |
| `email` | String | Required, unique |
| `password` | String | Required |
| `role` | String | Enum: `student`; default `student` |
| `studentId` | String | Sparse unique |
| `department` | String | |
| `parentEmail` | String | |
| `registrationId` | ObjectId → `RegistrationApplication` | |
| Timestamps | | createdAt, updatedAt |

---

### `Staff`

| Field | Type | Constraints |
|-------|------|-------------|
| `name` | String | Required |
| `email` | String | Required, unique |
| `password` | String | Required |
| `role` | String | Enum: `instructor`, `admin` |
| `staffId` | String | Sparse unique |
| `department` | String | |
| `registrationId` | ObjectId → `RegistrationApplication` | |
| Timestamps | | createdAt, updatedAt |

---

### `StaffProfile`

Extended profile for staff members; references `Staff`.

| Field | Type | Constraints |
|-------|------|-------------|
| `userId` | ObjectId → `Staff` | Unique |
| `name` | String | Text-indexed |
| `role` | String | |
| `department` | String | |
| `officeLocation` | String | |
| `phone` | String | |
| Timestamps | | |

---

### `Course`

| Field | Type | Constraints |
|-------|------|-------------|
| `code` | String | Required, unique |
| `title` | String | Required |
| `department` | String | Required |
| `credits` | Number | Required |
| `type` | String | e.g. `core`, `elective` |
| `prerequisites` | [ObjectId → `Course`] | |
| `instructorId` | ObjectId → `Staff` | |
| `capacity` | Number | |
| `enrolled` | Number | Default 0 |
| `isActive` | Boolean | Default true |
| Timestamps | | |

---

### `CourseRegistration`

| Field | Type | Constraints |
|-------|------|-------------|
| `student` | ObjectId → `Student` | Required |
| `course` | ObjectId → `Course` | Required |
| `semester` | String | Required |
| `status` | String | Enum: `enrolled`, `dropped`, `completed`; default `enrolled` |
| `grade` | String | Optional letter grade |
| Timestamps | | |

**Unique index:** `(student, course, semester)`

---

### `Room`

| Field | Type | Constraints |
|-------|------|-------------|
| `roomId` | Number | Auto-generated via `Counter`; unique |
| `name` | String | Required, unique |
| `type` | String | e.g. `lecture`, `lab`, `conference` |
| `building` | String | |
| `capacity` | Number | |
| `hasProjector` | Boolean | Default false |
| Timestamps | | |

---

### `RoomBooking`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `room` | Number | Required | Stores numeric `roomId` (populated via `foreignField: 'roomId'`) |
| `title` | String | Required | |
| `bookedByName` | String | Required | |
| `bookedByRole` | String | Required | |
| `startsAt` | Date | Required | |
| `endsAt` | Date | Required | |
| `status` | String | Enum: `pending`, `approved`, `rejected`; default `pending` | |
| Timestamps | | | |

---

### `MaintenanceReport`

| Field | Type | Constraints |
|-------|------|-------------|
| `room` | ObjectId → `Room` | Required |
| `issueDescription` | String | Required |
| `priority` | String | Enum: `low`, `medium`, `high`; default `medium` |
| `status` | String | Enum: `open`, `in-progress`, `resolved`; default `open` |
| `reportedBy` | String | Display name |
| `reportedById` | String | `req.user.id` (string, not ObjectId) |
| Timestamps | | |

---

### `Transcript`

| Field | Type | Constraints |
|-------|------|-------------|
| `student` | ObjectId → `Student` | Required, unique |
| `records` | [EmbeddedRecord] | |
| `cgpa` | Number | Computed |
| Timestamps | | |

**Embedded `records` subdocument:**

| Field | Type |
|-------|------|
| `course` | ObjectId → `Course` |
| `grade` | String |
| `credits` | Number |
| `semester` | String |

---

### `AdmissionApplication`

| Field | Type | Constraints |
|-------|------|-------------|
| `applicantName` | String | Required |
| `email` | String | Required |
| `phone` | String | |
| `desiredDepartment` | String | Required |
| `highSchoolScore` | Number | Required |
| `status` | String | Enum: `submitted`, `under-review`, `accepted`, `rejected`; default `submitted` |
| Timestamps | | |

---

### `Announcement`

| Field | Type | Constraints |
|-------|------|-------------|
| `title` | String | Required |
| `body` | String | Required |
| `type` | String | Enum: `general`, `course` |
| `instructor` | ObjectId → `Staff` | |
| `course` | ObjectId → `Course` | Required when `type === "course"` |
| Timestamps | | |

---

### `ForumPost`

| Field | Type | Constraints |
|-------|------|-------------|
| `title` | String | Required |
| `body` | String | Required |
| `course` | ObjectId → `Course` | |
| `authorName` | String | |
| `authorRole` | String | |
| `upvotes` | Number | Default 0 |
| `upvotedBy` | [String] | `req.user.id` strings |
| Timestamps | | |

---

### `ForumReply`

| Field | Type | Constraints |
|-------|------|-------------|
| `post` | ObjectId → `ForumPost` | Required |
| `parentReply` | ObjectId → `ForumReply` | Optional (nested replies) |
| `body` | String | Required |
| `authorName` | String | |
| `authorRole` | String | |
| `isOfficialAnswer` | Boolean | Default false |
| Timestamps | | |

---

### `Message`

> Uses display names instead of ObjectId references.

| Field | Type | Constraints |
|-------|------|-------------|
| `senderName` | String | Required |
| `senderRole` | String | |
| `receiverName` | String | Required |
| `receiverRole` | String | |
| `content` | String | Required |
| `read` | Boolean | Default false |
| Timestamps | | |

---

### `MeetingRequest`

> Uses display names instead of ObjectId references.

| Field | Type | Constraints |
|-------|------|-------------|
| `studentName` | String | Required |
| `professorName` | String | Required |
| `requestedTime` | Date | |
| `reason` | String | |
| `status` | String | Enum: `pending`, `approved`, `rejected`; default `pending` |
| `responseNote` | String | |
| Timestamps | | |

---

### `LeaveRequest`

| Field | Type | Constraints |
|-------|------|-------------|
| `staffId` | ObjectId → `Staff` | Required |
| `startDate` | Date | Required |
| `endDate` | Date | Required |
| `leaveType` | String | Required |
| `status` | String | Enum: `pending`, `approved`, `rejected`; default `pending` |
| `reason` | String | Admin rejection reason |
| Timestamps | | |

---

### `Assignment`

Links a staff member to a course (used for grading authorisation).

| Field | Type | Constraints |
|-------|------|-------------|
| `staffId` | ObjectId → `Staff` | Required |
| `courseId` | ObjectId → `Course` | Required |
| `assignedBy` | ObjectId → `Staff` | |
| Timestamps | | |

**Unique index:** `(staffId, courseId)`

---

### `OfficeHour`

| Field | Type | Constraints |
|-------|------|-------------|
| `staffId` | ObjectId → `Staff` | Required |
| `dayOfWeek` | String | Required |
| `startTime` | String | `HH:mm` |
| `endTime` | String | `HH:mm` |
| Timestamps | | |

---

### `AuditLog`

| Field | Type | Constraints |
|-------|------|-------------|
| `action` | String | Required |
| `targetModel` | String | Enum: `LeaveRequest`, `OfficeHour`, `User`, `Staff` |
| `targetId` | ObjectId | Required |
| `performedBy` | ObjectId | Required |
| `details` | Mixed | |
| Timestamps | | |

---

### `Counter`

Used for auto-incrementing numeric IDs.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | String | Key name e.g. `student_2026`, `staff_2026`, `roomId` |
| `seq` | Number | Current sequence value |

---

## 10. Business Logic & Services

### Registration pipeline (`services/users.js`)

1. User submits `POST /api/users/register` → `RegistrationApplication` created with `status: "pending"`.
2. Admin lists pending applications via `GET /api/users/admin/pending-applications`.
3. Admin calls `POST /api/users/admin/approve/:applicationId`.
   - If `role === "student"`: creates `Student` document, generates `studentId` via `idGenerator` + `Counter`.
   - If `role === "instructor"`: creates `Staff` document, generates `staffId`.
   - Application `status` is set to `"approved"`.

### Course enrollment (`services/registrations.js`)

Rules enforced in order on `POST /api/registrations`:

1. Course must exist and be `isActive: true`.
2. Course `enrolled < capacity`.
3. All prerequisite courses must appear in the student's `completed` registrations with a grade.
4. No existing non-dropped registration for `(student, course, semester)`.
5. Total credits already enrolled for the semester + new course credits ≤ 18.

On success: `CourseRegistration` is created; `course.enrolled` is incremented.

### Room & booking conflict detection (`services/rooms.js`, `services/bookings.js`)

A booking conflict exists when another booking for the same room has `status: "approved"` and its time range overlaps with the requested range:

```
existingStart < requestedEnd  AND  existingEnd > requestedStart
```

### Transcript generation (`services/transcripts.js`)

The `POST /api/transcripts/:studentId/generate` endpoint:

1. Queries all `CourseRegistration` documents where `student === studentId`, `status === "completed"`, and `grade` is set.
2. Looks up credit hours from the `Course` document.
3. Converts letter grades to grade points (e.g. `A → 4.0`, `B+ → 3.5`).
4. Computes CGPA as a weighted average.
5. Upserts the `Transcript` document.

### Auto-incrementing IDs (`utils/idGenerator.js`)

Uses MongoDB `findOneAndUpdate` with `$inc` on the `Counter` collection to atomically generate sequential IDs in the format `STU-YYYY-NNN` or `STF-YYYY-NNN`.

---

## 11. Realtime (Socket.IO)

The Socket.IO server shares the same HTTP server as Express.

### CORS

Mirrors the Express `CORS_ORIGIN` environment variable.

### Chat rooms

Chat rooms are keyed by the **alphabetically sorted concatenation** of the two participants' display names (e.g. `alice|bob`). This allows both participants to join the same room without coordination.

### Events

| Event (client → server) | Payload | Server action |
|--------------------------|---------|---------------|
| `join_chat` | `{ user, otherUser }` | Joins the derived room key |
| `send_message` | `{ senderName, senderRole, receiverName, receiverRole, content }` | Persists a `Message` document; emits `receive_message` to the room |

| Event (server → client) | Payload | Trigger |
|--------------------------|---------|---------|
| `receive_message` | Message document | Sent to chat room on new message |
| `maintenance:new` | Maintenance report | Broadcast to all sockets on maintenance report creation |

---

## 12. Frontend

### Routing (`src/App.jsx`)

| Path | Component | Auth | Notes |
|------|-----------|------|-------|
| `/login` | `LoginPage` | Public | |
| `/application` | `ApplicationPage` | Public | Registration form |
| `/home` | `HomePage` | `student`, `instructor` | Role-based dashboard |
| `/profile` | `ProfilePage` | Any authenticated | |
| `/announcements` | `AnnouncementsPage` | Any authenticated | |
| `/chats` | `ChatsPage` | Any authenticated | |
| `/forums` | `ForumsPage` | Any authenticated | |
| `/course-requirements` | `CourseRequirementsPage` | Any authenticated | |
| `/rooms` | `RoomsPage` | Token present | No role restriction |
| `/maintenance` | `MaintenancePage` | Token present | No role restriction |
| `/admin/*` | Admin sub-routes | `admin` | |

### API layer (`src/api/http.js`)

All requests go through `apiFetch(path, options)` which:

1. Reads `user` and `token` from `localStorage`.
2. Attaches headers: `x-user-id`, `x-user-role`, `x-user-department`, `Content-Type: application/json`.
3. Prepends `/api` to the path.
4. Returns the parsed JSON response.

### State management

No external state library (Redux, Zustand, etc.) is used. State is managed locally in components with React `useState` / `useEffect`. User session is persisted in `localStorage`.

---

## 13. Known Issues & Limitations

| # | Area | Issue |
|---|------|-------|
| 1 | **Security** | Passwords are stored and compared in **plain text**. bcrypt hashing must be implemented before production deployment. |
| 2 | **Security** | The authentication scheme (custom headers) is not tamper-proof without a signed JWT or session secret. Any client can forge `x-user-role: admin`. |
| 3 | **Security** | `GET /api/users/admin/pending-applications`, `POST /api/users/admin/approve/:id`, and `POST /api/users/admin/reject/:id` have **no authentication middleware** protecting them. |
| 4 | **Role casing** | The `ta` role is used inconsistently: forum and messaging routes use lowercase `ta`; office-hours middleware uses uppercase `TA`. This will cause **403 errors** for TAs on office-hours endpoints. |
| 5 | **Port mismatch** | `README.md` documents backend port **5000**; `server.js` defaults to **8000**. |
| 6 | **Dead code** | `backend/src/routes/users-new.js` duplicates the users router but is **never mounted**. |
| 7 | **Duplicate export** | `assignmentController.js` defines `getAllCourses` twice. The second definition (active courses only) silently overwrites the first. |
| 8 | **AuditLog enum** | Assignment actions log `targetModel: "Assignment"`, but the `AuditLog` schema enum does not include `"Assignment"`. This causes Mongoose validation errors on audit writes for assignment operations. |
| 9 | **Identity** | `Message` and `MeetingRequest` use display name strings instead of ObjectId references. Renaming a user will break conversation history lookup. |
| 10 | **Super-admin & ObjectIds** | The `"super-admin"` literal id is used in places where a valid ObjectId is expected (e.g. `assignedBy` in Assignments). This may cause Mongoose `CastError` exceptions. |
| 11 | **Missing .env.example** | `backend/.env.example` and `frontend/.env.example` referenced in `README.md` are not present in the repository. |
