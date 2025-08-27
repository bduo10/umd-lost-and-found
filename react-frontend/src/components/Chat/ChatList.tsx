import React, { useState, useEffect } from 'react';
import { messageAPI } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { ChatWindow } from './ChatWindow';
import './ChatWindow.css';

interface Conversation {
  id: string;
  other_user_id: number;
  other_user_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  post_id?: string | null;
}

export const ChatList: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<{
    userId: number;
    userName: string;
    postId?: string | null;
  } | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      try {
        // Use the proxy API to get conversations
        const conversations = await messageAPI.getConversations();
        setConversations(conversations);
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();

    let interval: NodeJS.Timeout;

    const startPolling = () => {
      // TODO: Replace polling with WebSocket real-time updates in production
      interval = setInterval(() => {
        // Only poll if the window is visible to reduce unnecessary requests
        if (!document.hidden) {
          loadConversations(); // Reload conversations periodically
        }
      }, 60000); // Poll every 60 seconds (reduced from 10 seconds)
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Stop polling when tab is not visible
        if (interval) clearInterval(interval);
      } else {
        // Resume polling when tab becomes visible and load latest conversations
        loadConversations();
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
  }, [user]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="chat-list">
        <p>Please log in to view your conversations.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="chat-list">
        <div className="chat-list-header">
          <h2>Messages</h2>
        </div>
        <div className="chat-loading">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-list">
        <div className="chat-list-header">
          <h2>Messages</h2>
        </div>
        
        {conversations.length === 0 ? (
          <div className="no-conversations">
            <p>No conversations yet. Start chatting by contacting someone about their post!</p>
          </div>
        ) : (
          <div className="conversations">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`conversation-item ${
                  selectedChat?.userId === conversation.other_user_id ? 'active' : ''
                }`}
                onClick={() =>
                  setSelectedChat({
                    userId: conversation.other_user_id,
                    userName: conversation.other_user_name,
                    postId: conversation.post_id,
                  })
                }
              >
                <div className="conversation-avatar">
                  {conversation.other_user_name ? 
                    conversation.other_user_name.charAt(0).toUpperCase() : 
                    '?'
                  }
                </div>
                <div className="conversation-content">
                  <div className="conversation-header">
                    <span className="conversation-name">
                      {conversation.other_user_name || 'Unknown User'}
                    </span>
                    <span className="conversation-time">
                      {formatTime(conversation.last_message_time)}
                    </span>
                  </div>
                  <div className="conversation-preview">
                    <span className="last-message">
                      {conversation.last_message.length > 50
                        ? `${conversation.last_message.substring(0, 50)}...`
                        : conversation.last_message}
                    </span>
                    {conversation.unread_count > 0 && (
                      <span className="unread-badge">
                        {conversation.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedChat && (
        <ChatWindow
          receiverId={selectedChat.userId}
          receiverName={selectedChat.userName}
          postId={selectedChat.postId}
          onClose={() => setSelectedChat(null)}
        />
      )}
    </div>
  );
};
