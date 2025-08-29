# UMD Lost and Found

A secure lost-and-found web application for the University of Maryland community. Students, faculty, and staff can post lost/found items and coordinate returns through secure messaging.

**Access the app**: https://umd-lost-and-found.vercel.app/

## Features

- **Post Management**: Create, browse, and manage lost/found item posts with photos
- **Secure Chat**: Direct messaging between posters and finders
- **Search**: Filter by item type, date, and other criteria
- **User Profiles**: View posting history and build community trust
- **Mobile Friendly**: Responsive design for all devices

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Spring Boot + Spring Security  
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT stored in HttpOnly cookies + SameSite + Secure

## Security Features

✅ **Backend Proxy Pattern**: All database operations go through secure backend  
✅ **No Frontend Secrets**: Credentials never stored in browser  
✅ **XSS & CSRF Protection**: HttpOnly + SameSite + Secure cookies prevent token theft  
✅ **User Isolation**: Users can only access their own data  
✅ **Information Disclosure Protection**: Secure logging prevents sensitive data leakage  
✅ **Enhanced Security Headers**: HSTS, frame options, content-type protection  
✅ **Account Deletion**: Secure complete account and data removal  
✅ **Error Handling**: Graceful error handling with user-friendly messages  
✅ **Input Validation**: Server-side validation and sanitization  
✅ **Robust Response Parsing**: Safe JSON parsing with error handling  

## Recent Improvements

### Security Enhancements
- Replaced `System.out.println` with proper SLF4J logging throughout backend
- Sanitized error messages to prevent information disclosure
- Added comprehensive security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Improved account deletion with proper cleanup and validation
- Removed sensitive data exposure in frontend console logs
- Enhanced authentication context with robust error handling

### Bug Fixes & Improvements  
- Fixed empty state handling in Feed and UserFeed components
- Improved JSON response parsing with error recovery
- Enhanced post editing with proper item type selection
- Added request timeouts to prevent hanging requests
- Improved component lifecycle management to prevent memory leaks
- Better error messaging for user experience

### Code Quality
- Cleaned up debugging console.log statements
- Added proper TypeScript types and error handling
- Improved component state management
- Enhanced API response validation## Quick Start

### Prerequisites
- Node.js 18+
- Java 17+
- Maven 3.6+

### Setup
```bash
# Clone repository
git clone <repository-url>
cd umd-lost-and-found

# Backend setup
cd springboot-backend
mvn spring-boot:run

# Frontend setup (in new terminal)
cd react-frontend
npm install
npm run dev
```

## Development

### Running Tests
```bash
# Backend
cd springboot-backend && mvn test

# Frontend  
cd react-frontend && npm test
```



