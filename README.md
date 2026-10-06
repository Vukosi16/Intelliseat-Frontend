# IntelliSeat Admin Portal

A responsive React administrator portal for managing assessment-day operations at Richfield College.

## Features

- Admin sign-in screen and password-reset request screen
- Dashboard overview with assessment sessions, attendance and activity
- Student and invigilator account creation
- Student eligibility search, filtering and status updates
- Assessment scheduling and upcoming-session list
- Attendance and issue reporting
- Support issue tracking and resolution
- Alert composition, audience selection and preview

## Project structure

- `src/App.jsx` owns shared app state and connects the screens.
- `src/pages/` contains the login, dashboard, eligibility, user, assessment, report, support and alert screens.
- `src/components/` contains shared UI such as the sidebar, form fields and authentication layout.
- `src/data/demoData.js` contains the sample navigation and initial records.

Navigation is handled by the app shell, which passes data and callbacks to each page. This keeps each screen independently readable while preserving one connected application.

## Run locally

```sh
npm install
npm run dev
```

Create a production build with `npm run build`, or run the project linter with `npm run lint`.

## Demo behavior

This frontend currently uses in-memory sample data. Signing in with a non-empty email and password opens the dashboard; the forms update the page state for demonstration. Authentication, password reset delivery, persistence, attendance data and account provisioning need to be connected to an API before production use.
