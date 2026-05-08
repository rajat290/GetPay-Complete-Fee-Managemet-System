# GetPay Education

Enterprise-ready fee collection and payment operations platform for schools, colleges, coaching institutes, and education groups.

GetPay Education helps institutions manage student records, assign fees, collect online and offline payments, reconcile collections, track dues and defaulters, and issue receipts from a single role-based dashboard.

## Repository Description

GetPay Education is a multi-tenant SaaS foundation for institutional fee management. It combines a React admin/student portal with a Node.js, Express, MongoDB, and Razorpay backend. The product is currently focused on education institutions, with a backend architecture that can later support restaurants, hotels, and other payment-led businesses.

Suggested GitHub topics:

```text
saas, fee-management, education-technology, edtech, payments, razorpay, mern, react, nodejs, express, mongodb, multi-tenant, student-fees, receipts, reconciliation
```

## Product Capabilities

### Institution Operations

- Multi-tenant institution isolation through `institutionId`
- Institution profile, billing contact, and branding configuration
- Admin and student role-based access control
- Student onboarding and class-based organization
- Fee template creation and student/class-level assignment
- Bulk fee assignment with duplicate protection
- Academic domain models for branches, sessions, and class groups

### Payment and Finance

- Razorpay order creation and checkout verification
- Webhook-aware payment lifecycle handling
- Online and manual/offline payment recording
- Branded PDF receipt generation using institution settings
- Student fee ledger with assigned, paid, pending, and overdue balances
- Admin dues and defaulters reporting
- Saved reminder campaigns for recurring due follow-up operations
- Reconciliation reports by status, gateway, and payment mode
- Receipt generation and receipt download flow

### Admin Experience

- Admin dashboard for institutional overview
- Institution settings screen for profile, logo, brand color, receipt footer, and billing contact
- Dedicated audit trail and reminder campaign management screens
- Finance workspace for dues, overdue refresh, bulk assignment, CSV export, and reconciliation snapshot
- Payment management with filters, polling, detail modal, and export support
- Student management and fee management screens
- Analytics views for institution-level reporting

### Student Experience

- Secure student login with institution code
- Ledger-based fee payment screen
- Payment history and receipt access
- Branded PDF receipt downloads
- Student profile, notifications, and dashboard views

### Security and Reliability

- JWT authentication
- Password hashing with bcrypt
- Admin/student authorization middleware
- Request validation middleware
- Rate limiting for auth and payment routes
- Security headers for common browser protections
- Institution-scoped database queries for core resources
- Request IDs, structured request logs, and sanitized error logging
- Backend test suite covering domain, payment lifecycle, ledgers, dues, and route behavior
- Frontend lint and production build gates
- GitHub Actions CI for backend tests, frontend lint, and frontend build

## Tech Stack

### Frontend

- React 19
- Vite
- Tailwind CSS
- React Router
- React Icons and Lucide React
- Chart.js and Recharts
- Axios API client
- Route-level lazy loading for production bundle splitting

### Backend

- Node.js
- Express 5
- MongoDB with Mongoose
- JWT authentication
- Razorpay integration
- PDFKit receipt generation
- Institution-branded receipt templates
- Nodemailer email service
- Jest, Supertest, and MongoDB Memory Server for tests

## Project Structure

```text
GetPay/
  backend/
    controllers/       Request handlers
    middleware/        Auth, validation, rate limit, security, error handling
    models/            Mongoose domain models
    routes/            Express route modules
    services/          Payment, ledger, dues, and reporting services
    tests/             Backend unit and route tests
    utils/             Receipt and email utilities
    validators/        Request schemas
    seedDemo.js        Safe demo data upsert script
    server.js          API entrypoint
  frontend/
    src/
      components/      Shared UI components
      context/         Auth and theme providers/context values
      layouts/         Admin and student shell layouts
    pages/           Admin and student screens loaded through route-level chunks
      services/        Axios API client
  render.yaml          Render deployment blueprint
```

## Local Development

### Prerequisites

- Node.js 18 or newer
- MongoDB Atlas or local MongoDB
- Razorpay test credentials
- Optional SMTP credentials for email delivery

### 1. Install Dependencies

From the repository root:

```bash
npm install
cd backend
npm install
cd ../frontend
npm install
```

### 2. Configure Environment

Create backend and frontend environment files from the examples:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Backend `.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/getpay
JWT_SECRET=replace_with_a_long_random_secret
CORS_ORIGIN=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_replace_me
RAZORPAY_KEY_SECRET=replace_me
EMAIL_USER=notifications@example.com
EMAIL_PASS=replace_me
LOG_FORMAT=pretty
LOG_LEVEL=info
```

Frontend `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed Demo Data

Use the safe demo seed. It upserts demo data and does not wipe the database:

```bash
cd backend
npm run seed:demo
```

Demo credentials:

```text
Institution: GETPAY-DEMO
Admin: admin@example.com / admin123
Student: student1_1@example.com / 123456
```

### 4. Start the App

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Default local URLs:

```text
Frontend: http://localhost:5173
Backend: http://localhost:5000
API health: http://localhost:5000/api/health
```

Production deployments can set `LOG_FORMAT=json` so API, database, request, and error events are emitted as structured JSON log lines.

## API Overview

All main API routes are mounted under `/api`.

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/activate-account`
- `GET /api/auth/profile`

### Fees and Student Ledger

- `POST /api/fees/create`
- `POST /api/fees/assign`
- `POST /api/fees/assign-bulk`
- `GET /api/fees`
- `GET /api/fees/assignments`
- `GET /api/fees/my-fees`
- `GET /api/fees/my-ledger`

### Payments

- `POST /api/payments/create-order`
- `POST /api/payments/verify`
- `POST /api/payments/webhook`
- `GET /api/payments/history`

### Admin Finance

- `GET /api/admin/students`
- `GET /api/admin/institution`
- `PATCH /api/admin/institution`
- `POST /api/admin/students`
- `POST /api/admin/students/invite`
- `GET /api/admin/students/:studentId/ledger`
- `GET /api/admin/payments`
- `GET /api/admin/payments/stats`
- `GET /api/admin/payments/recent`
- `GET /api/admin/payments/reconciliation`
- `POST /api/admin/payments/offline`
- `GET /api/admin/classes`
- `GET /api/admin/audit-logs`
- `POST /api/admin/dues/refresh-overdue`
- `GET /api/admin/dues`
- `POST /api/admin/dues/reminders`
- `GET /api/admin/reminder-campaigns`
- `POST /api/admin/reminder-campaigns`
- `PATCH /api/admin/reminder-campaigns/:campaignId`
- `POST /api/admin/reminder-campaigns/:campaignId/run`
- `GET /api/admin/payments/:paymentId`

### Receipts and Notifications

- `GET /api/receipts`
- `GET /api/receipts/download/:paymentId`
- `GET /api/notifications`
- `GET /api/notifications/unread-count`

### Operations

- `GET /api/health`

## Quality Gates

Backend tests:

```bash
cd backend
npm test -- --runInBand
```

Frontend lint:

```bash
cd frontend
npm run lint
```

Frontend production build:

```bash
cd frontend
npm run build
```

Current baseline:

- Backend test suites cover domain models, validation, auth, payment lifecycle, offline payments, reconciliation, bulk fee assignment, dues reports, and student ledgers.
- Frontend lint passes after context/provider cleanup.
- Vite build passes. A large chunk warning may appear until route-level code splitting is added.

## Deployment Notes

The repository includes `render.yaml` as a starting point for Render deployment.

Recommended production settings:

- Set `NODE_ENV=production`
- Use a strong `JWT_SECRET`
- Restrict `CORS_ORIGIN` to the deployed frontend URL
- Use Razorpay live keys only in production secrets
- Use a dedicated production MongoDB database
- Configure SMTP/app-password credentials for receipt email delivery
- Monitor `/api/health` from the hosting platform

## Roadmap Toward Sellable SaaS

### Phase 1: Foundation

- Multi-tenancy and institution scoping
- RBAC and security middleware
- Education domain models
- Validation and error handling
- Test quality gate

### Phase 2: Payments and Finance Operations

- Payment lifecycle hardening
- Offline/manual payment support
- Reconciliation reports
- Student fee ledger
- Bulk fee assignment
- Dues and defaulters reports
- Admin finance workspace
- Student finance experience
- Frontend and local demo quality gates
- Enterprise repository readiness
- Admin audit logging
- Due and overdue reminder operations
- Password reset flow
- Invite-based student onboarding
- Institution settings and branding
- Receipt template customization
- Saved reminder campaigns
- Dedicated audit trail UI
- Route-level frontend code splitting
- CI pipeline for backend tests, frontend lint, and frontend build
- Request IDs and structured backend observability

### Next Priorities

- Error tracking integration such as Sentry or OpenTelemetry

## Repository Status

GetPay Education is moving from prototype to SaaS product foundation. The current focus is education institutions first: schools, colleges, and coaching institutes with online/offline fee collection and finance operations needs.

## License

MIT License.

## Contact

For product, implementation, or partnership discussions:

```text
rajatsinghtomarofficial@gmail.com
```
