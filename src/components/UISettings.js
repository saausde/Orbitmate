import React, { useEffect, useCallback } from "react";
import "../css/UISettings.css";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

function UISettings() {
  const navigate = useNavigate();
  const { theme, setTheme, fontSize, setFontSize, primaryColor, setPrimaryColor } = useTheme();


  const handleGoBack = useCallback((e) => {
    e.stopPropagation();
    navigate(-2);
  }, [navigate]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const savedFontSize = localStorage.getItem("fontSize");
    const savedPrimaryColor = localStorage.getItem("primaryColor");

    if (savedTheme) {
      setTheme(savedTheme);
      document.body.className = "";
      document.body.classList.add(savedTheme);
    }
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
      document.body.style.fontSize = savedFontSize + "px";
    }
    if (savedPrimaryColor) {
      setPrimaryColor(savedPrimaryColor);
      document.body.style.setProperty("--primary-color", savedPrimaryColor);
    }
  }, [setTheme, setFontSize, setPrimaryColor]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    document.body.className = newTheme;
    localStorage.setItem("theme", newTheme);
  };

  const handleFontSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setFontSize(newSize);
    document.body.style.fontSize = newSize + "px";
    localStorage.setItem("fontSize", newSize);
  };

  const handlePrimaryColorChange = (e) => {
    const newColor = e.target.value;
    setPrimaryColor(newColor);
    document.body.style.setProperty("--primary-color", newColor);
    localStorage.setItem("primaryColor", newColor);
  };

  return (
    <div className="container">
      <button className="back-button"
              onClick={handleGoBack}
              onMouseDown={(e) => e.preventDefault()}>
              { /*더블클릭 방지*/ }
              
        뒤로가기
      </button>
      <h1>UI 설정</h1>
      <div className="section">
        <h2>테마</h2>
        <div className="theme-selector">
          <button className="light" onClick={() => handleThemeChange("light")}>
            라이트
          </button>
          <button className="dark" onClick={() => handleThemeChange("dark")}>
            다크
          </button>
        </div>
      </div>
      <div className="section">
        <h2>폰트 크기</h2>
        <label>폰트 크기: {fontSize}px</label>
        <input
          type="range"
          min="12"
          max="24"
          value={fontSize}
          onChange={handleFontSizeChange}
        />
      </div>
      <div className="section">
        <h2>색상</h2>
        <label>주 색상:</label>
        <input
          type="color"
          value={primaryColor}
          onChange={handlePrimaryColorChange}
        />
      </div>
    </div>
  );
}

export default UISettings;
