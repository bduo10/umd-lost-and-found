# Production Configuration Guide

This file contains the recommended configuration for deploying the backend proxy pattern in production.

## Backend Configuration (application.properties)

### Production Security Settings
```properties
# Cookie Security (Production)
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.same-site=strict

# HTTPS Configuration (Required for secure cookies)
server.ssl.enabled=true
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=${SSL_KEYSTORE_PASSWORD}
server.ssl.key-alias=tomcat

# JWT Security
security.jwt.secret-key=${JWT_SECRET_KEY}
security.jwt.expiration-time=3600000

# Database Security
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}

# Supabase Configuration
supabase.url=${SUPABASE_URL}
supabase.service.key=${SUPABASE_SERVICE_KEY}

# Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${SUPPORT_EMAIL}
spring.mail.password=${APP_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

## Required Code Changes for Production

### 1. Update AuthenticationController Cookie Settings

```java
// In AuthenticationController.java - login method
Cookie jwtCookie = new Cookie("auth-token", jwtToken);
jwtCookie.setHttpOnly(true);
jwtCookie.setSecure(true); // CHANGE: Set to true in production
jwtCookie.setPath("/");
jwtCookie.setMaxAge((int) jwtService.getExpirationTime() / 1000);
jwtCookie.setAttribute("SameSite", "Strict");
```

### 2. Update CORS Configuration

```java
// In SecurityConfig.java - corsConfigurationSource method
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of(
        "https://your-frontend-domain.com" // CHANGE: Use your production domain
    ));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", source);
    return source;
}
```

### 3. Frontend Environment Variables

```env
# Production .env file
VITE_BASE_URL=https://your-backend-domain.com

# Optional: For real-time features only
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Environment Variables Required

### Backend Environment Variables
```bash
# JWT Configuration
JWT_SECRET_KEY=your-super-secure-jwt-secret-key-here

# Database
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/your_db
SPRING_DATASOURCE_USERNAME=your_db_user
SPRING_DATASOURCE_PASSWORD=your_db_password

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here

# Email
SUPPORT_EMAIL=your-support@email.com
APP_PASSWORD=your-app-password

# SSL (if using)
SSL_KEYSTORE_PASSWORD=your-keystore-password
```

## Security Checklist for Production

### ✅ Authentication & Authorization
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Secure flag set on all cookies
- [ ] HttpOnly flag set on authentication cookies
- [ ] SameSite=Strict set on authentication cookies
- [ ] JWT secret key is strong and randomly generated
- [ ] JWT expiration time is reasonable (1-24 hours)

### ✅ CORS Configuration
- [ ] CORS origins restricted to production domains only
- [ ] No wildcard (*) origins in production
- [ ] Credentials enabled for authenticated requests

### ✅ Database Security
- [ ] Database credentials stored as environment variables
- [ ] Supabase service key secured and not exposed
- [ ] Row Level Security (RLS) policies configured
- [ ] Database connection pool configured

### ✅ API Security
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Error messages don't expose sensitive information
- [ ] Logging configured for security events

### ✅ Infrastructure Security
- [ ] Firewall configured to block unnecessary ports
- [ ] Backend not accessible from public internet (behind load balancer)
- [ ] Regular security updates applied
- [ ] Backup and disaster recovery configured

## Monitoring & Alerting

### Key Metrics to Monitor
1. **Authentication Failures**: Failed login attempts
2. **API Errors**: 4xx and 5xx response rates
3. **Response Times**: API endpoint performance
4. **Unusual Access Patterns**: Geographic or time-based anomalies

### Recommended Monitoring Tools
- **Application Monitoring**: Spring Boot Actuator + Micrometer
- **Log Aggregation**: ELK Stack or CloudWatch
- **Security Monitoring**: OWASP ZAP, Snyk
- **Infrastructure**: Prometheus + Grafana

## Deployment Scripts

### Docker Configuration
```dockerfile
# Dockerfile for backend
FROM openjdk:17-jre-slim

# Security: Run as non-root user
RUN groupadd -r spring && useradd -r -g spring spring
USER spring:spring

# Copy application
COPY target/springboot-backend-*.jar app.jar

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run application
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Kubernetes Security
```yaml
# security-context.yaml
apiVersion: v1
kind: Pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 2000
  containers:
  - name: backend
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
```

## Testing in Production

### Security Tests
1. **Authentication**: Test with invalid/expired tokens
2. **Authorization**: Test access to protected resources
3. **CORS**: Test cross-origin requests
4. **XSS Protection**: Test HttpOnly cookie security
5. **Rate Limiting**: Test API rate limits

### Performance Tests
1. **Load Testing**: Concurrent user authentication
2. **Stress Testing**: Peak traffic scenarios
3. **Endurance Testing**: Long-running sessions

### Integration Tests
1. **Frontend-Backend**: Complete authentication flow
2. **Database**: All CRUD operations through proxy
3. **Real-time**: Message delivery and updates
4. **Error Handling**: Graceful failure scenarios

This production configuration ensures maximum security while maintaining the functionality of the backend proxy pattern.
