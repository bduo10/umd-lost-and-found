# UMD Lost and Found

A modern, secure lost-and-found web application for the University of Maryland community.

## Features

- **Post Management**: Create, view, and manage lost/found item posts
- **User Profiles**: View user profiles and their posting history  
- **Real-time Chat**: Secure messaging system for coordinating item returns
- **Search & Filter**: Efficient browsing with advanced filtering options
- **Secure Authentication**: HttpOnly cookie-based authentication

## Architecture

This application uses a **Backend Proxy Pattern** for maximum security:

- **Frontend**: React with TypeScript, Vite build system
- **Backend**: Spring Boot with secure Supabase integration
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: HttpOnly cookies (XSS-protected)
- **Chat**: Backend proxy for all database operations

## Security Features

✅ **No Frontend Secrets**: All sensitive credentials stay on the backend  
✅ **XSS Protection**: HttpOnly cookies prevent token theft  
✅ **CSRF Protection**: SameSite cookie settings and CSRF tokens  
✅ **Audit Trail**: All database operations logged in backend  
✅ **User Isolation**: Backend enforces user permissions  

## Quick Start

### Prerequisites
- Node.js 18+
- Java 17+
- Maven 3.6+

### Backend Setup
```bash
cd springboot-backend
mvn spring-boot:run
```

### Frontend Setup
```bash
cd react-frontend
npm install
npm run dev
```

### Environment Variables

**Backend** (`springboot-backend/src/main/resources/application.properties`):
```properties
supabase.url=your-supabase-url
supabase.service.key=your-service-key
```

**Frontend** (`react-frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:8080
```

## Documentation

- [Proxy Architecture Details](./PROXY_ARCHITECTURE.md)
- [Caching Guide](./CACHING_GUIDE.md)

## Development

### Running Tests
```bash
# Backend tests
cd springboot-backend
mvn test

# Frontend tests
cd react-frontend
npm test
```

### Code Quality
- **Backend**: SpotBugs, Checkstyle integration
- **Frontend**: ESLint, TypeScript strict mode
- **Security**: OWASP dependency scanning

## Deployment

See [PROXY_ARCHITECTURE.md](./PROXY_ARCHITECTURE.md) for detailed deployment checklist and security considerations.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Run tests and security checks
4. Submit a pull request

## License

This project is licensed under the MIT License.