import React, { useContext, useEffect, useRef } from "react";
import { useParams } from "react-router-dom"; // 라우트 파라미터 사용
import { useTheme } from "../contexts/ThemeContext";
import { ChatContext } from "../contexts/ChatContext";
import Sidebar from "../components/Sidebar";
import ChatLog from "../pages/ChatLog"; // ChatLog 경로를 signpages/ChatLog로 명확히 지정
import Profile from "../components/Settings/Profile";
import "../App.css";
import "../css/chatPage.css";
import "../css/dark.css";

// ChatPage: 채팅 메인 페이지 컴포넌트
const ChatPage = ({
  isDropdownOpen, // 프로필 드롭다운 상태
  toggleDropdown, // 드롭다운 토글 함수
  handleEditProfile, // 프로필 편집 핸들러
  onSessionCreated, // 세션 생성 콜백
  handleLogout, // 로그아웃 핸들러
}) => {
  const { session_id } = useParams(); // URL에서 세션 ID 추출
  const { theme } = useTheme(); // 테마(다크/라이트) 정보
  const context = useContext(ChatContext); // 채팅 컨텍스트
  const { showSidebar, setShowSidebar } = context; // 사이드바 상태
  const mainRef = useRef(null);

  // 현재 세션 정보 표시용 메시지
  const sidebarUserMessage = session_id
    ? `Current Session: ${session_id.substring(0, 8)}...`
    : "No active session";

  // 사이드바 토글 함수
  const toggleSidebar = () => setShowSidebar((prev) => !prev);

  // 페이지 로드 시 사이드바 상태 초기화
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0; // 페이지 로드 시 스크롤을 맨 위로 이동
    }
    setShowSidebar(false); // 초기 상태에서 사이드바를 숨김
  }, [setShowSidebar]);

  return (
    <div className="chat-main" ref={mainRef}>
      {/* Sidebar를 최상위에 렌더링하여 브라우저 기준 고정 */}
      <div className="chat-log-sidebar">
        <Sidebar
          userMessage={sidebarUserMessage}
          showSidebar={showSidebar}
          toggleSidebar={toggleSidebar}
        />
      </div>
      {/* 채팅 본문 영역: 중첩 chat-main 제거, Wrapper에서 이미 감싸므로 바로 ChatLog만 사용 */}
      <ChatLog session_id={session_id} />
      <div className="chat-log-profile">
        {/* 프로필/설정 영역 */}
        <Profile
          isDropdownOpen={isDropdownOpen}
          onToggleDropdown={toggleDropdown}
          onEditProfile={handleEditProfile}
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
};

export default ChatPage;
