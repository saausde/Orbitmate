// UserContext: 로그인/회원정보 등 사용자 전역 상태 관리 컨텍스트
import React, { createContext, useContext, useState } from "react";
import { ChatContext } from "../contexts/ChatContext";

// 1) UserContext 생성
const UserContext = createContext();

// 2) Provider: 사용자 정보 상태 관리 및 하위에 제공
export function UserProvider({ children }) {
  // [상태] user: localStorage에서 불러오거나 null
  const [user, setUserState] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored || stored === "undefined") return null;
      return JSON.parse(stored);
    } catch (e) {
      console.error("UserContext: localStorage 파싱 오류", e);
      return null;
    }
  });
  // [setUser] state와 localStorage 동시 저장
  const setUser = (userInfo) => {
    const newUser = typeof userInfo === "function" ? userInfo(user) : userInfo;
    setUserState(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const { resetLocalChats } = useContext(ChatContext);

  // [logout] state와 localStorage 동시 초기화
  const logout = () => {
    setUserState(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    resetLocalChats();
  };

  // 회원 탈퇴
  const DeleteAccount = async (userId) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/${userId}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "회원 탈퇴에 실패했습니다.");

      alert("회원 탈퇴가 완료되었습니다.");
    } catch (err) {
      console.error("회원 탈퇴 오류:", err);
      alert(err.message);
    }
  };

  // Provider로 하위 컴포넌트에 user/setUser/logout 제공
  return (
    <UserContext.Provider value={{ user, setUser, logout, DeleteAccount }}>
      {children}
    </UserContext.Provider>
  );
}

// 3) 편의 훅: UserContext 값 쉽게 사용
export function useUser() {
  return useContext(UserContext);
}
