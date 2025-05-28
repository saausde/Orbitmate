// src/contexts/SignThemeContext.js
import React, {
    createContext,
    useContext,
    useState,
    useEffect
  } from "react";
  import { useTheme } from "./ThemeContext"; // your 기존 ThemeContext hook
  
  // 1) SignTheme를 담을 Context 생성
  const SignThemeContext = createContext();
  
  // 2) Provider: ThemeContext에서 theme을 꺼내와 내부 state에 저장
  export function SignThemeProvider({ children }) {
    const { theme } = useTheme();               // 전역 테마
    const [signTheme, setSignTheme] = useState(theme);
  
    // theme이 바뀔 때마다 signTheme에도 저장
    useEffect(() => {
      setSignTheme(theme);
      // (원한다면 로컬저장소에도 persist)
      localStorage.setItem("signTheme", theme);
    }, [theme]);
  
    return (
      <SignThemeContext.Provider value={{ signTheme }}>
        {children}
      </SignThemeContext.Provider>
    );
  }
  
  // 3) 편의 훅
  export function useSignTheme() {
    return useContext(SignThemeContext);
  }
  