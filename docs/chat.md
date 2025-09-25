채팅 기능 – 프론트 핵심 코드



사용자 세션/메시지 관리 (생성·전환·불러오기·전송·삭제)



설명: 세션은 생성 후 currentChatId로 활성화되고, 메시지 전송 시 서버가 사용자 메시지와 AI 응답을 함께 반환하도록 설계했습니다. 세션/메시지 상태는 로컬 스토리지와 동기화되어 새로고침·이동 후에도 복원됩니다. 삭제·전환 시 UI 일관성을 위해 현재 세션 보정 로직을 적용했습니다.



핵심 코드:



세션 생성: POST /api/chat/sessions → 응답 data.data.session\_id 사용해 setChats(\[...prev, { session\_id, title, ... }]), setCurrentChatId(sessionId)



세션 전환: setCurrentChatId(id)



세션 메시지 불러오기: GET /api/chat/sessions/:sessionId/messages → setChats(prev.map(c => c.session\_id===sessionId ? { ...c, messages:data } : c)), setCurrentChatId(sessionId)



메시지 전송: POST /api/chat/sessions/:currentChatId/messages(body: { user\_id, message }) → 응답의 user\_message\_id, ai\_message\_id, message를 이용해 messages에 사용자/AI 메시지 순차 push



세션 삭제: DELETE /api/chat/sessions/:sessionId(body: { user\_id }) → 로컬 상태에서 제거, 삭제 대상이 현재 세션이면 setCurrentChatId(updated\[0]?.session\_id || null)



전체 세션 삭제: for (const chat of chats) { DELETE /api/chat/sessions/:id } 완료 후 setChats(\[]), setCurrentChatId(null)



경로 기반 복원: 최초 마운트 시 window.location.pathname이 /chat/로 시작하면 localStorage.getItem("currentChatId")로 현재 세션 복원



로컬 동기화: useEffect(()=> localStorage.setItem("chats", JSON.stringify(chats)), \[chats]), useEffect(()=> currentChatId \&\& localStorage.setItem("currentChatId", currentChatId), \[currentChatId])



입력/국제화 가드 (타이틀/언어/예외 처리)



설명: 언어(i18n)에 따라 새 세션의 기본 타이틀을 다국어로 설정하고, 최초 사용자 입력(firstMessage)이 있으면 이를 타이틀로 사용합니다. API 호출 결과 검증과 예외 상황에 대한 알림을 통해 사용자 경험을 보호합니다.



핵심 코드:



타이틀 결정: i18n.language === "ko" ? "새 세션" : i18n.language === "ja" ? "新しいセッション" : "New Session" → firstMessage?.trim()이 있으면 그 값을 최우선 적용



공통 예외 처리: const data = await res.json(); if (!res.ok) throw new Error(data.error || "실패 메시지"); → catch(err) { console.error(err); alert(err.message); }



전송 가드: if (!currentChatId) return; (세션 미선택 시 메시지 전송 차단)



관리자 모드(세션 일괄 관리)



설명: 운영 편의를 위해 특정 유저의 모든 세션을 관리자 권한으로 정리할 수 있습니다. 대상 유저 ID를 명시하며, 실패한 세션은 로그로 남깁니다.



핵심 코드:



단일 세션 삭제(관리자): DELETE /api/chat/sessions/:sessionId(body: { user\_id: getUserId() }) → 실패 시 "관리자 세션 삭제 실패"



특정 유저 전체 삭제: for (const s of sessionList) { DELETE /api/chat/sessions/:s.session\_id (body: { user\_id: targetUserId }) } → 완료 후 "\[관리자] {targetUserId}의 세션 전체 삭제 완료" 로그



UX 일관성/복원성



설명: 로그아웃 시 로컬 상태 초기화, 세션 삭제 시 현재 세션 포커스 보정, 라우팅 경로에 따라 세션 복원 등 사용 흐름이 끊기지 않도록 방어적으로 설계했습니다.



핵심 코드:



로그아웃 초기화: resetLocalChats() → setChats(\[]); setCurrentChatId(null)



현재 세션 보정: 삭제한 세션이 활성 세션이면 updated\[0]?.session\_id로 자동 전환, 없으면 null



경로 기반 세션 복원: /chat/ 경로 진입 시 저장된 currentChatId로 즉시 전환

