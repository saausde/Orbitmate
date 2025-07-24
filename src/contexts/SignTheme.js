// SignThemeContext: 회원가입/로그인 등에서 사용하는 테마(다크/라이트) 전역 관리 컨텍스트
import React, { createContext, useContext, useState, useEffect } from "react";
import { useTheme } from "./ThemeContext"; // 전역 ThemeContext 훅

// 1) SignTheme를 담을 Context 생성
const SignThemeContext = createContext();

// 2) Provider: ThemeContext에서 theme을 받아 signTheme로 관리
export function SignThemeProvider({ children }) {
  const { theme } = useTheme(); // 전역 테마(다크/라이트)
  const [signTheme, setSignTheme] = useState(theme); // 회원가입/로그인용 테마 상태

  // theme이 바뀔 때마다 signTheme도 동기화 및 로컬스토리지 저장
  useEffect(() => {
    setSignTheme(theme);
    localStorage.setItem("signTheme", theme);
  }, [theme]);

  // Provider로 하위 컴포넌트에 signTheme 제공
  return (
    <SignThemeContext.Provider value={{ signTheme }}>
      {children}
    </SignThemeContext.Provider>
  );
}

// 3) 편의 훅: signTheme 값 쉽게 사용
export function useSignTheme() {
  return useContext(SignThemeContext);
}
