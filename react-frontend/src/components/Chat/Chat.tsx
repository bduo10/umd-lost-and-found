import React from 'react';
import { ChatList } from './ChatList';
// import JWTSupabaseTest from './JWTSupabaseTest'; // Uncomment for JWT debugging
import './Chat.css';

const Chat: React.FC = () => {
  return (
    <div className="chat-page">
      <div className="chat-page-container">
        <ChatList />
        {/* Uncomment for JWT debugging: <JWTSupabaseTest /> */}
      </div>
    </div>
  );
};

export default Chat;
