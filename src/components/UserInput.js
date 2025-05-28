import React, { useState } from "react";
import buttonImage from "../images/up-arrow2.png";
import "../App.css";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

function UserInput({ isClicked, onSessionCreated }) {
  const [inputValue, setInputValue] = useState("");
  const { user } = useUser();
  const navigate = useNavigate(); 


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // user_id가 없으면 세션 생성 불가
    if (!user?.storedValue){
      alert("로그인 후 이용해 주세요.");   
      navigate("/signin");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/chat/sessions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.user_id,
            title: inputValue.trim(),
            category: "일반"
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "세션 생성 실패");

      onSessionCreated(data.session_id);
      setInputValue("");

      if (typeof onSessionCreated === "function") {
        onSessionCreated(data.session_id);
      } else {
        console.error("onSessionCreated is not a function");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  //엔터로 전송
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      handleSubmit(e);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
      <input
          id="userinput"
          placeholder="Type Your Opinion..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          style={{
          position: "absolute",
          left: "49%",
          top: "60vh",
          borderRadius: "30px",
          border: "4px solid black",
          width: "39vw",
          height: "90px",
          fontSize: "16px",
          paddingTop: "1px",
          paddingLeft: "10px",
          fontFamily: "sans-serif",           
            opacity: isClicked ? 1 : 0,
            transform: isClicked ? "translate(-50%) scale(1)" : "translate(-50%) scale(0.3)",
            transition: "opacity 0.6s ease, transform 3.5s ease",
            
          }}
        />
        
      </form>
    </div>
  );
}

export default UserInput;
