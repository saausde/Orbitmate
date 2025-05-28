import React, { useState, useEffect, useContext } from "react";
import "../App.css";
import "../allCss/chatLog.css";
import { ChatContext } from "../contexts/ChatContext";

function ChatLog({ session_id }) {
  const [messages, setMessages] = useState([]); // 메시지 상태 관리
  const [loading, setLoading] = useState(true); // 로딩 상태 관리
  const [error, setError] = useState(null); // 에러 상태 관리
  const [inputMessage, setInputMessage] = useState(""); // 입력값 상태 관리
  const { loadSession } = useContext(ChatContext);

  console.log("세션 ID:", session_id);

  useEffect(() => {
    if (!session_id) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/chat/sessions/${session_id}/messages`
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || data.error || "메시지를 불러오는 데 실패했습니다.");
        setMessages(data);
        loadSession(session_id, data);
      } catch (err) {
        console.error("메시지 불러오기 실패:", err);
        setError(err.message || "메시지를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [session_id, loadSession]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/chat/sessions/${session_id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: inputMessage,
            user_id: localStorage.getItem("user_id"),
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "메시지 전송 실패");

      // 로컬 상태 및 Context 동기화
      const newMessages = [
        ...messages,
        {
          message_id: Date.now(),
          sender_type: "user",
          message_content: inputMessage,
          created_at: new Date().toISOString(),
        },
        {
          message_id: Date.now() + 1,
          sender_type: "ai",
          message_content: data.message,
          created_at: new Date().toISOString(),
        },
      ];
      setMessages(newMessages);
      loadSession(session_id, newMessages);
      setInputMessage("");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="Chat_log">
      {loading && <div className="loading">메시지를 불러오는 중...</div>}
      {error && <div className="error">{error}</div>}

      <div className="message-list">
        {messages.map((msg) => (
          <div key={msg.message_id} className={`message ${msg.sender_type}`}>
            <div className="message-content">
              {msg.message_content}
              {msg.file_path && (
                <a href={msg.file_path} target="_blank" rel="noopener noreferrer">
                  {msg.file_name || "첨부파일"}
                </a>
              )}
            </div>
            <div className="timestamp">
              {new Date(msg.created_at).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <form className="chat-input-container" onSubmit={handleSendMessage}>
        <input
          className="userInput_in_chatlog"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
        />
        <button className="submit_inputValue" type="submit" />
      </form>
    </div>
  );
}

export default ChatLog;
