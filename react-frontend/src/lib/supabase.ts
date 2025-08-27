/**
 * Backend Proxy API for Secure Chat Operations
 * 
 * SECURITY ARCHITECTURE:
 * 1. All Supabase operations go through our Spring Boot backend proxy
 * 2. Frontend never directly accesses Supabase with service keys or JWTs
 * 3. Backend handles authentication via HttpOnly cookies
 * 4. Backend uses Supabase service key for database operations with RLS
 * 5. No sensitive tokens or credentials exposed to frontend
 * 
 * BENEFITS:
 * - ✅ Maximum security: No secrets in frontend code or browser storage
 * - ✅ Centralized auth: All auth logic in backend
 * - ✅ RLS protection: Backend enforces user permissions
 * - ✅ XSS protection: HttpOnly cookies prevent token theft
 * - ✅ Easy auditing: All operations logged in backend
 */

// Keep Supabase client ONLY for potential real-time features
// In production, consider implementing real-time via WebSockets instead
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// This client could be used for real-time features, but all CRUD goes through backend proxy
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Backend API base URL
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080';

// Proxy API functions that use HttpOnly cookies for authentication
export const messageAPI = {
  // Send a new message
  async sendMessage(receiverId: number, content: string): Promise<Message> {
    console.log('=== SENDING MESSAGE ===');
    console.log('Receiver ID:', receiverId);
    console.log('Content:', content);
    
    const response = await fetch(`${BASE_URL}/api/v1/supabase/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        receiver_id: receiverId,
        content: content.trim(),
        is_read: false
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Send message error response:', errorText);
      throw new Error(`Failed to send message: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Send message success:', result);
    return result;
  },

  // Get messages for a conversation
  async getMessages(conversationUserId: number): Promise<Message[]> {
    console.log('=== FETCHING MESSAGES ===');
    console.log('Conversation User ID:', conversationUserId);
    console.log('URL:', `${BASE_URL}/api/v1/supabase/messages?conversationUserId=${conversationUserId}`);
    
    const response = await fetch(
      `${BASE_URL}/api/v1/supabase/messages?conversationUserId=${conversationUserId}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    console.log('Get messages response status:', response.status);
    console.log('Get messages response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Get messages error response:', errorText);
      throw new Error(`Failed to fetch messages: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Get messages success:', result);
    return result;
  },

  // Mark a message as read
  async markAsRead(messageId: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/v1/supabase/messages/${messageId}/read`, {
      method: 'PUT',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to mark message as read');
    }
  },

  // Get all conversations for current user
  async getConversations(): Promise<any[]> {
    const response = await fetch(`${BASE_URL}/api/v1/supabase/conversations`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }

    return await response.json();
  }
};

// Database types for messages
export interface Message {
  id: number;          // Changed from string to number (BIGSERIAL)
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  is_read: boolean;    // Changed from read_at to is_read (matches your table)
}

export interface MessageInsert {
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read?: boolean;   // Added missing field
}

export interface Conversation {
  id: string;
  user1_id: number;
  user2_id: number;
  post_id: string | null;
  last_message_at: string;
  created_at: string;
}
