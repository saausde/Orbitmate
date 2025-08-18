// ThemeContext: 테마(다크/라이트), 폰트 크기, 주요 색상 등 전역 UI 설정 관리 컨텍스트
import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserContext";

// 1) ThemeContext 생성: 기본값 포함
const ThemeContext = createContext();

// 2) Provider: 테마/폰트/색상 상태 관리 및 하위에 제공
export function ThemeProvider({ children }) {
  const { user } = useUser(); // ✅ 유저 정보 접근

  const initialTheme = user?.settings?.theme || "light";
  const initialFontSize = user?.settings?.font_size || 16;
  const initialColor = user?.settings?.primary_color || "#007bff";

  const [theme, setTheme] = useState(initialTheme);
  const [fontSize, setFontSize] = useState(initialFontSize);
  const [primaryColor, setPrimaryColor] = useState(initialColor);

  // 사용자 설정 반영
  useEffect(() => {
    if (!user?.settings) return;

    const s = user.settings;

    if (s.theme && s.theme !== theme) setTheme(s.theme);
    if (s.font_size && s.font_size !== fontSize) setFontSize(s.font_size);
    if (s.primary_color && s.primary_color !== primaryColor)
      setPrimaryColor(s.primary_color);
  }, [user?.settings]);

  // [테마 변경 시] body 클래스 및 로컬스토리지 동기화
  useEffect(() => {
    document.body.className = "";
    document.body.classList.add(theme);
  }, [theme]);

  // [폰트 크기 변경 시] body 스타일 및 로컬스토리지 동기화
  useEffect(() => {
    document.body.style.fontSize = fontSize + "px";
  }, [fontSize]);

  // [주요 색상 변경 시] body CSS 변수 및 로컬스토리지 동기화
  useEffect(() => {
    document.body.style.setProperty("--primary-color", primaryColor);
  }, [primaryColor]);

  // Provider로 하위 컴포넌트에 값 제공
  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        fontSize,
        setFontSize,
        primaryColor,
        setPrimaryColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// 3) 편의 훅: ThemeContext 값 쉽게 사용
export function useTheme() {
  return useContext(ThemeContext);
}
