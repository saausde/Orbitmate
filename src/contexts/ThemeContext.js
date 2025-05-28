import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const [fontSize, setFontSize] = useState(16);
  const [primaryColor, setPrimaryColor] = useState("#007bff");

  // 로컬스토리지에서 초기값 불러오기
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const savedFontSize = localStorage.getItem("fontSize");
    const savedPrimaryColor = localStorage.getItem("primaryColor");
    if (savedTheme) setTheme(savedTheme);
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
    if (savedPrimaryColor) setPrimaryColor(savedPrimaryColor);
  }, []);

  // 테마 변경 시 body에 적용
  useEffect(() => {
    document.body.className = "";
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    document.body.style.fontSize = fontSize + "px";
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  useEffect(() => {
    document.body.style.setProperty("--primary-color", primaryColor);
    localStorage.setItem("primaryColor", primaryColor);
  }, [primaryColor]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, fontSize, setFontSize, primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
