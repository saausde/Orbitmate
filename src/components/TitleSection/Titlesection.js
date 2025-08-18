// Titlesection 컴포넌트: 메인 타이틀, 우주비행사 애니메이션, 시작 버튼, 인사말 등 메인 화면 UI 제공
import React, { useState, useEffect } from "react";
import EasterEgg from "./EasterEgg";
import "../../css/Titlesection.css";
import "../../css/dark.css";
import { useTheme } from "../../contexts/ThemeContext";
import astronautWhite from "../../images/astronaut-cartoon-white.png";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import SolarSystem from "../SolarSystem";
function Titlesection({
  onStartClick,
  hideStart,
  forceAnimated,
  submittedText,
  onGameStart,
  onGameEnd,
  isGameActive,
}) {
  // [상태] 시작 버튼 표시, 애니메이션 트리거 등
  const [showButton, setShowButton] = useState(true); // 시작 버튼 표시 여부
  const [animate, setAnimate] = useState(false); // 타이틀/비행사 애니메이션 트리거
  const [titleanimate, settitleAnimate] = useState(false); // 타이틀 애니메이션 트리거
  const { theme } = useTheme(); // 다크/라이트 테마
  const { t } = useTranslation(); // 다국어 처리
  const location = useLocation(); // location 객체를 올바르게 사용
  const params = new URLSearchParams(location.search);
  const hideStartParam = params.get("hideStart"); // URL 파라미터에서 hideStart 값 가져오기
  const hideStartState = location.state?.hideStart; // location.state에서 hideStart 값 가져오기
  const isHideStart = hideStartParam === "1" || hideStartState === true; // hideStart가 true인지 확인
  const [islogin, setislogin] = useState(false);
  const { user } = useUser(); //사용자 정보 가져오기
  // [시작 버튼 클릭] 버튼 숨기고 애니메이션 및 콜백 실행
  const handleClick = () => {
    setShowButton(false);
    if (typeof onStartClick === "function") {
      onStartClick();
    }
    setAnimate(true);
    settitleAnimate(true);
  };

  // 뒤로가기 등에서 forceAnimated가 true면 애니메이션 강제 적용
  useEffect(() => {
    if (forceAnimated) {
      setShowButton(false);
      setAnimate(true);
      settitleAnimate(true);
    }
  }, [forceAnimated]);

  // EasterEgg 클릭 시 게임 시작 트리거 (상태 없이 단순 핸들러)
  const handlecometClick = () => {};

  return (
    <div className="title_section_wrapper">
      <div id="main_title">
        <div className="SolarSystem">
          <SolarSystem />
        </div>
        {/* OrbitMate 타이틀 (애니메이션 적용) */}
        <div id="orbitMate">OrbitMate</div>

        {/* 우주비행사 이미지 */}
        <img
          id="main-astronaut"
          src={theme === "dark" ? astronautWhite : astronautWhite}
          alt="astronaut"
        />

        {/* 인사말 텍스트 */}
        <div id="gretting">
          {user && user.profile?.username
            ? t("title_section.greeting", { name: user.profile.username })
            : t("title_section.greeting_no_name")}
        </div>
      </div>
      {/* 이스터에그(로켓) 컴포넌트 클릭 시 게임 시작 트리거 전달 */}
      <EasterEgg
        oncometClick={handlecometClick}
        onGameStart={onGameStart}
        onGameEnd={onGameEnd}
        isGameActive={isGameActive}
      />
    </div>
  );
}

export default Titlesection;
