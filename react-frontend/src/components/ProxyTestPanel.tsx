/**
 * Development Testing Component
 * 
 * This component helps verify that the backend proxy pattern is working correctly.
 * Add this to your main App component during development to test the integration.
 * 
 * Usage:
 * 1. Import this component in App.tsx
 * 2. Add <ProxyTestPanel /> to your JSX
 * 3. Login to the application
 * 4. Use the test buttons to verify proxy functionality
 * 5. Remove this component before production deployment
 */

import React, { useState } from 'react';
import { messageAPI } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const ProxyTestPanel: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(true);
    setTestResult(`Running ${testName}...`);
    
    try {
      const result = await testFn();
      setTestResult(`✅ ${testName} passed!\n\nResult:\n${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setTestResult(`❌ ${testName} failed!\n\nError: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = () => runTest(
    'Connection Test',
    () => messageAPI.getConversations()
  );

  const testSendMessage = () => runTest(
    'Send Message Test',
    () => messageAPI.sendMessage(user?.id === 1 ? 2 : 1, `Test message at ${new Date().toISOString()}`)
  );

  const testGetMessages = () => runTest(
    'Get Messages Test',
    () => messageAPI.getMessages(user?.id === 1 ? 2 : 1)
  );

  if (!user) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        right: '10px', 
        background: '#fff3cd', 
        border: '1px solid #ffeaa7',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 1000,
        maxWidth: '300px'
      }}>
        <h4>🧪 Proxy Test Panel</h4>
        <p>Please log in to test the backend proxy.</p>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: '#e3f2fd', 
      border: '1px solid #2196f3',
      padding: '15px',
      borderRadius: '8px',
      zIndex: 1000,
      maxWidth: '400px',
      maxHeight: '60vh',
      overflow: 'auto'
    }}>
      <h4>🧪 Proxy Test Panel</h4>
      <p><strong>User:</strong> {user.username} (ID: {user.id})</p>
      
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={testConnection}
          disabled={loading}
          style={{ marginRight: '5px', padding: '5px 10px' }}
        >
          Test Connection
        </button>
        
        <button 
          onClick={testSendMessage}
          disabled={loading}
          style={{ marginRight: '5px', padding: '5px 10px' }}
        >
          Send Test Message
        </button>
        
        <button 
          onClick={testGetMessages}
          disabled={loading}
          style={{ padding: '5px 10px' }}
        >
          Get Messages
        </button>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '10px', 
        borderRadius: '4px',
        border: '1px solid #ddd',
        minHeight: '100px',
        whiteSpace: 'pre-wrap',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        {testResult || 'Click a button to test the backend proxy...'}
      </div>
      
      <p style={{ fontSize: '11px', margin: '10px 0 0 0', color: '#666' }}>
        Remove this component before production deployment.
      </p>
    </div>
  );
};
