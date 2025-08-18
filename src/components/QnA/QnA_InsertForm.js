import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import "../../css/dark.css";
import "../../css/QnACSS/QnA_InsertForm.css";

function QnA_InsertForm() {
  const navigate = useNavigate();
  //Context에서 필요한 모든 값을 가져옴.
  const { user, isLoggedIn, loading } = useUser();

  //'name' 필드는 더 이상 필요 없으므로 상태에서 제거
  const [formdatas, setformdatas] = useState({
    subject: "",
    content: "",
    pwd: "",
    is_private: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setformdatas((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    //Context의 isLoggedIn 값으로 로그인 상태를 확인
    if (!isLoggedIn) {
      alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
      navigate("/signin");
      return;
    }

    if (formdatas.is_private && !formdatas.pwd) {
      alert("비밀글 작성 시 비밀번호를 입력해야 합니다");
      return;
    }

    // localStorage에서 토큰을 가져옴 UserContext에 토큰이 있다면 user.token으로 가져와도 됨
    const token = localStorage.getItem("token");
    if (!token) {
      alert("인증 토큰이 없습니다. 다시 로그인해주세요.");
      navigate("/signin");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/qna", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 모든 API 요청에 인증 헤더를 추가
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formdatas,
          user_id: user.user_id, // Context의 user 객체에서 user_id를 사용
        }),
      });

      if (!response.ok) throw new Error("서버 응답 오류");

      alert("질문이 등록되었습니다!");
      navigate("/qna");
    } catch (error) {
      alert("등록 실패: " + error.message);
    }
  };

  //  Context가 사용자 정보를 로딩 중일 때, 잠시 대기
  if (loading) {
    return <div>사용자 정보를 확인 중입니다...</div>;
  }

  return (
    <div className="wrapper">
      <form id="board_QnA_insForm" onSubmit={handleSubmit} autoComplete="off">
        <table className="table" border={1}>
          <caption className="QnA_title">
            <h2>Q&A 질문 작성</h2>
          </caption>
          <tbody>
            <tr>
              <th className="header">제목</th>
              <td className="cell">
                <input
                  type="text"
                  name="subject"
                  value={formdatas.subject}
                  onChange={handleChange}
                  required
                  placeholder="제목을 입력하세요"
                />
              </td>
            </tr>

            {/* '작성자' 입력란은 로그인 정보로 대체되므로 삭제*/}

            <tr>
              <th className="header">내용</th>
              <td className="cell">
                <textarea
                  name="content"
                  value={formdatas.content}
                  onChange={handleChange}
                  style={{ resize: "none", border: "none" }}
                  required
                  placeholder="질문 내용을 입력하세요"
                ></textarea>
              </td>
            </tr>
            <tr>
              <th className="header">비밀글 설정</th>
              <td className="cell">
                <label>
                  <input
                    type="checkbox"
                    name="is_private"
                    checked={formdatas.is_private}
                    onChange={handleChange}
                  />
                  이 질문을 비밀글로 설정합니다.
                </label>
              </td>
            </tr>
            {formdatas.is_private && (
              <tr>
                <th className="header">비밀번호</th>
                <td className="cell">
                  <input
                    id="pwd"
                    name="pwd"
                    type="password"
                    value={formdatas.pwd}
                    onChange={handleChange}
                    required
                    placeholder="비밀번호 입력"
                  />
                </td>
              </tr>
            )}
            <tr>
              <td colSpan={2} className="cell cell-buttons">
                <input type="submit" value={"질문 등록"} />
                <input
                  type="button"
                  value={"뒤로가기"}
                  onClick={() => navigate(-1)}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
}

export default QnA_InsertForm;
