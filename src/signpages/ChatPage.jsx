import { useParams } from "react-router-dom";
import ChatLog from "../components/ChatLog";
import Sidebar from "../components/Sidebar";
import Profile from "../components/Profile";
import UserInput from "../components/UserInput";
import { useTheme } from "../contexts/ThemeContext";
import { useState } from "react";
import "../App.css";
import "../css/chatPage.css";
import React from "react";

const ChatPage = ({
  isDropdownOpen,
  toggleDropdown,
  handleUiSettings,
  handleEditProfile,
  showInput,
  onSessionCreated,
  handleLogout
}) => {
  const { session_id } = useParams();
  const { theme } = useTheme();
  const [showSidebar, setShowSidebar] = useState(false);

  // 사이드바 토글 함수
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const sidebarUserMessage = session_id
    ? `Current Session: ${session_id.substring(0, 8)}...`
    : "No active session";  return (
    <div className={`chat-page ${theme}`}>
      <div className="chat-main">
        <div className={`chat-sidebar ${showSidebar ? 'expanded' : ''}`}>
          <Sidebar showsidebarBtn={true} userMessage={sidebarUserMessage} />
        </div>
        <div className="chat-content">
          <ChatLog session_id={session_id} />
        </div>  
        <div className="chat-profile-container">
          <Profile
              isDropdownOpen={isDropdownOpen}
              onToggleDropdown={toggleDropdown}
              onUiSettings={handleUiSettings}
              onEditProfile={handleEditProfile}
              onLogout={handleLogout}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;