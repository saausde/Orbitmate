import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import Sidebar from "./AdminSidebar";
import UserManager from "./UserManager";
import AdminLayout from "./AdminLayout";
import "../../css/AdminCSS/AdminPage.css"; // 필요 시 CSS도 추가

export default function AdminPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("users");

  useEffect(() => {
    // 관리자 체크
    const checkAdminStatus = async () => {
      try {
        const userId = user?.profile?.user_id;
        if (!userId) throw new Error("사용자 정보 없음");

        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/users/${userId}/admin-status`
        );

        if (!response.ok) throw new Error("API 요청 실패");

        const result = await response.json();
        const isAdmin = result?.data?.is_admin;

        if (!isAdmin) throw new Error("관리자 아님");

        setLoading(false); // ✅ 통과 시 로딩 해제
      } catch (err) {
        alert("접근 권한이 없습니다.");
        navigate("/");
      }
    };

    checkAdminStatus();
  }, [user, navigate]);
  return <AdminLayout />;
}
