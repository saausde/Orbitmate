// src/context/UserContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

// 1) Context 생성
const UserContext = createContext();

// 2) Provider 컴포넌트
export function UserProvider({ children }) {
  // ─────────────────────────────────────────────
  // 2-1) useState의 초기값을 localStorage에서 불러오기
  const [user, setUserState] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // 2-2) setUser의 래퍼(wrapper)를 만들어서
  //      state뿐 아니라 localStorage에도 저장하도록
  const setUser = (userInfo) => {
    setUserState(userInfo);
    localStorage.setItem("user", JSON.stringify(userInfo));
  };

  // 2-3) 로그아웃용: state와 localStorage 동시 초기화
  const logout = () => {
    setUserState(null);
    localStorage.removeItem("user");
  };
  // ─────────────────────────────────────────────

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

// 3) Context를 편하게 꺼내 쓰는 훅
export function useUser() {
  return useContext(UserContext);
}
