// App: 라우팅, 전역 컨텍스트, 메인 UI/모달/프로필/채팅 등 전체 앱 구조 관리
import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import propTypes from "prop-types";
// 주요 컴포넌트 import (경로 일치 확인)
import EasterEgg from "./components/TitleSection/EasterEgg";
import BackgroundParticles from "./components/TitleSection/BackgroundParticles";
import Titlesection from "./components/TitleSection/Titlesection";
import UserInput from "./components/UserInput";
import Sidebar from "./components/Sidebar";
import Profile from "./components/Settings/Profile";
import Modal from "./components/TitleSection/Modal";
import Modalicon from "./components/TitleSection/Modalicon";
//공지 및 QnA 임포트 ----------------------------------------------------------------------
import Notice_Board from "./components/Notice_Board/Notice_Board_Main";
import Notice_Board_InsertForm from "./components/Notice_Board/Notice_Board_InsertForm";
import NoticeDetail from "./components/Notice_Board/NoticeDetail";
import ToAskPage from "./components/Notice_Board/ToAskPage";
import QnA_InsertForm from "./components/QnA/QnA_InsertForm";
import QnA_Main from "./components/QnA/QnA_Main";
import QnA_Detail from "./components/QnA/QnA_Detail";
//----------------------------------------------------------------------------------
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SignupSun from "./pages/Signup-step2";
import ChatPage from "./pages/ChatPage";
import AdminPage from "./components/Admin/AdminPage";
import Page404 from "./pages/Page404";
import "./components/Settings/Language";
import AboutUs from "./components/AboutUs";
//구독창 임포트 ----------------------------------------------------------------------
import SubscriptionMain from "./components/Subscription/SubscriptionMain";
import Plus from "./components/Subscription/PaymentForSubscriptions/Plus";
import PaymentSuccess from "./components/Subscription/PaymentForSubscriptions/PaymentSuccess";
import CancelSubscription from "./components/Subscription/CancelSubscription";
//----------------------------------------------------------------------------------
// 이미지/아이콘 import
import iconTrigger1 from "./images/news.png";
import iconTrigger2 from "./images/you.png";
import iconTrigger3 from "./images/weather_icon2.png";
import iconTrigger4 from "./images/shop.png";
// 컨텍스트 import
import { UserProvider } from "./contexts/UserContext";
import { ChatProvider, ChatContext } from "./contexts/ChatContext";
import { useUser } from "./contexts/UserContext";
import { useTranslation } from "react-i18next";
import SearchChatList from "./components/SearchChatList";

// UserInput prop-types 설정
UserInput.propTypes = {
  onSessionCreated: propTypes.func.isRequired,
};
UserInput.defaultProps = {
  onSessionCreated: () => console.warn("핸들러 미등록"),
};

// AppContent: 라우팅/메인 UI/핸들러 등 앱 핵심 구조
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  // 주요 상태
  const [showInput, setShowInput] = useState(false); // 채팅 입력창 표시 여부
  const [currentSessionId, setCurrentSessionId] = useState(null); // 현재 세션 ID
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 프로필 드롭다운
  const [notices, setNotices] = useState([]); // 공지 리스트 상태
  const { showSidebar, setShowSidebar } = useContext(ChatContext); // 사이드바 상태
  const { user } = useUser(); // 사용자 정보
  const { i18n } = useTranslation(); // 언어 정보

  //사이드바 검색창 띄우기

  // 뒤로가기 등으로 진입 시 상태 초기화
  useEffect(() => {
    if (location.pathname === "/") {
      if (location.state?.hideStart) {
        setShowInput(true);
        setShowSidebar(true);
      } else {
        setShowInput(false);
        setShowSidebar(false);
      }
      // setCurrentSessionId(null); // 필요에 따라 유지/초기화
    } else {
      setShowInput(false);
      setShowSidebar(false);
      setCurrentSessionId(null);
    }
  }, [location.pathname, location.state]);

  useEffect(() => {
    const lang = user?.settings?.language;
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [user?.settings?.language]);

  // 드롭다운 토글
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  // 모달 상태 및 핸들러
  const [modalStates, setModalStates] = useState({
    isModal1Open: false,
    isModal2Open: false,
    isModal3Open: false,
    isModal4Open: false,
  });
  // 모달 열기
  const openModal = (modalNum) => {
    setModalStates((prevStates) => ({
      ...prevStates,
      [`isModal${modalNum}Open`]: true,
    }));
  };
  // 모달 닫기
  const closeModal = (modalNum) => {
    setModalStates((prevStates) => ({
      ...prevStates,
      [`isModal${modalNum}Open`]: false,
    }));
  };
  // 트리거 아이콘 데이터
  const triggerIconsData = [
    { id: 1, iconUrl: iconTrigger1, openModal: () => openModal(1) },
    { id: 2, iconUrl: iconTrigger2, openModal: () => openModal(2) },
    { id: 3, iconUrl: iconTrigger3, openModal: () => openModal(3) },
    { id: 4, iconUrl: iconTrigger4, openModal: () => openModal(4) },
  ];

  // 세션 생성 핸들러
  const handleSessionCreated = useCallback(
    (sessionId, inputValue) => {
      setCurrentSessionId(sessionId);
      setShowInput(true);
      setShowSidebar(true);
      navigate(`/chat/${sessionId}`, { state: { inputValue } });
    },
    [navigate]
  );

  // 시작 버튼 핸들러
  const handleStartClick = () => {
    setShowInput(true);
    setShowSidebar(true);
  };

  const handleEditProfile = () => {
    setIsDropdownOpen(false);
    // 프로필 편집 로직 (구현 필요)
  };
  const handleLogout = () => {
    setIsDropdownOpen(false);
    navigate("/signin");
  };

  // 공지 추가 핸들러
  const addNotice = (newNotice) => {
    setNotices((prev) => [...prev, newNotice]);
  };

  // 세션 생성 및 라우팅 핸들러
  const handleUserInputSubmit = async (inputText) => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
      alert("로그인 후 이용해주세요.");
      navigate("/signin");
      return;
    }
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/chat/sessions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id, title: inputText, category: "일반" }),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "세션 생성에 실패했습니다.");
        return;
      }
      const sessionId = json.data.session_id;
      setCurrentSessionId(sessionId);
      setShowInput(true);
      setShowSidebar(true);
      navigate(`/chat/${sessionId}`);
    } catch (err) {
      alert("세션 생성 오류: " + (err.message || "서버 오류"));
    }
  };

  // [렌더링] 전체 라우팅 및 메인 UI 구조
  const hideStart = location.state?.hideStart;
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div id="Main">
            {/* 파티클 배경 (cobweb 타입, 색상 prop은 라이브러리 한계로 미적용) */}
            <BackgroundParticles type="cobweb" />
            {/* 타이틀 섹션: 항상 렌더링, hideStart은 prop으로 전달 */}
            <Titlesection
              onStartClick={handleStartClick}
              hideStart={hideStart}
              forceAnimated={hideStart} // 뒤로가기 등에서 startbutton 없이 애니메이션 적용
            />
            {/* 채팅 입력창 */}
            <UserInput
              isClicked={
                showInput ||
                (location.pathname === "/" && location.state?.hideStart)
              }
              onSessionCreated={handleSessionCreated}
            />
            {(location.pathname === "/" || showSidebar) && (
              <Sidebar
                userMessage={
                  currentSessionId ? `세션: ${currentSessionId}` : "메시지 없음"
                }
              />
            )}
            {/* 프로필/드롭다운 */}
            <Profile
              isDropdownOpen={isDropdownOpen}
              onToggleDropdown={toggleDropdown}
              onEditProfile={handleEditProfile}
              onLogout={handleLogout}
              user={user}
            />
            {/* 모달 트리거 아이콘 */}
            <Modalicon
              isVisible={
                showInput ||
                (location.pathname === "/" && location.state?.hideStart)
              }
              iconsData={triggerIconsData}
            />

            {/* 이스터에그 */}
            <EasterEgg />
            {/* 모달들 */}
            {[1, 2, 3, 4].map((modalNum) => (
              <Modal
                key={modalNum}
                isModalOpen={modalStates[`isModal${modalNum}Open`]}
                onClose={() => closeModal(modalNum)}
                className={`modal-${
                  ["top-left", "bottom-left", "top-right", "bottom-right"][
                    modalNum - 1
                  ]
                }`}
                modalNum={modalNum}
              />
            ))}
          </div>
        }
      />
      {/* 채팅 페이지 */}
      <Route
        path="/chat/:session_id"
        element={
          <ChatPage
            isDropdownOpen={isDropdownOpen}
            toggleDropdown={toggleDropdown}
            handleEditProfile={handleEditProfile}
            handleLogout={handleLogout}
          />
        }
      />
      {/* 기타 라우트 */}
      <Route path="/signin" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup/un" element={<SignupSun />} />
      <Route path="/notice" element={<Notice_Board />} />
      <Route path="/insertFormPage" element={<Notice_Board_InsertForm />} />
      <Route
        path="/notice/:id"
        element={
          <NoticeDetail
            isDropdownOpen={isDropdownOpen}
            toggleDropdown={toggleDropdown}
            handleEditProfile={handleEditProfile}
            handleLogout={handleLogout}
            user={user}
          />
        }
      />
      <Route path="/qna/write" element={<QnA_InsertForm />} />
      <Route path="/qna" element={<QnA_Main />} />
      <Route path="/qna/:id" element={<QnA_Detail />} />
      <Route path="*" element={<Page404 />} />
      <Route path="/upgrade_plan" element={<SubscriptionMain />} />
      <Route path="/upgrade_plan/purchase" element={<Plus />} />
      <Route path="/upgrade_plan/plus/complete" element={<PaymentSuccess />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/about_us" element={<AboutUs />} />
      <Route path="/upgrade_plan/cancelplan" element={<CancelSubscription />} />
      <Route path="/toAsk" element={<ToAskPage />} />
    </Routes>
  );
}

// App: Router로 전체 앱 감싸기
function App() {
  return (
    <Router>
      <UserProvider>
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
