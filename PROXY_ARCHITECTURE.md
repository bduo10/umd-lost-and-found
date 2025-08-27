# Backend Proxy Pattern Architecture

## Overview

This application now uses a **Backend Proxy Pattern** for maximum security when handling chat operations with Supabase. All sensitive database operations are proxied through the Spring Boot backend, ensuring that no secrets or tokens are exposed to the frontend.

## Security Benefits

### ✅ What We Achieved

1. **No Frontend Secrets**: No JWT tokens, service keys, or other credentials in browser storage
2. **XSS Protection**: HttpOnly cookies prevent token theft via JavaScript injection
3. **Centralized Auth**: All authentication logic is handled by the backend
4. **Audit Trail**: All database operations are logged and can be monitored in the backend
5. **RLS Enforcement**: Backend enforces user permissions before making database calls

### ❌ What We Eliminated

1. **JWT in sessionStorage/localStorage**: Vulnerable to XSS attacks
2. **Direct Supabase access**: Exposed service keys and authentication logic
3. **Client-side token management**: Complex and error-prone authentication state
4. **Frontend security vulnerabilities**: Reduced attack surface

## Architecture Flow

```
Frontend                Backend                 Supabase
--------                -------                 --------
User clicks    ──────>  Verify auth    ──────>  Database
"Send Message"          (HttpOnly cookie)       operation
                        
                        Extract user ID
                        from session
                        
                        Make authenticated
                        request to Supabase
                        using service key
                        
Frontend       <──────  Return response <────── Success/Error
receives result
```

## Implementation Details

### Backend (Spring Boot)

**Controller**: `SupabaseProxyController.java`
- Endpoints: `/api/v1/supabase/*`
- All endpoints require authentication via HttpOnly cookies
- Extracts user ID from authenticated session
- Proxies requests to Supabase with proper user context

**Service**: `SupabaseProxyService.java`
- Handles all Supabase REST API calls
- Uses service key for authentication
- Enforces user permissions at the application level

**Available Endpoints**:
- `POST /api/v1/supabase/messages` - Send message
- `GET /api/v1/supabase/messages?conversationUserId={id}` - Get messages
- `PUT /api/v1/supabase/messages/{id}/read` - Mark message as read
- `GET /api/v1/supabase/conversations` - Get user conversations

### Frontend (React)

**API Client**: `src/lib/supabase.ts`
- `messageAPI` object with methods for all chat operations
- All requests include `credentials: 'include'` for HttpOnly cookies
- No direct Supabase client usage for CRUD operations
- Supabase client only kept for potential future real-time features

**Components Updated**:
- `useChat.ts` - Uses proxy API instead of direct Supabase
- `ChatList.tsx` - Polling instead of real-time subscriptions
- `ChatWindow.tsx` - Already using useChat hook (no changes needed)
- `JWTSupabaseTest.tsx` - Renamed to `BackendProxyTest.tsx`, tests proxy endpoints

## Real-time Updates

**Current State**: Using polling every 5-10 seconds as a temporary solution.

**Recommended Production Solution**: 
Implement WebSocket connections through the backend for real-time chat updates. This maintains the security benefits while providing better user experience.

**Example WebSocket Flow**:
```
Frontend WebSocket ──> Backend WebSocket Server ──> Supabase Real-time
                                │
                                └──> Authenticate connection
                                     Filter messages by user permissions
                                     Forward only authorized updates
```

## Deployment Checklist

### Backend Configuration
- [ ] Supabase URL and service key configured in `application.properties`
- [ ] CORS configured for frontend domain
- [ ] HttpOnly cookie settings configured
- [ ] Session management configured

### Frontend Configuration  
- [ ] `VITE_API_BASE_URL` environment variable set
- [ ] Remove any remaining Supabase environment variables (except for real-time if needed)
- [ ] Test all chat operations through proxy

### Testing
- [ ] Authentication works with HttpOnly cookies
- [ ] All CRUD operations work through proxy
- [ ] User can only access their own messages
- [ ] Error handling works correctly
- [ ] Real-time updates work (polling or WebSocket)

## Migration Notes

### What Changed
1. **Authentication**: Moved from JWT in sessionStorage to HttpOnly cookies
2. **Database Access**: All operations now go through backend proxy
3. **Real-time**: Temporarily using polling instead of direct Supabase subscriptions

### What Stayed the Same
1. **User Interface**: No changes to chat UI components
2. **Business Logic**: Same message sending/receiving functionality
3. **Data Models**: Same message and conversation structures

### Breaking Changes
- Direct Supabase imports in components will no longer work
- JWT token functions are deprecated
- Real-time subscriptions need to be reimplemented via backend

## Performance Considerations

### Pros
- **Reduced Bundle Size**: Less Supabase client code in frontend
- **Better Caching**: Backend can implement sophisticated caching strategies
- **Rate Limiting**: Easier to implement API rate limiting

### Cons
- **Additional Latency**: Extra network hop through backend
- **Server Load**: Backend now handles all database operations
- **Polling Overhead**: Temporary polling solution uses more bandwidth than real-time

### Optimization Opportunities
1. Implement backend caching for frequently accessed conversations
2. Add WebSocket real-time updates
3. Implement message pagination
4. Add compression for large message payloads

## Security Audit

### Regular Security Checks
1. **Monitor Logs**: Check backend logs for unusual access patterns
2. **Test Authentication**: Verify that unauthenticated requests are blocked
3. **Update Dependencies**: Keep backend dependencies up to date
4. **Review Permissions**: Ensure users can only access their own data

### Penetration Testing
- Test for XSS vulnerabilities in message content
- Verify that cookie security flags are set correctly
- Test for SQL injection in message queries
- Verify that user isolation is properly enforced
