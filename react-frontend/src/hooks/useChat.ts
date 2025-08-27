import { useState, useEffect, useCallback } from 'react';
import { messageAPI, type Message } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface UseChat {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string, receiverId: number, postId?: string | null) => Promise<void>;
  markAsRead: (messageId: number) => Promise<void>;  // Changed from string to number
  isTyping: boolean;
  setTyping: (typing: boolean) => void;
}

export const useChat = (conversationUserId?: number): UseChat => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Load messages for a conversation
  const loadMessages = useCallback(async () => {
    if (!user || !conversationUserId) return;

    try {
      setLoading(true);
      const messages = await messageAPI.getMessages(conversationUserId);
      setMessages(messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [user, conversationUserId]);

  // Send a new message
  const sendMessage = useCallback(async (content: string, receiverId: number, _postId?: string | null) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      await messageAPI.sendMessage(receiverId, content);
      // Immediately reload messages after sending
      await loadMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  }, [user, loadMessages]);

  // Mark message as read
  const markAsRead = useCallback(async (messageId: number) => {
    try {
      await messageAPI.markAsRead(messageId);
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  }, []);

  // Set typing indicator
  const setTyping = useCallback((typing: boolean) => {
    setIsTyping(typing);
  }, []);

  // TODO: Real-time functionality needs to be implemented with WebSockets or similar
  // since we're now using the proxy pattern instead of direct Supabase access
  
  // Subscribe to real-time messages
  useEffect(() => {
    // For now, we'll poll for new messages periodically
    // In production, you should implement WebSocket real-time updates
    
    if (!user || !conversationUserId) return;

    let interval: NodeJS.Timeout;

    const startPolling = () => {
      interval = setInterval(() => {
        // Only poll if the window is visible to reduce unnecessary requests
        if (!document.hidden) {
          loadMessages();
        }
      }, 30000); // Poll every 30 seconds (reduced from 5 seconds)
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Stop polling when tab is not visible
        if (interval) clearInterval(interval);
      } else {
        // Resume polling when tab becomes visible and load latest messages
        loadMessages();
        startPolling();
      }
    };

    // Start initial polling
    startPolling();

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, conversationUserId, loadMessages]);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    isTyping,
    setTyping,
  };
};
