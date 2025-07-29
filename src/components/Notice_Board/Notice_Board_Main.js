import { useNavigate, useParams } from "react-router-dom";
import React, { useState, useEffect, useContext, useRef } from "react";
import { ChatContext } from "../../contexts/ChatContext";
import "../../css/Notice_Board.css";
import "../../css/dark.css";
import Notice_Board_icon from "../../images/notice_board_icon.png";
import Profile from "../../components/Settings/Profile";
import Sidebar from "../Sidebar";
import userIcon from "../../images/user-icon.png";
import QnAIcon1 from "../../images/QnAIcon1.png";
import right_arrow from "../../images/right-arrow.png";
import chatBot_icon from "../../images/chatBot_icon.png";
import { useTranslation } from "react-i18next";
import ChatBot from "./ChatBot";
import { useUser } from "../../contexts/UserContext";
import { useLocation } from "react-router-dom";

function Notice_Board_Main() {
  const [chatBot, setchatBot] = useState(false);
  const navigate = useNavigate();
  // 공지사항 목록 상태
  const [notices, setNotices] = useState([]);
  // 다국어 처리 훅
  const { t, i18n } = useTranslation();
  // 현재 언어 상태
  const [lang, setLang] = useState(i18n.language || "ko");
  const { user } = useUser();
  const [showNoticeOrQnA, setShowNoticeOrQnA] = useState(true);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const language = user?.settings?.language;

  //게시글 검색
  const [searchKeyword, setSearchKeyword] = useState("");

  //공지 또는 QnA값 받아오기
  const location = useLocation();
  const is_notice = location.state?.is_notice;

  // 만약 location.state로 계속 바뀔 수 있다면 useEffect로 감지해도 됨
  useEffect(() => {
    if (location.state?.is_notice !== undefined) {
      setShowNoticeOrQnA(location.state.is_notice);
    }
  }, [location.state]);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const handleEditProfile = () => {
    setIsDropdownOpen(false);
    // 프로필 편집 로직 (구현 필요)
  };
  const handleLogout = () => {
    setIsDropdownOpen(false);
    navigate("/signin");
  };

  // 사이드바 컴포넌트에 사용할 변수 선언
  const { session_id } = useParams(); // URL에서 세션 ID 추출
  const context = useContext(ChatContext); // 채팅 컨텍스트
  const { showSidebar, setShowSidebar } = context; // 사이드바 상태
  const mainRef = useRef(null);

  // 사이드바 토글 함수
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

  // 언어 변경 시마다 공지사항 목록 새로고침
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/posts?language=${language}`
        );
        const data = await response.json();
        setNotices(data.data);
      } catch (error) {
        console.error("공지 정보 불러오기 실패:", error);
      }
    };
    fetchSubscription();
  }, [language]);

  // 메인 페이지로 이동
  const goToMain = () => navigate("/");
  // 공지 상세 페이지로 이동
  const goToDetail = (post_id) => navigate(`/notice/${post_id}`);
  // 공지 작성 폼으로 이동
  const goToInsertForm = () => navigate("/insertFormPage");
  // 언어 변경 핸들러
  const questionPage = () => {
    navigate("/toAsk");
  };
  const handleChatBot = () => {
    setchatBot((prev) => !prev);
  };

  return (
    <div className="notice_board_main">
      {/* 헤더 */}
      <header className="head_page">
        <div className="title_section_noticeMain">
          <h1 className="title">
            <a onClick={goToMain}>OrbitMate</a>
          </h1>
          <div className="qna_Notice_f">
            <button onClick={() => setShowNoticeOrQnA(true)}>
              {t("noticeBoard_main.notice")}
            </button>
            <button onClick={() => setShowNoticeOrQnA(false)}>
              {t("noticeBoard_main.qna")}
            </button>
          </div>
        </div>

        <div className="profile_notice_page">
          {/* 프로필 아이콘 */}
          <Profile
            isDropdownOpen={isDropdownOpen}
            onToggleDropdown={toggleDropdown}
            onEditProfile={handleEditProfile}
            onLogout={handleLogout}
          />
        </div>
        <div className="sidebar_notice_page">
          {/* Sidebar를 최상위에 렌더링하여 브라우저 기준 고정 */}
          <Sidebar
            userMessage={sidebarUserMessage}
            showSidebar={showSidebar}
            toggleSidebar={toggleSidebar}
            location={location}
          />
        </div>
        <input
          name="search_box"
          className="search_box"
          placeholder={t("noticeBoard_main.text_placeholder")}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
      </header>

      {/* 본문 */}
      <main className="body_main">
        {showNoticeOrQnA ? (
          <img
            src={Notice_Board_icon}
            alt="공지 아이콘"
            className="notice_icon"
          />
        ) : (
          <img src={QnAIcon1} alt="qna 아이콘" className="notice_icon" />
        )}

        {showNoticeOrQnA ? (
          <h1 className="subtitle">{t("noticeBoard_main.subtitle")}</h1>
        ) : (
          <h1 className="subtitle">{t("noticeBoard_main.qna_subtitle")}</h1>
        )}

        <table border={1} className="table_main">
          <tbody className="table_content">
            {(showNoticeOrQnA
              ? notices.filter((notice) => notice.is_notice)
              : notices.filter((notice) => !notice.is_notice)
            )
              .filter((notice) =>
                notice.subject
                  ?.toLowerCase()
                  .includes(searchKeyword.toLowerCase())
              )
              .map((notice) => (
                <tr key={notice.post_id}>
                  <td
                    className="notice_subject"
                    href={`/notice/${notice.post_id}`}
                  >
                    <a
                      className="notice_subject_text"
                      onClick={(e) => {
                        e.preventDefault();
                        goToDetail(notice.post_id);
                      }}
                    >
                      {notice.subject}
                      <img
                        className="right_arrow"
                        src={right_arrow}
                        alt="right arrow"
                      />
                    </a>
                  </td>
                </tr>
              ))}
          </tbody>
          <tfoot>
            <tr>
              <td id="notice_btn" class="notice_btn" colSpan={5} align="center">
                <input
                  type="button"
                  value={t("noticeBoard_main.back_btn")}
                  onClick={goToMain}
                  className="back_btn"
                />
                {!showNoticeOrQnA && (
                  <button className="Ask_btn" onClick={questionPage}>
                    {t("noticeBoard_main.ask_question_btn")}
                  </button>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </main>
      {/*
      <div id="footer_f">
        <h1 onClick={goToMain}>OrbitMate</h1>
        <ul>
          <li>
            <a onClick={goToMain}>OrbitMate</a>
          </li>
          <li>
            <a>API</a>
          </li>
          <li>
            <a>Service Status</a>
          </li>
          <li>
            <a>Cookie Preferences</a>
          </li>
        </ul>
      </div>

      {/* 챗봇 버튼 
      <button className="chatbot_btn" onClick={handleChatBot} />
      {chatBot && <ChatBot />}*/}
    </div>
  );
}

export default Notice_Board_Main;
