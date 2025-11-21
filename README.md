# UMD Lost and Found

A secure lost-and-found web application for the University of Maryland community. Students, faculty, and staff can post lost/found items and coordinate returns through secure messaging.

**Access the app**: https://umd-lost-and-found.vercel.app/

**Front Page**: 
<img width="1909" height="903" alt="image" src="https://github.com/user-attachments/assets/94364187-595e-4f44-8a3b-3109a283fb41" />

**Login and Register**:
<img width="1919" height="916" alt="image" src="https://github.com/user-attachments/assets/6cabbf23-804e-4fb1-93a0-d631ada18e13" />
<img width="1911" height="902" alt="image" src="https://github.com/user-attachments/assets/1428cf58-db83-4d6b-8e19-9026a0bc2b9f" />

**Feed (Unregistered User)**:
<img width="1907" height="916" alt="image" src="https://github.com/user-attachments/assets/8dc32170-5496-4266-913d-3faee842d293" />

**Feed (Registered User)**:
<img width="1905" height="920" alt="image" src="https://github.com/user-attachments/assets/387979dd-afc6-4175-8b7a-f61d38aa96c3" />
<img width="1273" height="911" alt="image" src="https://github.com/user-attachments/assets/6312cc9f-7e10-489f-ab6b-38c8c6610f9c" />
<img width="1449" height="912" alt="image" src="https://github.com/user-attachments/assets/b71f1224-4888-4c75-8223-0e76e139f7e4" />

**Creating a Post**:
<img width="788" height="609" alt="image" src="https://github.com/user-attachments/assets/e010742e-6e35-4c36-a02d-fdafe1500c6c" />

**Messaging**:
<img width="1245" height="914" alt="image" src="https://github.com/user-attachments/assets/1bcae0ba-794b-4542-b56e-67ce23a92bb8" />
<img width="1916" height="912" alt="image" src="https://github.com/user-attachments/assets/b04fb6b7-51c3-436c-a0a1-2f63ae673097" />


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


### Security Enhancements
- Sanitized error messages to prevent information disclosure
- Added comprehensive security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Improved account deletion with proper cleanup and validation
- Removed sensitive data exposure in frontend console logs
- Enhanced authentication context with robust error handling



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



