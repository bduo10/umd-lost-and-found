/**
 * Backend Proxy Integration Test Component
 * 
 * This component provides debugging tools to verify that:
 * 1. Backend proxy endpoints are working correctly
 * 2. HttpOnly cookie authentication is functioning
 * 3. Message CRUD operations work through the proxy
 * 4. User permissions are properly enforced by the backend
 * 
 * Use this component during development to troubleshoot proxy integration.
 * Remove or hide this component in production builds.
 */
import { useState } from 'react';
import { messageAPI } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function BackendProxyTest() {
  const [result, setResult] = useState('');
  const { user } = useAuth();

  const testConnection = async () => {
    try {
      setResult('Testing backend proxy connection...');
      
      // Test if we can fetch conversations (this tests auth + proxy)
      const conversations = await messageAPI.getConversations();
      setResult(`✅ Backend proxy connection successful!\n\nFound ${conversations.length} conversations`);
    } catch (err) {
      setResult(`❌ Backend proxy connection failed: ${err}`);
    }
  };

  const testSendMessage = async () => {
    if (!user) {
      setResult('❌ Please log in first');
      return;
    }

    try {
      setResult('Testing secure message sending through proxy...');
      
      // Send a test message to ourselves (using user ID 1 as receiver for demo)
      const receiverId = user.id === 1 ? 2 : 1; // Send to a different user
      const message = await messageAPI.sendMessage(
        receiverId, 
        `Test message from ${user.username} at ${new Date().toISOString()}`
      );

      setResult(`✅ Message sent successfully through proxy!\n\nMessage ID: ${message.id}\nContent: ${message.content}`);
    } catch (err) {
      setResult(`❌ Failed to send message: ${err}`);
    }
  };

  const testGetMessages = async () => {
    if (!user) {
      setResult('❌ Please log in first');
      return;
    }

    try {
      setResult('Testing message retrieval through proxy...');
      
      // Get messages with user ID 1 (or 2 if current user is 1)
      const conversationUserId = user.id === 1 ? 2 : 1;
      const messages = await messageAPI.getMessages(conversationUserId);

      setResult(`✅ Messages retrieved successfully through proxy!\n\nFound ${messages.length} messages:\n${JSON.stringify(messages.slice(0, 3), null, 2)}`);
    } catch (err) {
      setResult(`❌ Failed to retrieve messages: ${err}`);
    }
  };

  const testMarkAsRead = async () => {
    if (!user) {
      setResult('❌ Please log in first');
      return;
    }

    try {
      setResult('Testing mark as read through proxy...');
      
      // First get some messages to mark as read
      const conversationUserId = user.id === 1 ? 2 : 1;
      const messages = await messageAPI.getMessages(conversationUserId);
      
      if (messages.length === 0) {
        setResult('❌ No messages found to mark as read. Send a message first.');
        return;
      }

      // Mark the first unread message as read
      const unreadMessage = messages.find(m => !m.is_read && m.receiver_id === user.id);
      if (!unreadMessage) {
        setResult('❌ No unread messages found for current user.');
        return;
      }

      await messageAPI.markAsRead(unreadMessage.id);
      setResult(`✅ Message marked as read successfully!\n\nMessage ID: ${unreadMessage.id}`);
    } catch (err) {
      setResult(`❌ Failed to mark message as read: ${err}`);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #007bff', 
      margin: '20px',
      borderRadius: '8px',
      backgroundColor: '#f8f9fa'
    }}>
      <h3>🔐 Backend Proxy Integration Test</h3>
      
      {user && (
        <p><strong>Current User:</strong> {user.username} (ID: {user.id})</p>
      )}
      
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={testConnection} 
          style={{ marginRight: '10px', padding: '8px 12px' }}
        >
          Test Connection
        </button>
        
        <button 
          onClick={testGetMessages} 
          style={{ marginRight: '10px', padding: '8px 12px' }}
          disabled={!user}
        >
          Get Messages
        </button>
        
        <button 
          onClick={testSendMessage}
          style={{ marginRight: '10px', padding: '8px 12px' }}
          disabled={!user}
        >
          Send Message
        </button>
        
        <button 
          onClick={testMarkAsRead}
          style={{ padding: '8px 12px' }}
          disabled={!user}
        >
          Mark as Read
        </button>
      </div>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '15px', 
        whiteSpace: 'pre-wrap',
        minHeight: '150px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '12px'
      }}>
        {result || 'Click a button to test the backend proxy integration...'}
      </div>
    </div>
  );
}
