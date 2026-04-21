# TimeChime - Version 2 Three-Phase Login System

## Overview
Version 2 implements a single-page application with a three-phase authentication and navigation flow:

1. **Phase 1: Login** - Username and Password entry
2. **Phase 2: OTP Verification** - One-Time Password confirmation (default: 123456)
3. **Phase 3: Dashboard** - Main application interface

---

## Phase 1: Login Screen

### Components
- **Location**: `Phase 1: LOGIN SCREEN` in `index.html`
- **Elements**:
  - Username input field
  - Password input field
  - Submit button
  - Error message display

### Functionality
- User enters credentials (username and password)
- Form validation ensures both fields are filled
- On successful validation, sends login request to `/api/login` endpoint
- Response expected:
  ```json
  {
    "user": {
      "id": 1,
      "username": "user@example.com",
      "email": "user@example.com",
      "empId": 101
    }
  }
  ```
- User data stored in `sessionStorage` under key: `timeChime.currentUser`
- Transitions to **Phase 2: OTP Verification**

### Error Handling
- Shows error messages for:
  - Empty username/password
  - Invalid credentials
  - Server connection issues

---

## Phase 2: OTP Verification

### Components
- **Location**: `Phase 2: OTP VERIFICATION SCREEN` in `index.html`
- **Elements**:
  - OTP input field (6-digit numeric)
  - Verify & Continue button
  - Back to Login button
  - Error message display
  - Hint displaying default OTP

### Functionality
- Default OTP: `123456`
- User enters 6-digit code
- Validates against hardcoded OTP
- On success:
  - Sets session authentication flag: `sessionStorage['timeChime.session'] = 'authenticated'`
  - Transitions to **Phase 3: Dashboard**
- On failure:
  - Shows error message
  - Clears input field
  - Allows retry

### Back Button
- Clears OTP input
- Resets login form
- Returns to Phase 1: Login
- Clears previous errors

---

## Phase 3: Dashboard

### Components
- **Location**: `Phase 3: DASHBOARD SCREEN` in `index.html`
- **Sections**:
  - **Sidebar Navigation**:
    - Dashboard (default active)
    - Organization
    - Projects
    - Calendar
    - Meetings
  - **User Info Panel**:
    - Displays logged-in username
    - Logout button

### Dashboard Content
The main dashboard displays:
- **Today's Schedule**: Upcoming meetings and tasks
- **Active Projects**: Ongoing project status
- **Team Status**: Team members' availability
- **Quick Stats**: Productivity metrics

### Navigation
- Click on sidebar links to switch views
- Active link highlights the current view
- Views are modular and can be populated with data

### Logout
- Clears session storage
- Clears all form data
- Returns to Phase 1: Login
- Resets to login form focus

---

## Data Flow

```
Phase 1: Login
    ↓
  [Submit credentials]
    ↓
  /api/login (Backend)
    ↓
  Store user in sessionStorage
    ↓
Phase 2: OTP
    ↓
  [Enter OTP: 123456]
    ↓
  Verify OTP (Client-side)
    ↓
  Set authentication flag
    ↓
Phase 3: Dashboard
    ↓
  [Navigate between views]
    ↓
  [Click Logout] → Return to Phase 1
```

---

## Session Storage Keys

| Key | Purpose | Value |
|-----|---------|-------|
| `timeChime.session` | Authentication flag | `'authenticated'` |
| `timeChime.currentUser` | User information | JSON object with user details |

---

## Backend API Requirements

### Login Endpoint
**Endpoint**: `POST /api/login`

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response (200)**:
```json
{
  "user": {
    "id": 1,
    "username": "user@example.com",
    "email": "user@example.com",
    "empId": 101
  }
}
```

**Error Response (401)**:
```json
{
  "error": "Invalid credentials"
}
```

---

## CSS Classes

### Phase Containers
- `.phase-container` - Main container for each phase
- `.phase-container.hidden` - Hides a phase (display: none)

### Login Phase
- `.login-card` - Main login container
- `.login-form` - Login form styling
- `.form-error` - Error message styling

### OTP Phase
- `.otp-card` - OTP container
- `.otp-form` - OTP form styling
- `.otp-input-group` - OTP input wrapper
- `.otp-hint` - Hint text styling
- `.back-btn` - Back button styling

### Dashboard
- `.app-shell` - Main dashboard container
- `.sidebar` - Navigation sidebar
- `.main-content` - Main content area
- `.view-container` - Individual view containers
- `.view-container.active` - Currently visible view
- `.dashboard-grid` - Grid layout for dashboard cards
- `.dashboard-card` - Individual dashboard card

---

## JavaScript Functions

### Phase Management
- `hideAllPhases()` - Hides all phase containers
- `showPhase(phaseElement)` - Shows a specific phase
- `clearErrors()` - Clears all error messages

### Authentication
- `loginForm.addEventListener('submit', ...)` - Phase 1 handler
- `otpForm.addEventListener('submit', ...)` - Phase 2 handler
- `backToLoginBtn.addEventListener('click', ...)` - Back button handler
- `logoutBtn.addEventListener('click', ...)` - Logout handler

### Dashboard
- `initializeDashboard()` - Initializes Phase 3
- `loadDashboardData()` - Loads sample dashboard data
- `navLinks.forEach(...)` - Navigation link handlers

---

## Testing Instructions

### Manual Testing

1. **Phase 1: Login**
   - Open application
   - Leave fields empty and submit → Should show error
   - Enter any username and password
   - Click Login → Should transition to Phase 2

2. **Phase 2: OTP**
   - Enter invalid OTP (e.g., "000000")
   - Should show error message
   - Enter OTP: `123456`
   - Should transition to Phase 3: Dashboard

3. **Phase 3: Dashboard**
   - Click sidebar navigation buttons
   - Verify views change
   - Display current username
   - Click Logout
   - Should return to Phase 1

---

## Future Enhancements

- [ ] Connect to actual database (TimeChime database)
- [ ] Implement real OTP generation and sending
- [ ] Add session timeout functionality
- [ ] Implement remember-me option
- [ ] Add password reset flow
- [ ] Add two-factor authentication
- [ ] Integrate with employee data from SQL database
- [ ] Add role-based access control
- [ ] Implement real-time dashboard updates
- [ ] Add user profile settings

---

## Files Structure

```
Version 2/
├── index.html                 # Main HTML with all 3 phases
├── app.js                     # JavaScript for phase management
├── styles.css                 # CSS including phase styles
├── ScheduleTrackerDB.sql      # SQL database schema
├── server.js                  # Backend server (Node.js)
└── PHASE_SETUP.md            # This documentation
```

---

## Database Connection

The TimeChime database should have:
- **Employee Table**: User information
- **Login Table**: Login credentials
- **LoginHistory Table**: Login records

See `ScheduleTrackerDB.sql` for schema details.

---

## Notes

- All authentication is currently session-based
- OTP is hardcoded to `123456` for development
- Error handling provides user-friendly messages
- Transitions between phases are instant
- Session persists until logout or browser close
