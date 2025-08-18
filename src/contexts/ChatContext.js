// ChatContext: 채팅 세션/메시지/사이드바 상태 및 API 연동 전역 관리 컨텍스트
import React, { createContext, useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

export const ChatContext = createContext();

export function ChatProvider({ children }) {
  // [i18n] 다국어 지원을 위한 useTranslation 훅
  const { t, i18n } = useTranslation();

  // [사이드바] 열림/닫힘 상태
  const [showSidebar, setShowSidebar] = useState(false);
  // [API BASE URL]
  const API_BASE = process.env.REACT_APP_API_BASE_URL;
  // [유저 ID] localStorage에서 가져오기
  const getUserId = () => localStorage.getItem("user_id");
  // [채팅 세션 목록] localStorage 동기화
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("chats");
    return saved ? JSON.parse(saved) : [];
  });
  // [현재 선택된 세션 ID] localStorage 동기화
  const [currentChatId, setCurrentChatId] = useState(() => {
    const path = window.location.pathname;
    // 경로가 /chat/ 로 시작할 때만 복원
    if (path.startsWith("/chat/")) {
      return localStorage.getItem("currentChatId") || null;
    }
    return null;
  });

  // [채팅 목록 localStorage 저장]
  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);
  // [현재 세션 ID localStorage 저장]
  useEffect(() => {
    if (currentChatId) localStorage.setItem("currentChatId", currentChatId);
  }, [currentChatId]);

  // [전체 세션 삭제] 모든 세션 서버/로컬에서 삭제
  const clearChats = useCallback(async () => {
    try {
      for (const chat of chats) {
        const sessionId = chat.session_id;
        const response = await fetch(
          `${API_BASE}/api/chat/sessions/${sessionId}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: getUserId() }),
          }
        );
        if (!response.ok) {
          console.error(`세션 삭제 실패: ${chat.session_id}`);
        }
      }
      setChats([]);
      setCurrentChatId(null);
      return true;
    } catch (err) {
      console.error("모든 세션 삭제 중 오류 발생:", err);
      return false;
    }
  }, [chats, getUserId, API_BASE]);

  // [새 세션 생성] 서버에 새 세션 생성 후 상태 반영
  const NewChat = useCallback(
    async ({ title, category = "일반", firstMessage } = {}) => {
      // 언어에 따라 기본 타이틀 다국어 처리 (한국어/영어/일본어)
      let finalTitle;
      if (title) {
        finalTitle = title;
      } else if (i18n.language === "ko") {
        finalTitle = "새 세션";
      } else if (i18n.language === "ja") {
        finalTitle = "新しいセッション";
      } else {
        finalTitle = "New Session";
      }
      // 만약 firstMessage가 있으면 제목으로 사용
      if (
        firstMessage &&
        typeof firstMessage === "string" &&
        firstMessage.trim()
      ) {
        finalTitle = firstMessage.trim();
      }
      try {
        const res = await fetch(`${API_BASE}/api/chat/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: getUserId(),
            title: finalTitle,
            category,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "세션 생성에 실패했습니다.");
        const sessionId = data.data.session_id;
        setChats((prev) => [
          ...prev,
          {
            session_id: sessionId,
            title: finalTitle,
            category,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_archived: false,
            messages: [],
          },
        ]);
        setCurrentChatId(sessionId);
        return sessionId;
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    },
    [API_BASE, i18n.language]
  );

  // [메시지 추가] 서버에 메시지 전송 후 상태 반영
  const addMessage = useCallback(
    async (text) => {
      if (!currentChatId) return;
      try {
        const res = await fetch(
          `${API_BASE}/api/chat/sessions/${currentChatId}/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: getUserId(),
              message: text,
            }),
          }
        );
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "메시지 전송에 실패했습니다.");
        // user 메시지 + AI 응답을 한 번에 추가
        setChats((prev) =>
          prev.map((c) =>
            c.session_id === currentChatId
              ? {
                  ...c,
                  messages: [
                    ...c.messages,
                    {
                      message_id: data.user_message_id,
                      sender_type: "user",
                      message_content: text,
                      created_at: data.created_at,
                    },
                    {
                      message_id: data.ai_message_id,
                      sender_type: "ai",
                      message_content: data.message,
                      created_at: data.created_at,
                    },
                  ],
                }
              : c
          )
        );
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    },
    [API_BASE, currentChatId]
  );

  // [세션 삭제] 서버/로컬에서 세션 삭제
  const deleteChat = useCallback(
    async (sessionId) => {
      try {
        const res = await fetch(`${API_BASE}/api/chat/sessions/${sessionId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: getUserId() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "세션 삭제에 실패했습니다.");
        setChats((prevChats) => {
          const updated = prevChats.filter((c) => c.session_id !== sessionId);
          // 삭제된 세션이 현재 열려 있던 세션이었다면 남은 세션으로 전환
          if (sessionId === currentChatId) {
            setCurrentChatId(updated.length > 0 ? updated[0].session_id : null);
          }
          return updated;
        });
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    },
    [API_BASE, currentChatId]
  );

  // [세션 메시지 불러오기] 서버에서 메시지 불러와 상태 반영
  const loadSession = useCallback(
    async (sessionId) => {
      try {
        const res = await fetch(
          `${API_BASE}/api/chat/sessions/${sessionId}/messages`
        );
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "메시지 로드에 실패했습니다.");
        setChats((prev) => {
          const exists = prev.find((c) => c.session_id === sessionId);
          if (exists) {
            return prev.map((c) =>
              c.session_id === sessionId ? { ...c, messages: data } : c
            );
          } else {
            return [{ session_id: sessionId, messages: data }, ...prev];
          }
        });
        setCurrentChatId(sessionId);
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    },
    [API_BASE]
  );

  // [세션 전환] 현재 세션 ID만 변경
  const switchChat = useCallback((id) => {
    setCurrentChatId(id);
  }, []);

  // 로그아웃 시 세션 목록 제거
  const resetLocalChats = useCallback(() => {
    setChats([]);
    setCurrentChatId(null);
  }, []);

  // [관리자용 세션 삭제] 단일 세션 삭제
  const deleteChatAsAdmin = useCallback(
    async (sessionId) => {
      try {
        const res = await fetch(`${API_BASE}/api/chat/sessions/${sessionId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: getUserId() }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "관리자 세션 삭제 실패");
      } catch (err) {
        console.error("관리자 세션 삭제 중 오류:", err);
        alert(err.message);
      }
    },
    [API_BASE]
  );

  // [관리자용 전체 세션 삭제] 특정 유저의 모든 세션 삭제
  const clearChatsAsAdmin = useCallback(
    async (targetUserId, sessionList = []) => {
      try {
        for (const session of sessionList) {
          const sessionId = session.session_id;

          const res = await fetch(
            `${API_BASE}/api/chat/sessions/${sessionId}`,
            {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id: targetUserId }), // ✅ 삭제 대상 유저 ID 명시
            }
          );

          if (!res.ok) {
            console.error("❌ 삭제 실패:", sessionId);
          }
        }

        console.log(`✅ [관리자] ${targetUserId}의 세션 전체 삭제 완료`);
      } catch (err) {
        console.error("❌ 관리자 전체 삭제 중 오류:", err);
        alert(err.message);
      }
    },
    [API_BASE]
  );

  // [컨텍스트 값 제공] 주요 상태/함수 모두 value로 전달
  return (
    <ChatContext.Provider
      value={{
        showSidebar,
        setShowSidebar,
        chats,
        setChats,
        currentChatId,
        NewChat,
        addMessage,
        loadSession,
        switchChat,
        deleteChat,
        clearChats,
        getUserId,
        resetLocalChats,
        clearChatsAsAdmin,
        deleteChatAsAdmin,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
