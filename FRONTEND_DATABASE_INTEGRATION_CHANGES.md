# IntelliSeat Frontend Database Integration Changes

## Overview

This document records the frontend changes made to align the IntelliSeat web admin portal and mobile app with the database-integration brief provided on 26 October 2026.

The work focused on replacing fake data shapes, hard-coded values, local-only actions, and display strings sent to APIs with database-friendly records, enum values, IDs, ISO dates, and shared API helpers.

## Web admin portal

### Shared API and authentication foundation

Added [src/api.js](./IntelliseatWebAdmin/IntelliSeat-Admin/src/api.js), which provides:

- A single `request(path, options)` helper for API calls.
- The API base URL from `VITE_API_URL`.
- Automatic JSON headers.
- Bearer-token authentication.
- Token persistence in `sessionStorage`.
- Signed-in user persistence in `sessionStorage`.
- Authentication clearing on logout.
- 401 handling that clears the stored authentication data and emits an unauthorized event.
- Server error extraction from `message` or `error` response fields.

### Shared status mappings

Added [src/statusLabels.js](./IntelliseatWebAdmin/IntelliSeat-Admin/src/statusLabels.js).

The shared mappings cover:

- Clearance:
  - `cleared`
  - `outstanding_fees`
  - `documents_pending`
- Eligibility:
  - `eligible`
  - `needs_review`
- Issues:
  - `open`
  - `in_progress`
  - `resolved`
- Assessments:
  - `upcoming`
  - `in_progress`
  - `completed`

The `labelFor()` helper converts enum values into display labels.

### Shared date and time helpers

Added [src/date.js](./IntelliseatWebAdmin/IntelliSeat-Admin/src/date.js).

The helpers format values using the `Africa/Johannesburg` time zone:

- `formatDate()`
- `formatTime()`
- `formatDateTime()`

### Demo data shape updates

Updated [src/data/demoData.js](./IntelliseatWebAdmin/IntelliSeat-Admin/src/data/demoData.js).

Student records now use:

```js
{
  _id,
  studentNumber,
  firstName,
  lastName,
  email,
  course,
  year,
  clearanceStatus,
  eligibility
}
```

Changes include:

- Replaced `RC2026-...` student numbers with nine-digit numeric strings.
- Removed joined `name` fields.
- Removed the `number` field.
- Removed the `eligible` boolean.
- Changed `year` to a number.
- Changed clearance and eligibility values to enums.
- Added record IDs.

Issue records now include:

```js
{
  _id,
  reporter: {
    _id,
    role,
    name
  },
  description,
  venue,
  seat,
  createdAt,
  status
}
```

Assessment records now include:

```js
{
  _id,
  moduleCode,
  name,
  date,
  startTime,
  endTime,
  venue: {
    _id,
    name
  },
  invigilatorId,
  instructions
}
```

The fake `initialSessions` data was removed.

### Admin application shell

Updated [src/App.jsx](./IntelliseatWebAdmin/IntelliSeat-Admin/src/App.jsx).

Changes include:

- Removed the fake session collection from the application state.
- Updated eligibility changes to use a student `_id`.
- Kept eligibility and clearance as separate fields.
- Added API calls for user invitations, assessments, alerts, issue status updates, and eligibility changes when `VITE_API_URL` is configured.
- Added fallback local behavior for development when no API URL is configured.
- Updated login to receive credentials and store the returned token/user.
- Added logout cleanup for authentication data and application state.
- Replaced the hard-coded top-bar date with the current date.
- Changed notification counts to use unresolved issue counts rather than the number of locally created alerts.
- Changed the top avatar to use the signed-in administrator’s name or email.

### Sidebar identity

Updated [src/components/Sidebar.jsx](./IntelliseatWebAdmin/IntelliSeat-Admin/src/components/Sidebar.jsx).

Changes include:

- Replaced the hard-coded `V` avatar.
- Displayed the first letter of the signed-in administrator’s name.
- Displayed the administrator’s real name or email instead of splitting the email address.

### Login

Updated [src/pages/Login.jsx](./IntelliseatWebAdmin/IntelliSeat-Admin/src/pages/Login.jsx).

Changes include:

- Removed the pre-filled administrator email.
- Sends both email and password to the login handler.
- Handles asynchronous login.
- Disables the sign-in button while the request is running.
- Shows the generic error message:

```text
Incorrect email or password
```

### User creation

Updated [src/pages/CreateUsers.jsx](./IntelliseatWebAdmin/IntelliSeat-Admin/src/pages/CreateUsers.jsx).

Changes include:

- Renamed the number field dynamically to `studentNumber` or `staffNumber`.
- Validates student numbers with:

```text
^\d{9}$
```

- Validates staff numbers with the `INV-` prefix followed by digits.
- Validates institutional email addresses ending in `@richfield.ac.za`.
- Sends separate `firstName` and `lastName` values.
- Sends numeric years.
- Sends enum clearance values.
- Removes the joined `name` field.
- Removes the `eligible` field.
- Does not add a password field.
- Shows an invitation message after a successful request.
- Displays server errors while preserving the form values.
- Disables submission while the request is running.

### Eligibility

Updated [src/pages/Eligibility.jsx](./IntelliseatWebAdmin/IntelliSeat-Admin/src/pages/Eligibility.jsx).

Changes include:

- Uses `eligibility === 'eligible'` instead of a boolean.
- Uses `_id` as the table key.
- Displays names from `firstName` and `lastName`.
- Displays `studentNumber`.
- Displays the mapped clearance label.
- Sends:

```js
onUpdate(studentId, eligibility, reason)
```

- Uses enum eligibility values when approving or sending a student for review.

### Assessments

Updated [src/pages/Assessments.jsx](./IntelliseatWebAdmin/IntelliSeat-Admin/src/pages/Assessments.jsx).

Changes include:

- Sends `moduleCode` and `name` separately.
- Sends the date as `YYYY-MM-DD`.
- Sends separate `startTime` and `endTime` values.
- Validates that the end time is after the start time.
- Uses venue IDs instead of relying on display text.
- Removed the enrolled-student number input.
- Uses an optional invigilator ID field.
- Uses `_id` as the upcoming-assessment key.
- Formats dates for display instead of splitting a display string.
- Removed the old joined `module`, `time`, `location`, and `students` fields.

The current venue and invigilator controls are prepared for API-backed option lists. The invigilator list still needs to be populated from the final backend endpoint.

### Support queue

Updated [src/pages/Support.jsx](./IntelliseatWebAdmin/IntelliSeat-Admin/src/pages/Support.jsx).

Changes include:

- Uses `_id` as the row key.
- Uses the reporter’s name and role.
- Displays venue and seat separately.
- Formats `createdAt`.
- Uses enum issue statuses.
- Treats both `open` and `in_progress` as open issues.
- Adds an `In progress` action.
- Sends issue IDs to the update handler.
- Only changes issue state after the update operation.

### Alerts

Updated [src/pages/Alerts.jsx](./IntelliseatWebAdmin/IntelliSeat-Admin/src/pages/Alerts.jsx).

Changes include:

- Replaced display audience strings with API-friendly values:
  - `all_students`
  - `all_invigilators`
  - `year_students` with a numeric `year`
- Removed client-generated alert times.
- Waits for the create operation before displaying success.
- Displays the server error if alert creation fails.
- Uses `_id` as the recent-alert key.
- Formats server-provided `createdAt` values.
- Added Year 4 to the audience options.
- Preserved the 280-character limit.

### Forgot password

Updated [src/pages/ForgotPassword.jsx](./IntelliseatWebAdmin/IntelliSeat-Admin/src/pages/ForgotPassword.jsx).

Changes include:

- Calls the password-reset request endpoint.
- Shows the same message for every submitted email:

```text
If this email belongs to an admin account, instructions have been sent.
```

- Disables the request button while the request is running.

## Mobile app

### Mobile API helper

Added [api.js](./IntelliSeat-Assessment-System-Codebase/api.js).

The helper provides:

- API base URL support through `EXPO_PUBLIC_API_URL`.
- Bearer-token handling.
- In-memory token storage.
- Browser-compatible local storage when available.
- Token setting and clearing.
- JSON request handling.
- Server error extraction.

### Mobile QR scanning

Updated [ScanStudent.js](./IntelliSeat-Assessment-System-Codebase/screens/invigilator/ScanStudent.js).

Changes include:

- Replaced the old `session` object with an `assessment` object.
- Added assessment `_id`, module code, name, venue, date, start time, and end time.
- Sends the scanned QR value to the backend.
- Sends the assessment ID with the scan request.
- Stops returning the same demo student for every scan.
- Handles invalid or failed scans with an error message.
- Allows scanning again after a failed request.
- Prevents duplicate scan requests while one request is running.
- Keeps the demo student button for development builds only.
- Uses the new student shape with `_id`, separate names, enum eligibility, and a seat object.

The scan request currently uses:

```text
POST /assessments/scan
```

with:

```js
{
  assessmentId,
  qrToken
}
```

This route should be aligned with the final backend route if the server contract uses a different path.

### Mobile project manifest

Added the correctly named [package.json](./IntelliSeat-Assessment-System-Codebase/package.json) because the project originally contained `package.JSON`, while Expo expects `package.json`.

## Validation performed

### Admin portal

The following commands passed:

```text
npm run build
npm run lint
```

The admin portal production build completed successfully, and the linter completed without errors or warnings after the final adjustment.

### Mobile app

The following command passed:

```text
npx expo export --platform android
```

The Android bundle was generated successfully.

Web export was not used for final validation because the mobile project does not currently have the required `react-dom` and `react-native-web` dependencies installed. Android export successfully validated the mobile JavaScript bundle.

## Remaining work and integration notes

The provided brief listed a larger set of screens and backend-dependent behavior. The current implementation establishes the shared foundations and updates the existing screens, but the following items still require additional implementation or final backend contracts:

- React Router-based admin navigation.
- API-backed loading and error states on every admin page.
- API-backed summary data for Overview and Eligibility.
- API-backed reports and date-range filtering.
- API-backed venue option loading.
- API-backed invigilator option loading.
- Admin student list and student detail screens.
- Invigilator list and detail screens.
- Enrollment management.
- Venue and seat management.
- Assessment detail.
- Admin reset-password screen.
- Issue detail and reply history.
- Alert history.
- Full API integration for the remaining mobile screens.
- Mobile auth token persistence using a native secure storage solution for production builds.
- Final alignment of API route names and response shapes with the backend.

The local fallback data remains useful for development when `VITE_API_URL` is not set, but production deployments should provide the real API URL and use the backend responses instead of the demo records.

## API URL convention

Set `VITE_API_URL` and `EXPO_PUBLIC_API_URL` to the backend origin only, for
example `https://api.example.com`. Both frontend helpers add `/api`
automatically and accept an accidentally supplied `/api` suffix without
duplicating it.
