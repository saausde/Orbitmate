import React, { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import "../../css/AdminCSS/UserManager.css";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

export default function UserManager({ setUserList }) {
  const { user, DeleteAccount } = useUser();
  const [userList, setUserListLocal] = useState([]);
  const { t, i18n } = useTranslation();

  // 검색
  const [search, setSearch] = useState(""); // 입력창 상태
  const [filteredSearch, setFilteredSearch] = useState(""); // 버튼 눌렀을 때 적용

  // 정렬
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc"); // or "asc"

  // 페이지
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // 한 페이지당 항목 수

  useEffect(() => {
    fetchUsers();
  }, [i18n.language]);

  // 유저 정보 가져오기
  const fetchUsers = async () => {
    try {
      const lang = i18n.language || "ko";
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/users?include_inactive=true&language=${lang}`
      );
      const json = await res.json();

      if (!res.ok || json.status !== "success") {
        throw new Error(json.error || "유저 목록 불러오기 실패");
      }

      const users = json.data.users || [];

      setUserListLocal(users);
      setUserList(users);
    } catch (err) {
      alert("유저 목록 로드 실패: " + err.message);
    }
  };

  // 유저 정보 수정하기
  const updateStatus = async (userId, newStatus) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/${userId}/active-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ is_active: newStatus }),
        }
      );

      const json = await res.json();

      if (!res.ok || json.status !== "success" || !json.data.success) {
        throw new Error(json.data?.message || "상태 변경 실패");
      }

      fetchUsers(); // ✅ 목록 새로고침
    } catch (err) {
      alert("활성화 상태 변경 실패: " + err.message);
    }
  };

  const deleteUser = async (userId) => {
    await DeleteAccount(userId);
    fetchUsers(); // 삭제 후 갱신
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 검색어 기반 필터링된 리스트
  const filteredUsers = userList.filter(
    (u) =>
      u.username?.toLowerCase().includes(filteredSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(filteredSearch.toLowerCase())
  );

  // 정렬된 리스트
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // 날짜는 변환해서 비교
    if (sortBy === "created_at") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    // 문자열 비교 (username, email)
    if (typeof aValue === "string") {
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // boolean or date 비교
    return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
  });

  // 페이징 된 사용자 목록 계산
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

  // 페이지 개수 계산
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  // 정렬 토글
  const handleSort = (field) => {
    if (sortBy === field) {
      // 이미 같은 항목이면 순서만 반전
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // 다른 항목이면 해당 항목으로 기본 내림차순
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // 관리자 임명 및 해제
  const toggleAdmin = async (userId, currentStatus) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/${userId}/admin-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_admin: !currentStatus, // 현재 상태의 반대로
            user_id: userId,
          }),
        }
      );
      const json = await res.json();

      if (!res.ok || json.status !== "success") {
        throw new Error("관리자 변경 실패");
      }

      fetchUsers(); // 갱신
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="admin-section">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between", // 양쪽 정렬
          alignItems: "center", // 수직 가운데 정렬
          marginBottom: "15px",
        }}
      >
        <h2 style={{ margin: 0 }}>유저 목록</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault(); // 새로고침 방지
            setFilteredSearch(search); // 검색 실행
            setCurrentPage(1); // 검색 시 첫 페이지로 초기화
          }}
          style={{ display: "flex", gap: "8px" }}
        >
          <input
            type="text"
            placeholder="이메일 또는 이름 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "6px 10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
          <button
            type="submit" // 🔁 엔터 동작하도록 submit
            style={{
              padding: "6px 12px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              backgroundColor: "#f1f1f1",
              cursor: "pointer",
            }}
          >
            검색
          </button>
        </form>
      </div>
      <table>
        <thead>
          <tr>
            <th
              onClick={() => handleSort("user_id")}
              style={{ cursor: "pointer" }}
            >
              유저 ID{" "}
              {sortBy === "user_id" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
            </th>
            <th
              onClick={() => handleSort("email")}
              style={{ cursor: "pointer" }}
            >
              이메일{" "}
              {sortBy === "email" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
            </th>
            <th
              onClick={() => handleSort("username")}
              style={{ cursor: "pointer" }}
            >
              이름{" "}
              {sortBy === "username" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
            </th>
            <th
              onClick={() => handleSort("created_at")}
              style={{ cursor: "pointer" }}
            >
              생성일자{" "}
              {sortBy === "created_at" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
            </th>
            <th>상태</th>

            <th>비고</th>
          </tr>
        </thead>

        <tbody>
          {paginatedUsers.map((u) => (
            <tr key={u.user_id}>
              <td>{u.user_id}</td>
              <td>{u.email}</td>
              <td>{u.username}</td>
              <td>{formatDate(u.created_at)}</td>
              <td>
                {/*좀더 자세히 분류 필요*/}
                {u.is_admin ? "관리자" : u.is_active ? "일반" : "정지됨"}
                {"   "}
                <input
                  type="checkbox"
                  checked={u.is_active}
                  onChange={(e) => updateStatus(u.user_id, e.target.checked)}
                  disabled={u.is_admin}
                  style={{
                    marginLeft: "10px",
                    opacity: u.is_admin ? 0.5 : 1,
                    cursor: u.is_admin ? "not-allowed" : "pointer",
                  }}
                />
              </td>

              <td>
                <button
                  onClick={() => deleteUser(u.user_id)}
                  style={{
                    backgroundColor:
                      u.user_id === user.login.user_id ? "gray" : "red",
                    color: "white",
                    cursor:
                      u.user_id === user.login.user_id
                        ? "not-allowed"
                        : "pointer",
                    opacity: u.user_id === user.login.user_id ? 0.6 : 1,
                  }}
                  disabled={u.user_id === user.login.user_id} // 자기 자신이면 비활성화
                >
                  제거
                </button>

                <button
                  onClick={() => toggleAdmin(u.user_id, u.is_admin)}
                  style={{
                    marginLeft: "5px",
                    backgroundColor:
                      u.user_id === user.login.user_id ||
                      (!u.is_admin && !u.is_active)
                        ? "#555"
                        : "#007bff",
                    color: "white",
                    cursor:
                      u.user_id === user.login.user_id ||
                      (!u.is_admin && !u.is_active)
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      u.user_id === user.login.user_id ||
                      (!u.is_admin && !u.is_active)
                        ? 0.6
                        : 1,
                  }}
                  disabled={
                    u.user_id === user.login.user_id ||
                    (!u.is_admin && !u.is_active)
                  } // 자기 자신이면 비활성화
                >
                  {u.is_admin ? "관리자 해제" : "관리자 임명"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 숫자형 페이지네이션 */}
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {/* 이전 페이지 버튼 */}
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
          }}
        >
          &lt;
        </button>

        {/* 숫자 버튼 5개씩 */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((pageNum) => {
            const start = Math.floor((currentPage - 1) / 5) * 5 + 1;
            const end = start + 4;
            return pageNum >= start && pageNum <= end;
          })
          .map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                backgroundColor: pageNum === currentPage ? "#007bff" : "#fff",
                color: pageNum === currentPage ? "#fff" : "#000",
                fontWeight: pageNum === currentPage ? "bold" : "normal",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
            >
              {pageNum}
            </button>
          ))}

        {/* 다음 페이지 버튼 */}
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          }}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
