import React, { useState } from "react";
import Sidebar from "./AdminSidebar";
import UserManager from "./UserManager";
import ChatManager from "./ChatManager";
import NoticeManager from "./NoticeManager";
import QnAManager from "./QnAManager";

export default function AdminLayout() {
  const [currentPage, setCurrentPage] = useState("users");
  const [userList, setUserList] = useState([]); // 🔁 추가

  return (
    <div className="admin-dashboard">
      <Sidebar onSelect={setCurrentPage} current={currentPage} />
      <div className="admin-content">
        {currentPage === "users" && <UserManager setUserList={setUserList} />}
        {currentPage === "chats" && <ChatManager userList={userList} />}
        {currentPage === "notices" && <NoticeManager />}
        {currentPage === "qna" && <QnAManager />}
        {/* 이후 공지/QnA 등 추가 */}
      </div>
    </div>
  );
}
