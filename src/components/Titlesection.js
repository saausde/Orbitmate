import React, { useState, useEffect } from "react";
import "../App.css";
import { useTheme } from "../contexts/ThemeContext";
import astronaut from "../images/astronaut-cartoon.png";
import astronautWhite from "../images/astronaut-cartoon-white.png";
import startButton from "../images/start_button-removebg-preview.png";

function Titlesection({ onStartClick }) {
  const [showButton, setShowButton] = useState(true);
  const [animate, setAnimate] = useState(false);
  const [titleanimate, settitleAnimate] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const { theme } = useTheme();

  const handleClick = () => {
    setShowButton(false);
    if (typeof onStartClick === "function") {
      onStartClick();
    }
    setAnimate(true);
    settitleAnimate(true);
  };

  return (
    <div id="main_title">
      <div
        id="orbitMate"
        style={{
          transform: animate ? "translateY(-320px) scale(0.4)" : "none",
          transition: animate ? 1 : "opacity 0.8s ease, transform 1.7s ease",
        }}
      >
        OrbitMate
      </div>
      {/*우주비행사 사진*/}
      <img
        id="astronaut"
        src={theme === 'dark' ? astronautWhite : astronaut}
        alt="astronaut"
        style={{
          transform: animate 
        ? "translateY(-253px) scale(0.3)" 
        : "translateY(calc(5px * sin(var(--floating-animation-value, 0)))) rotate(calc(2deg * sin(var(--floating-animation-value, 0) * 0.5)))",
          animation: animate ? "none" : "floatingAstronaut 8s ease-in-out infinite",
          transition: animate ? "transform 1.7s ease" : "none"
        }}
      />
      {/*start버튼*/}
      <input
        id="start_button"
        type="button"
        onClick={handleClick}
        style={{
          backgroundImage: `url(${startButton})`,
          backgroundSize: "cover",
          backgroundColor: "transparent",
          border: "none",
          cursor: "pointer",
          position: "absolute",
          width: "210px",
          height: "210px",
          left: "42%",
          top: "600px",
          display: showButton ? "block" : "none",
          transition: titleanimate
            ? "opacity 0.8s ease, transform 0.3s ease"
            : "none",
        }}
      />
      <div
        id="gretting"
        style={{
          opacity: showButton ? 0 : 1,
          transform: showButton ? "translate(-50%, -50%) scale(0.3)" : "translate(-50%, -50%) scale(1)",
          transition: "opacity 0.5s ease, transform 3.5s ease",
          position: "absolute",
          left: "49%",
          top: "50%",
          width: "80%",
          textAlign: "center",
          transformOrigin: "center"
        }}
      >
        What can I explore for you
      </div>
    </div>
  );
}

export default Titlesection;
