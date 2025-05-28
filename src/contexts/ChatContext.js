// src/contexts/ChatContext.jsx
import React, { createContext, useState, useCallback, useEffect } from 'react';

export const ChatContext = createContext();

export function ChatProvider({ children }) {
  const API_BASE = process.env.REACT_APP_API_BASE_URL;
  const getUserId = () => localStorage.getItem('user_id') || 'API_TEST_USER_ID';

  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('chats');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentChatId, setCurrentChatId] = useState(() => {
    return localStorage.getItem('currentChatId') || null;
  });

  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (currentChatId) localStorage.setItem('currentChatId', currentChatId);
  }, [currentChatId]);

  const clearChats = useCallback(() => {
    setChats([]);
    setCurrentChatId(null);
  }, []);

  // 새 세션 생성
  const resetChat = useCallback(async ({ title = '새 세션', category = '일반' } = {}) => {
    try {
      const res = await fetch(`${API_BASE}/api/chat/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: getUserId(),
          title,
          category
        })
      });
      const data = await res.json();

      console.log(data)

      if (!res.ok) throw new Error(data.error || '세션 생성에 실패했습니다.');

      const sessionId = data.session_id;
      setChats(prev => [ ...prev, { id: sessionId, messages: [] } ]);
      setCurrentChatId(sessionId);
      return sessionId;

    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }, [API_BASE]);

  // 메시지 추가
  const addMessage = useCallback(async (text) => {
    if (!currentChatId) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/chat/sessions/${currentChatId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text
            // system_prompt, special_mode_type 필요 시 추가
          })
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '메시지 전송에 실패했습니다.');

      // user 메시지 + AI 응답을 한 번에 추가
      setChats(prev =>
        prev.map(c =>
          c.id === currentChatId
            ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  message_id: data.user_message_id,
                  sender_type: 'user',
                  message_content: text,
                  created_at: data.created_at
                },
                {
                  message_id: data.ai_message_id,
                  sender_type: 'ai',
                  message_content: data.message,
                  created_at: data.created_at
                }
              ]
            }
            : c
        )
      );
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }, [API_BASE, currentChatId]);

  //const deleteChat
  const deleteChat = useCallback(async (sessionId) => {

    try {
      const res = await fetch(
        `${API_BASE}/api/chat/sessions/${sessionId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: getUserId() })
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || '세션 삭제에 실패했습니다.');



      setChats(prevChats => {
        const updated = prevChats.filter(c => c.id !== sessionId);
        // 삭제된 세션이 현재 열려 있던 세션이었다면
        if (sessionId === currentChatId) {
          // 남은 세션이 있으면 첫 번째로, 없으면 null
          setCurrentChatId(updated.length > 0 ? updated[0].id : null);
        }
        return updated;
      });

    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }, [API_BASE, currentChatId, chats]);

  const loadSession = useCallback(async (sessionId) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/chat/sessions/${sessionId}/messages`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '메시지 로드에 실패했습니다.');

      setChats(prev => {
        const exists = prev.find(c => c.id === sessionId);
        if (exists) {
          return prev.map(c =>
            c.id === sessionId ? { ...c, messages: data } : c
          );
        } else {
          return [{ id: sessionId, messages: data }, ...prev];
        }
      });
      setCurrentChatId(sessionId);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }, [API_BASE]);

  // **여기**: 세션 전환 함수
  const switchChat = useCallback(id => {
    setCurrentChatId(id);
  }, []);

  // localStorage 동기화
  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats));
  }, [chats]);
  useEffect(() => {
    if (currentChatId) localStorage.setItem('currentChatId', currentChatId);
  }, [currentChatId]);



  return (
    <ChatContext.Provider value={{
      chats,
      currentChatId,
      resetChat,
      addMessage,
      loadSession,
      switchChat,
      deleteChat,
      clearChats,    // <-- 추가
    }}>
      {children}
    </ChatContext.Provider>
  );


}
