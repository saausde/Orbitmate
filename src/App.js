// 1. 각 기능은 하나의 컴포넌트로 분리한다.
// 2. 각 컴포넌트는 하나의 기능을 수행한다.

import React, { useState, useEffect, useCallback } from "react";
import EsterEgg from "./components/EsterEgg";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  useNavigate,
} from "react-router-dom";
import BackgroundParticles from "./components/BackgroundParticles";
import Titlesection from "./components/Titlesection";
import UserInput from "./components/UserInput";
import Sidebar from "./components/Sidebar";
import Profile from "./components/Profile";
import UISettings from "./components/UISettings";
import Login from "./signpages/Login";
import Signup from "./signpages/Signup";
import SignupSun from "./signpages/Signup-step2";
import ChatPage from "./signpages/ChatPage";
import Page404 from "./signpages/Page404";
import Modal from "./components/Modal";
import Modalicon from "./components/Modalicon";
import iconTrigger1 from "./images/news.png";
import iconTrigger2 from "./images/you.png";
import iconTrigger3 from "./images/weather_icon2.png";
import iconTrigger4 from "./images/shop.png";
import PropTypes from "prop-types";

UserInput.PropTypes = {
  onSessionCreated: PropTypes.func.isRequired
};
// UserInput 컴포넌트에서 onSessionCreated prop을 사용하기

UserInput.defaultProps = {
  onSessionCreated: () => console.warn("핸들러 미등록")
};

function AppContent() {
  const navigate = useNavigate();
  const [showInput, setShowInput] = useState(false);
  const [showsidebarBtn, setshowsidebarBtn] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 뒤로가기 등으로 진입 시 상태 초기화
  useEffect(() => {
    setShowInput(false);
    setshowsidebarBtn(false);
    setCurrentSessionId(null);
  }, [window.location.pathname]);

  const toggleDropdown = () => setIsDropdownOpen(prev => !prev);

  const [modalStates, setModalStates] = useState({
    isModal1Open: false,
    isModal2Open: false,
    isModal3Open: false,
    isModal4Open: false,
  });

  // 모달 열고 닫는 핸들러 (어떤 모달인지 인자로 받음)
  const openModal = (modalNum) => {
    setModalStates((prevStates) => ({
      ...prevStates,
      [`isModal${modalNum}Open`]: true,
    }));
  };

  const closeModal = (modalNum) => {
    setModalStates((prevStates) => ({
      ...prevStates,
      [`isModal${modalNum}Open`]: false,
    }));
  };

  // triggerIconsData에서 openModal 호출 방식을 변경
  const triggerIconsData = [
    { id: 1, iconUrl: iconTrigger1, openModal: () => openModal(1) },
    { id: 2, iconUrl: iconTrigger2, openModal: () => openModal(2) },
    { id: 3, iconUrl: iconTrigger3, openModal: () => openModal(3) },
    { id: 4, iconUrl: iconTrigger4, openModal: () => openModal(4) },
  ];

  // 세션 생성 핸들러
  const handleSessionCreated = useCallback((sessionId) => {
    console.log("세션 생성 콜백 실행:", sessionId);
    setCurrentSessionId(sessionId);
    setShowInput(true); // 세션 생성 후에도 입력창 유지 (선택적)
    setshowsidebarBtn(true); // 세션 생성 후 사이드바 버튼 표시
    navigate(`/chat/${sessionId}`);
  }, [navigate]);

  // 시작 버튼 핸들러
  const handleStartClick = () => {
    setShowInput(true);
    setshowsidebarBtn(true);
  };

  // 프로필 관련 핸들러
  const handleUiSettings = () => {
    setIsDropdownOpen(false);
    navigate("/UISettings");
  }
  const handleEditProfile = () => {;
    setIsDropdownOpen(false);
    console.log("프로필 편집");
  }
  const handleLogout = () => {;
    setIsDropdownOpen(false);
    navigate("/signin");
    window.location.reload();
  }

  // 세션 생성 및 라우팅 핸들러
  const handleUserInputSubmit = async (inputText) => {
    // user_id가 없으면 세션 생성 불가 (게스트 자동 세션 생성 방지)
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
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            user_id,
            title: inputText,
            category: "일반",
          }),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "세션 생성에 실패했습니다.");
        return;
      }
      const sessionId = json.session_id;
      setCurrentSessionId(sessionId);
      setShowInput(true);
      setshowsidebarBtn(true);
      navigate(`/chat/${sessionId}`);
    } catch (err) {
      alert("세션 생성 오류: " + (err.message || "서버 오류"));
    }
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div id="Main">
            <BackgroundParticles type="cobweb" />
            <Titlesection onStartClick={handleStartClick} />
           
              <UserInput
                isClicked={showInput}
                onSessionCreated={handleSessionCreated} // 세션 생성 핸들러
              />
           
            {showsidebarBtn && (
              <Sidebar
                showsidebarBtn={showsidebarBtn}
                userMessage={currentSessionId ? `세션: ${currentSessionId}` : "메시지 없음"}
              />
            )}
            <Profile
              isDropdownOpen={isDropdownOpen}
              onToggleDropdown={toggleDropdown}
              onUiSettings={handleUiSettings}
              onEditProfile={handleEditProfile}
              onLogout={handleLogout}
            />
            <Modalicon isVisible={showInput} iconsData={triggerIconsData} />
            <EsterEgg/>
            {[1, 2, 3, 4].map((modalNum) => (
              <Modal
                key={modalNum}
                isModalOpen={modalStates[`isModal${modalNum}Open`]}
                onClose={() => closeModal(modalNum)}
                className={`modal-${["top-left", "bottom-left", "top-right", "bottom-right"][modalNum - 1]}`}
                modalNum={modalNum}
                // TODO: 각 모달별 컨텐츠나 동작 설정 필요
              />
             
            ))}
          </div>
        }
      />
      <Route
        path="/chat/:session_id"
        element={
          <ChatPage
            isDropdownOpen={isDropdownOpen}
            toggleDropdown={toggleDropdown}
            handleUiSettings={handleUiSettings}
            handleEditProfile={handleEditProfile}
            handleLogout={handleLogout}
          />
        }
      />
      <Route path="/UISettings" element={<UISettings />} />
      <Route path="/signin" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup/un" element={<SignupSun />} />
      <Route path="*" element={<Page404 />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;