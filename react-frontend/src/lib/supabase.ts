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

// Backend API base URL
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8080';

// Proxy API functions that use HttpOnly cookies for authentication
export const messageAPI = {
  // Send a new message
  async sendMessage(receiverId: number, content: string): Promise<Message> {
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

    if (!response.ok) {
      console.error('Failed to send message');
      throw new Error(`Failed to send message: ${response.status}`);
    }

    const result = await response.json();
    return result;
  },

  // Get messages for a conversation
  async getMessages(conversationUserId: number): Promise<Message[]> {
    const response = await fetch(
      `${BASE_URL}/api/v1/supabase/messages?conversationUserId=${conversationUserId}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch messages');
      throw new Error(`Failed to fetch messages: ${response.status}`);
    }

    const result = await response.json();
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
