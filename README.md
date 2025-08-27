# UMD Lost and Found

A secure lost-and-found web application for the University of Maryland community. Students, faculty, and staff can post lost/found items and coordinate returns through secure messaging.

## Features

- **Post Management**: Create, browse, and manage lost/found item posts with photos
- **Secure Chat**: Direct messaging between posters and finders
- **Smart Search**: Filter by item type, date, and other criteria
- **User Profiles**: View posting history and build community trust
- **Mobile Friendly**: Responsive design for all devices

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Spring Boot + Spring Security  
- **Database**: Supabase (PostgreSQL)
- **Authentication**: HttpOnly cookies + SameSite + Secure

## Security Features

✅ **Backend Proxy Pattern**: All database operations go through secure backend  
✅ **No Frontend Secrets**: Credentials never stored in browser  
✅ **XSS & CSRF Protection**: HttpOnly + SameSite + Secure cookies prevent token theft  
✅ **User Isolation**: Users can only access their own data## Quick Start

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

**Access the app**: http://localhost:5173

### Configuration

**Backend** - `springboot-backend/src/main/resources/application.properties`:
```properties
supabase.url=your-supabase-url
supabase.service.key=your-service-key
```

**Frontend** - `react-frontend/.env`:
```env
VITE_BASE_URL=http://localhost:8080
```

## Development

### Running Tests
```bash
# Backend
cd springboot-backend && mvn test

# Frontend  
cd react-frontend && npm test
```



