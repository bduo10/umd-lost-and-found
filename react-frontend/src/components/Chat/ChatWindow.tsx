import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../context/AuthContext';
import type { Message } from '../../lib/supabase';
import './ChatWindow.css';

interface ChatWindowProps {
  receiverId: number;
  receiverName: string;
  postId?: string | null;
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  receiverId,
  receiverName,
  postId,
  onClose,
}) => {
  const { user } = useAuth();
  const { messages, loading, error, sendMessage } = useChat(receiverId);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(newMessage, receiverId, postId);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const dateKey = new Date(message.created_at).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return Object.entries(groups).sort(([a], [b]) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
  };

  if (loading) {
    return (
      <div className="chat-window">
        <div className="chat-header">
          <h3>Chat with {receiverName}</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="chat-loading">Loading messages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-window">
        <div className="chat-header">
          <h3>Chat with {receiverName}</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="chat-error">Error: {error}</div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>Chat with {receiverName}</h3>
        <button onClick={onClose} className="close-button">&times;</button>
      </div>

      <div className="chat-messages">
        {messageGroups.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messageGroups.map(([dateKey, dateMessages]) => (
            <div key={dateKey}>
              <div className="date-separator">
                {formatDate(dateKey)}
              </div>
              {dateMessages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${
                    message.sender_id === user?.id ? 'sent' : 'received'
                  }`}
                >
                  <div className="message-content">
                    {message.content}
                  </div>
                  <div className="message-time">
                    {formatTime(message.created_at)}
                    {message.sender_id === user?.id && (
                      <span className={`message-status ${message.is_read ? 'read' : 'sent'}`}>
                        {message.is_read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <div className="chat-input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="chat-input"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="send-button"
          >
            {sending ? '...' : '→'}
          </button>
        </div>
      </form>
    </div>
  );
};
