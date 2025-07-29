// ChatManage.jsx
import React, { useState, useEffect, useContext } from "react";
import { ChatContext } from "../../contexts/ChatContext";
import { useUser } from "../../contexts/UserContext";
import "../../css/AdminCSS/ChatManager.css";

export default function ChatManage({ userList }) {
  const [userSessions, setUserSessions] = useState([]); // ✅ 유저별 세션 목록
  const [expandedUsers, setExpandedUsers] = useState([]); // ✅ 펼친 유저 ID 저장
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionMessages, setSessionMessages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { deleteChatAsAdmin, clearChatsAsAdmin } = useContext(ChatContext);
  const { user } = useUser();
  const userId = user?.profile?.user_id;
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  const toggleUser = (user_id) => {
    setExpandedUsers((prev) =>
      prev.includes(user_id)
        ? prev.filter((id) => id !== user_id)
        : [...prev, user_id]
    );
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("ko-KR");
  };

  // ✅ 유저별 세션 목록 API 호출
  useEffect(() => {
    if (!userList.length) return;

    const fetchAllSessions = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/sessions/admin/all`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId, // ✅ 관리자 인증용 ID
            include_empty: true, // ✅ 빈 세션 포함
          }),
        });

        const json = await res.json();
        if (!res.ok || json.status !== "success") {
          throw new Error("세션 조회 실패");
        }

        const sessions = json.data.sessions;

        // ✅ user_id 기준으로 그룹핑 (렌더링용으로만)
        const groupedByUser = sessions.reduce((acc, session) => {
          const uid = session.user_id;
          const uname = session.user_info?.username || "Unknown";

          if (!acc[uid]) {
            acc[uid] = {
              user_id: uid,
              username: uname,
              sessions: [],
            };
          }

          acc[uid].sessions.push(session);
          return acc;
        }, {});

        const merged = userList.map((user) => {
          const fromSession = groupedByUser[user.user_id];
          return {
            user_id: user.user_id,
            username: fromSession?.username || user.username,
            sessions: fromSession?.sessions || [], // 세션 없으면 빈 배열
          };
        });

        setUserSessions(merged); // 배열로 변환해서 저장
      } catch (err) {
        alert("세션 목록 로딩 실패: " + err.message);
      }
    };

    fetchAllSessions();
  }, [userList]);

  const handleDeleteSession = async (session_id) => {
    if (!window.confirm("정말 이 세션을 삭제하시겠습니까?")) return;
    try {
      await deleteChatAsAdmin(session_id);

      // 삭제 후 화면 갱신
      setUserSessions((prev) =>
        prev.map((user) => ({
          ...user,
          sessions: user.sessions.filter((s) => s.session_id !== session_id),
        }))
      );
    } catch (err) {
      alert("세션 삭제 실패: " + err.message);
    }
  };

  const handleDeleteAll = async (user_id, sessions) => {
    if (!sessions.length) return;
    if (!window.confirm("해당 유저의 모든 세션을 삭제하시겠습니까?")) return;

    try {
      await clearChatsAsAdmin(user_id, sessions);

      // ✅ 삭제 후 상태에서 세션 비우기
      setUserSessions((prev) =>
        prev.map((user) =>
          user.user_id === user_id ? { ...user, sessions: [] } : user
        )
      );

      // ✅ 펼침 상태도 닫기
      setExpandedUsers((prev) => prev.filter((id) => id !== user_id));
    } catch (err) {
      alert("전체 삭제 실패: " + err.message);
    }
  };

  const fetchSessionMessages = async (session_id) => {
    if (!session_id || session_id === "undefined" || session_id === "null") {
      alert("유효하지 않은 세션 ID입니다.");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/chat/sessions/${session_id}/messages`
      );
      const json = await res.json();

      if (!res.ok || json.status !== "success") {
        throw new Error("메시지 조회 실패");
      }

      setSessionMessages(json.data || []);
      setIsModalOpen(true);
    } catch (err) {
      alert("채팅 불러오기 실패: " + err.message);
    }
  };

  return (
    <div className="chat-manage">
      <h2>채팅 관리</h2>
      <table className="chat-table">
        <thead>
          <tr>
            <th>유저 ID</th>
            <th>닉네임</th>
            <th>세션 수</th>
            <th>비고</th>
          </tr>
        </thead>
        <tbody>
          {userSessions.map(({ user_id, username, sessions }) => (
            <React.Fragment key={user_id}>
              <tr
                onClick={() => {
                  if (sessions.length > 0) toggleUser(user_id);
                }}
                style={{ cursor: sessions.length > 0 ? "pointer" : "default" }}
              >
                <td>
                  {sessions.length > 0
                    ? `${
                        expandedUsers.includes(user_id) ? "▼" : "▶"
                      } ${user_id}`
                    : user_id}
                </td>
                <td>{username}</td>
                <td>{sessions.length}개</td>
                <td>
                  <button
                    className="admin-delete-all-btn"
                    onClick={() => handleDeleteAll(user_id, sessions)}
                  >
                    전체 삭제
                  </button>
                </td>
              </tr>

              {expandedUsers.includes(user_id) && (
                <tr>
                  <td colSpan={4} style={{ padding: "0" }}>
                    <table className="session-subtable">
                      <thead>
                        <tr>
                          <th>세션 ID</th>
                          <th>제목</th>
                          <th>메시지 수</th>
                          <th>생성일</th>
                          <th>마지막 활동 시간</th>
                          <th>마지막 메시지 내용</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map((session) => {
                          const stats = session.message_stats || {};
                          const lastMessage = stats.last_message_preview;
                          const lastActivity = stats.last_message_at;
                          const lastMessageDisplay = lastMessage
                            ? lastMessage.length > 20
                              ? lastMessage.slice(0, 20) + "..."
                              : lastMessage
                            : "-";

                          return (
                            <tr key={session.session_id}>
                              <td>{session.session_id}</td>
                              <td>{session.title}</td>
                              <td>{stats.total_messages || 0}</td>
                              <td>{formatDate(session.created_at)}</td>
                              <td>
                                {lastActivity
                                  ? formatDate(lastActivity)
                                  : "사용안함"}
                              </td>
                              <td title={lastMessage || ""}>
                                {lastMessageDisplay}
                              </td>
                              <td>
                                <button
                                  className="admin-session-delete-btn"
                                  onClick={() =>
                                    handleDeleteSession(session.session_id)
                                  }
                                >
                                  삭제
                                </button>
                                <button
                                  className="admin-session-view-btn"
                                  onClick={() => {
                                    setSelectedSession(session.session_id);
                                    fetchSessionMessages(session.session_id);
                                  }}
                                >
                                  채팅 보기
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div
          className="admin-modal-overlay"
          onClick={() => setIsModalOpen(false)} // 배경 클릭 시 닫힘
        >
          <div
            className="chatView-modal"
            onClick={(e) => e.stopPropagation()} // 모달 내부 클릭은 닫힘 방지
          >
            <h3 className="admin-modal-title">채팅 내역</h3>
            <button
              className="admin-modal-close-btn"
              onClick={() => setIsModalOpen(false)}
            >
              ❌
            </button>

            {sessionMessages.length > 0 ? (
              <ul className="admin-message-list">
                {sessionMessages.map((msg) => (
                  <li
                    key={msg.message_id}
                    className={
                      msg.message_type === "user"
                        ? "admin-message-item user"
                        : "admin-message-item ai"
                    }
                  >
                    <strong>
                      {msg.message_type === "user" ? "유저" : "AI"}:
                    </strong>{" "}
                    {msg.message_content}
                  </li>
                ))}
              </ul>
            ) : (
              <p>메시지가 없습니다.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
