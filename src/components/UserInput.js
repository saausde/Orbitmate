// UserInput 컴포넌트: 메인 입력창, 세션 생성, 엔터 전송 등 사용자 입력 처리
import React, { useState, useContext } from "react";
import buttonImage from "../images/up-arrow2.png";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../css/UserInput.css";
import { ChatContext } from "../contexts/ChatContext";

function UserInput({ isClicked, onSessionCreated, isGameActive }) {
  const { NewChat } = useContext(ChatContext);
  // [상태] 입력값
  const [inputValue, setInputValue] = useState("");
  const { user } = useUser(); // 사용자 정보
  const navigate = useNavigate(); // 페이지 이동
  const { t } = useTranslation(); // 다국어 처리
  const [isSubmitted, setIsSubmitted] = useState(false); //엔터 눌리면 인풋창 내려가게 만들 함수

  // [세션 생성 및 입력 전송] 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // user_id가 없으면 세션 생성 불가
    if (!user?.storedValue) {
      alert("로그인 후 이용해 주세요.");
      navigate("/signin");
      return;
    }

    try {
      // 세션 생성
      const newSessionId = await NewChat({});

      // 세션 생성 후 사용자 메시지 전송
      await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/chat/sessions/${newSessionId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.storedValue,
            message: inputValue,
          }),
        }
      );

      if (typeof onSessionCreated === "function") {
        setTimeout(() => {
          onSessionCreated(newSessionId);
        }, 3000); // 필요하다면 이동
      }

      /*setInputValue("");*/
    } catch (error) {
      console.error(error);
      alert("세션 생성에 실패했습니다.");
    }
  };

  // [엔터로 전송] 입력창에서 엔터키 입력 시 전송
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      setIsSubmitted(true);
      handleSubmit(e);
    }
  };

  // [렌더링] 메인 입력창 UI (게임 중이면 렌더링하지 않음)
  if (isGameActive) return null;
  return (
    <div className="input-wrapper">
      <form onSubmit={handleSubmit}>
        <input
          id="main_userinput"
          placeholder={t("title_section.input_placeholder")}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          style={{
            /*opacity: isSubmitted ? 1 : 0,*/
            transform: isSubmitted
              ? "translate(-50%, 27vh) scale(1)"
              : "translate(-50%, -20%) scale(1)",

            transition:
              "opacity 1.4s ease, transform 3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </form>
    </div>
  );
}

export default UserInput;
