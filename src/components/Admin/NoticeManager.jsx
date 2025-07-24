// NoticeManager.jsx
import React, { useEffect, useState } from "react";
import "../../css/AdminCSS/NoticeManager.css";
import { useUser } from "../../contexts/UserContext";
// import { useLocation } from "react-router-dom";

export default function NoticeManager() {
  const [language, setLanguage] = useState("ko");
  // 언어 변경 시 상태만 변경하면 useEffect로 fetchNotices가 자동 호출됨
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
  };
  const [noticeList, setNoticeList] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [editSubject, setEditSubject] = useState("");
  const [editContent, setEditContent] = useState("");

  const [newSubject, setNewSubject] = useState("");
  const [newContent, setNewContent] = useState("");
  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  const { user } = useUser();
  const userId = user?.profile?.user_id;
  const userName = user?.profile?.username;

  useEffect(() => {
    fetchNotices();
  }, [language]);

  const fetchNotices = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/posts?language=${language}&include_notices=true`
      );
      const json = await res.json();

      if (!res.ok || json.status !== "success") {
        throw new Error("공지 조회 실패");
      }

      const onlyNotices = json.data.filter((post) => post.is_notice);
      setNoticeList(onlyNotices);
    } catch (err) {
      alert("공지 로딩 실패: " + err.message);
    }
  };

  const fetchNoticeDetail = async (post_id) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/posts/${post_id}?language=ko&include_all_translations=true`
      );
      const json = await res.json();

      if (!res.ok || json.status !== "success") {
        throw new Error("공지 상세 조회 실패");
      }

      setSelectedNotice(json.data);
      setEditSubject(json.data.translation.subject);
      setEditContent(json.data.translation.content);
      setIsModalOpen(true);
    } catch (err) {
      alert("공지 불러오기 실패: " + err.message);
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/api/posts/${selectedNotice.post_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId, // 관리자 ID
            user_name: userName,
            subject: editSubject,
            content: editContent,
          }),
        }
      );

      const json = await res.json();
      if (!res.ok || json.status !== "success") {
        throw new Error("공지 수정 실패");
      }

      alert("공지 수정 완료되었습니다.");

      // ✅ 목록 갱신 (선택적으로 반영)
      setNoticeList((prev) =>
        prev.map((n) =>
          n.post_id === selectedNotice.post_id
            ? {
                ...n,
                subject: editSubject,
                updated_date: json.data.updated_date,
              }
            : n
        )
      );

      setIsModalOpen(false);
    } catch (err) {
      alert("공지 수정 실패: " + err.message);
    }
  };

  const handleAddNoticeOpen = () => {
    setNewSubject("");
    setNewContent("");
    setIsAddModalOpen(true);
  };

  const handleAddNoticeClose = () => {
    setIsAddModalOpen(false);
  };

  const handleAddNotice = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId, // 로그인한 유저 ID 사용
          user_name: userName,
          subject: newSubject,
          content: newContent,
          origin_language: "ko",
          is_notice: 1,
          pwd: null,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.status !== "success") {
        throw new Error("공지 추가 실패");
      }

      alert("공지 추가 완료");
      setIsAddModalOpen(false);
      fetchNotices(); // 목록 갱신
    } catch (err) {
      alert("공지 추가 실패: " + err.message);
    }
  };

  return (
    <div className="notice-manager">
      <div className="notice-header">
        <h2>공지사항 관리</h2>
        <button className="add-notice-btn" onClick={handleAddNoticeOpen}>
          공지 추가
        </button>
        {/* 언어 변경 셀렉트: 이 페이지에서만 새로고침 적용 */}
        <select
          className="notice-language-select"
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          style={{ marginLeft: 16 }}
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
        </select>
      </div>

      <table className="notice-table">
        <thead>
          <tr>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>수정일</th>
          </tr>
        </thead>
        <tbody>
          {noticeList.map((notice) => (
            <tr
              key={notice.post_id}
              onClick={() => fetchNoticeDetail(notice.post_id)}
              style={{ cursor: "pointer" }}
            >
              <td>{notice.subject}</td>
              <td>{notice.user_name}</td>
              <td>{new Date(notice.created_date).toLocaleString("ko-KR")}</td>
              <td>{new Date(notice.updated_date).toLocaleString("ko-KR")}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && selectedNotice && (
        <div className="notice-modal-backdrop">
          <div className="notice-modal">
            <div className="notice-modal-section">
              <label htmlFor="notice-subject">제목</label>
              <input
                id="notice-subject"
                type="text"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
              />
            </div>

            <div className="notice-modal-section">
              <label htmlFor="notice-content">내용</label>
              <textarea
                id="notice-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={10}
              />
            </div>

            <p>
              작성일:{" "}
              {new Date(selectedNotice.created_date).toLocaleString("ko-KR")}
              <br />
              수정일:{" "}
              {new Date(selectedNotice.updated_date).toLocaleString("ko-KR")}
            </p>

            <div className="notice-modal-buttons">
              <button onClick={handleUpdate}>수정</button>
              <button>삭제</button>
              <button onClick={() => setIsModalOpen(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="notice-modal-backdrop">
          <div className="notice-modal">
            <div className="notice-modal-section">
              <label htmlFor="new-subject">제목</label>
              <input
                id="new-subject"
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
              />
            </div>

            <div className="notice-modal-section">
              <label htmlFor="new-content">내용</label>
              <textarea
                id="new-content"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={10}
              />
            </div>

            <div className="notice-modal-buttons">
              <button onClick={handleAddNotice}>저장</button>
              <button onClick={handleAddNoticeClose}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
