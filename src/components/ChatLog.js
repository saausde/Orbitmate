import React, { useState, useEffect, useContext } from "react";
import { ChatContext } from "../contexts/ChatContext";
import "../App.css";
import '../css/chatPage.css';

function ChatLog({ session_id }) {
  const { chats, loadSession, addMessage } = useContext(ChatContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inputMessage, setInputMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // 사이드바 토글 함수
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // 현재 세션 정보 가져오기
  const currentSession = chats.find(c => c.id === session_id);

  // 세션 변경 시 메시지 자동 로드
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        setError(null);

        // 2. API에서 메시지 조회
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/chat/sessions/${session_id}/messages`
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "메시지 불러오기 실패");
        }

        const data = await response.json();
        
        // 3. 상태 및 컨텍스트 업데이트
        setMessages(data);
        loadSession(session_id, data);

      } catch (err) {
        setError(err.message || "메시지 불러오는 중 오류 발생");
        console.error("메시지 로드 에러:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session_id) loadMessages();
    else setMessages([]);

  }, [session_id, loadSession]); // 의존성 배열에서 currentSession?.messages 제거

  // 메시지 전송 핸들러 (API 4.1)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      
      // 1. 메시지 전송 요청
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/chat/sessions/${session_id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: inputMessage,
            user_id: localStorage.getItem("user_id")
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "메시지 전송 실패");
      }

      const data = await response.json();

      // 2. 서버 응답 기반 메시지 생성
      const newMessages = [
        ...messages,
        {
          message_id: data.user_message_id,
          message_type: "user",
          message_content: inputMessage,
          created_at: new Date().toISOString()
        },
        {
          message_id: data.ai_message_id,
          message_type: "ai",
          message_content: data.message,
          created_at: data.created_at
        }
      ];

      // 3. 상태 및 컨텍스트 동기화
      setMessages(newMessages);
      loadSession(session_id, newMessages);
      setInputMessage("");

    } catch (error) {
      alert(error.message);
    } finally {
      setIsSending(false);
    }
  };

  // 메시지 수정 핸들러 (API 4.2)
  const handleEditMessage = async (messageId) => {
    if (!editedContent.trim()) return;

    try {
      setEditLoading(true);

      // 1. 메시지 수정 요청
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/chat/messages/${messageId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: editedContent }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "메시지 수정 실패");
      }

      const data = await response.json(); // { updatedMessage: { ... } }

      // 2. 상태 업데이트 (수정된 사용자 메시지만 반영)
      let updatedMessages = messages.map(msg =>
        msg.message_id === messageId ? { ...msg, ...data.updatedMessage, message_content: editedContent } : msg // 서버 응답에 모든 필드가 없을 수 있으므로, 기존 msg와 병합하고 message_content를 editedContent로 확실히 설정
      );

      // 3. 수정된 사용자 메시지 다음의 AI 메시지 찾기 및 삭제
      const userMessageIndex = updatedMessages.findIndex(msg => msg.message_id === messageId);
      let nextMessageIsAi = false;
      if (userMessageIndex !== -1 && userMessageIndex + 1 < updatedMessages.length) {
        if (updatedMessages[userMessageIndex + 1].message_type === "ai") {
          nextMessageIsAi = true;
          // AI 메시지 삭제
          updatedMessages.splice(userMessageIndex + 1, 1);
        }
      }

      setMessages(updatedMessages); // 일단 수정된 사용자 메시지와 삭제된 AI 메시지(있었다면) 반영

      // 4. 수정된 사용자 메시지를 기반으로 새로운 AI 응답 요청
      if (nextMessageIsAi || userMessageIndex === updatedMessages.length -1) { // AI 메시지가 있었거나, 수정된 메시지가 마지막 메시지인 경우 AI에게 다시 질문
        setIsSending(true); // AI 응답 로딩 상태 활성화 (isSending 재활용 또는 새 상태 변수 사용)
        const aiResponse = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/chat/sessions/${session_id}/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: editedContent, // 수정된 사용자 메시지 내용
              user_id: localStorage.getItem("user_id")
            }),
          }
        );

        if (!aiResponse.ok) {
          const errorData = await aiResponse.json();
          throw new Error(errorData.error?.message || "AI 응답 재요청 실패");
        }

        const aiData = await aiResponse.json();

        // 새로운 AI 메시지를 기존 메시지 목록에 추가
        // 주의: aiData.user_message_id는 이미 수정된 메시지이므로, AI 응답만 추가합니다.
        // API가 사용자 메시지와 AI 메시지를 함께 반환하는 경우, 중복을 피해야 합니다.
        // 현재 API는 사용자 메시지 전송 시 사용자 메시지 ID와 AI 메시지를 반환하므로, AI 메시지만 사용합니다.
        const newAiMessage = {
          message_id: aiData.ai_message_id,
          message_type: "ai",
          message_content: aiData.message,
          created_at: aiData.created_at
        };
        
        // updatedMessages는 이미 setMessages로 반영되었으므로, 새로운 배열을 만들어야 함
        const finalMessages = [...updatedMessages, newAiMessage];
        setMessages(finalMessages);
        loadSession(session_id, finalMessages);
        setIsSending(false);
      } else {
        // AI 메시지 재생성이 필요 없는 경우 (예: 사용자 메시지 다음에 또 다른 사용자 메시지가 있는 경우)
        loadSession(session_id, updatedMessages);
      }

      setEditingMessageId(null);
      setEditedContent("");

    } catch (error) {
      alert(error.message);
      setIsSending(false); // 에러 발생 시 로딩 상태 해제
    } finally {
      setEditLoading(false);
    }
  };

  // 메시지 삭제 핸들러 (API 4.3)
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      setDeleteLoading(true);
      
      // 1. 메시지 삭제 요청
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/chat/messages/${messageId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "메시지 삭제 실패");
      }

      // 2. 상태 업데이트
      const filteredMessages = messages.filter(msg => msg.message_id !== messageId);
      setMessages(filteredMessages);
      loadSession(session_id, filteredMessages);

    } catch (error) {
      alert(error.message);
    } finally {
      setDeleteLoading(false);
    }
  };
  // 렌더링 부분 수정
  return (
    <div className="Chat_log">
      {/* 모바일 화면에서 보이는 사이드바 토글 버튼 */}
      <button 
        className="sidebar-toggle" 
        onClick={toggleSidebar}
        aria-label="토글 사이드바"
      >
        ☰
      </button>
      
      <div className="message-list">
        {messages.map((msg) => (
          <div key={msg.message_id} className={`message ${msg.message_type}`}>
            {editingMessageId === msg.message_id ? (
              <div className="edit-container">
                <textarea
                  className="edit-input"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                />
                <div className="edit-buttons">
                  <button 
                    className="edit-save-btn"
                    onClick={() => handleEditMessage(msg.message_id)}
                    disabled={editLoading}
                  >
                    저장
                  </button>
                  <button 
                    className="edit-cancel-btn"
                    onClick={() => {
                      setEditingMessageId(null);
                      setEditedContent("");
                    }}
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="message-header">
                  <div className="message-sender">
                    {msg.message_type === "user" ? "User:" : "AI:"}
                  </div>
                  <div className="message-time">
                    {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
                <div className="message-content">
                  <div className="message-text">{msg.message_content}</div>
                  {msg.file_path && (
                    <a className="file-link" href={msg.file_path} target="_blank" rel="noopener noreferrer">
                      {msg.file_name || "첨부파일"}
                    </a>
                  )}
                </div>
                <div className="message-actions">
                  {msg.message_type === "user" && (
                    <button
                      className="action-btn edit-btn"
                      onClick={() => {
                        setEditingMessageId(msg.message_id);
                        setEditedContent(msg.message_content);
                      }}
                    >
                      <span role="img" aria-label="수정">✏️</span>
                    </button>
                  )}
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteMessage(msg.message_id)}
                  >
                    <span role="img" aria-label="삭제">🗑️</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        
        {isSending && (
          <div className="message-loading">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        )}
      </div>

      <form className="chat-input-container" onSubmit={handleSendMessage}>
        <textarea
          className="userInput_in_chatlog"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
          placeholder="메시지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
          disabled={isSending}
        />
        <button 
          className="submit_inputValue" 
          type="submit"
          disabled={isSending}
        >
          {isSending ? "..." : "→"}
        </button>
      </form>
    </div>
  );
}

export default ChatLog;