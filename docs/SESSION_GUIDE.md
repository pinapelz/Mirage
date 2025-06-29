# Session Management Guide

This guide explains how to use the session-based authentication system implemented in the backend.

## Overview

The backend now supports persistent login sessions using:
- **express-session** for server-side session management
- **HTTP-only cookies** for secure session storage
- **Database session tracking** with automatic cleanup
- **CSRF protection** through HTTP-only cookies

## Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update the `SESSION_SECRET` in your `.env` file with a secure random string:
```
SESSION_SECRET="your-very-secure-secret-key-change-this-in-production-make-it-long-and-random"
```

## API Endpoints

### Authentication Endpoints

#### Register User
- **POST** `/api/register`
- **Body**: `{ username, password, name, email }`
- **Response**: User data + session created
- **Sets**: HTTP-only session cookie

#### Login
- **POST** `/api/authenticate`
- **Body**: `{ username, password }`
- **Response**: User data + session created
- **Sets**: HTTP-only session cookie

#### Logout
- **POST** `/api/logout`
- **Requires**: Valid session
- **Response**: Success message
- **Clears**: Session cookie and database sessions

### Session Management

#### Check Session Status
- **GET** `/api/session`
- **Response**: `{ authenticated: boolean, user?: UserData }`
- **Use**: Check if user is still logged in

#### Get Current User
- **GET** `/api/me`
- **Requires**: Valid session
- **Response**: Current user data

## Frontend Integration

### Making Authenticated Requests

Always include credentials in your fetch requests:

```javascript
// Example fetch with credentials
const response = await fetch('http://localhost:5000/api/me', {
  method: 'GET',
  credentials: 'include', // This is crucial!
  headers: {
    'Content-Type': 'application/json',
  }
});
```

### Login Flow Example

```javascript
// Login
const loginResponse = await fetch('http://localhost:5000/api/authenticate', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'user@example.com',
    password: 'password123'
  })
});

if (loginResponse.ok) {
  const userData = await loginResponse.json();
  console.log('Logged in:', userData);
  // Session cookie is automatically set
}
```

### Check Authentication Status

```javascript
// Check if user is still logged in
const sessionResponse = await fetch('http://localhost:5000/api/session', {
  method: 'GET',
  credentials: 'include'
});

const sessionData = await sessionResponse.json();
if (sessionData.authenticated) {
  console.log('User is logged in:', sessionData.user);
} else {
  console.log('User is not logged in');
}
```

### Logout

```javascript
// Logout
const logoutResponse = await fetch('http://localhost:5000/api/logout', {
  method: 'POST',
  credentials: 'include'
});

if (logoutResponse.ok) {
  console.log('Logged out successfully');
  // Session cookie is automatically cleared
}
```

## Security Features

### Session Security
- **HTTP-only cookies**: Prevents XSS attacks
- **Secure cookies**: Enabled in production (HTTPS)
- **SameSite protection**: Prevents CSRF attacks
- **Session expiration**: 24-hour automatic expiry

### Database Sessions
- Sessions are stored in the database for server-side validation
- Expired sessions are automatically cleaned up every hour
- User logout removes all sessions for that user

### Password Security
- Passwords are hashed with bcrypt (12 rounds)
- Unique salt per user for additional security
- Original password never stored

## Middleware

### `requireAuth` Middleware
Protects routes that need authentication:

```javascript
app.get('/api/protected-route', requireAuth, (req, res) => {
  // req.user contains the authenticated user data
  const user = req.user;
  res.json({ message: 'This is protected', user });
});
```

## Production Considerations

### Environment Variables
```env
SESSION_SECRET="your-production-secret-minimum-32-characters-long"
NODE_ENV="production"
FRONTEND_URL="https://yourdomain.com"
```

### Security Settings
In production, ensure:
1. `SESSION_SECRET` is a strong, unique string
2. `secure: true` in cookie settings (HTTPS only)
3. Proper CORS origin configuration
4. HTTPS enabled for your domain

### Database
- Consider using PostgreSQL or MySQL instead of SQLite
- Implement database connection pooling
- Set up database backups

## Troubleshooting

### Common Issues

1. **Session not persisting**: Make sure `credentials: 'include'` is set in frontend requests
2. **CORS errors**: Verify CORS origin matches your frontend URL
3. **Session expires immediately**: Check system time and session expiration settings
4. **Authentication fails after server restart**: Sessions are stored in database, so they should persist

### Debug Session Issues

Check session status:
```javascript
fetch('http://localhost:5000/api/session', {
  credentials: 'include'
}).then(r => r.json()).then(console.log);
```

### Clear All Sessions
If you need to force logout all users:
```sql
DELETE FROM Session;
```

## Database Schema

The session system adds a `Session` table:

```prisma
model Session {
  id        String   @id @default(cuid())
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  expiresAt DateTime
}
```

Sessions are automatically linked to users and cleaned up when users are deleted.