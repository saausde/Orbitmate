// ChatLog.jsx (Wrapper 역할만 수행)
import React from "react";
import ChatLog from "../components/ChatLog";

// chat-main은 ChatPage.jsx에서만 감싸도록 Wrapper에서는 제거
function ChatLogWrapper(props) {
  return <ChatLog {...props} />;
}

export default ChatLogWrapper;
