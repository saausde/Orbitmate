import React from "react";
import "../App.css";
import "../css/chatPage.css";
import ChatLog from "../components/ChatLog";

// ChatView: 채팅방 Wrapper - 입력/상태/핸들러 없이 ChatLog만 import해서 사용
function ChatView({
  session_id,
  showSidebar,
  toggleSidebar,
  chatlog_back_btn,
}) {
  return (
    <ChatLog
      session_id={session_id}
      showSidebar={showSidebar}
      toggleSidebar={toggleSidebar}
      chatlog_back_btn={chatlog_back_btn}
    />
  );
}

export default ChatView;
