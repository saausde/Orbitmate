import React from "react";
//import "../../css/AdminCSS/AdminPage.css";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ onSelect, current }) {
  const navigate = useNavigate();

  return (
    <div className="admin-sidebar">
      <h2>관리자 메뉴</h2>
      <ul>
        <li
          className={current === "users" ? "active" : ""}
          onClick={() => onSelect("users")}
        >
          유저 관리
        </li>
        <li
          className={current === "chats" ? "active" : ""}
          onClick={() => onSelect("chats")}
        >
          채팅 관리
        </li>
        <li
          className={current === "notices" ? "active" : ""}
          onClick={() => onSelect("notices")}
        >
          공지 관리
        </li>
        <li
          className={current === "qna" ? "active" : ""}
          onClick={() => onSelect("qna")}
        >
          QnA 관리
        </li>
      </ul>

      {/* 메인화면으로 이동 버튼 */}
      <div className="go-main-button" onClick={() => navigate("/")}>
        타이틀 화면으로
      </div>
    </div>
  );
}
