import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/QnACSS/QnA_InsertForm.css";
import "../../css/dark.css";

function Notice_Board_InsertForm() {
  // useNavigate 훅을 사용하여 페이지 이동 기능 구현
  const navigate = useNavigate();
  // 공지사항 작성 폼의 입력값 useState 훅을 사용하여 상태 관리
  const [formData, setFormData] = useState({
    subject: "", // 공지 제목
    name: "", // 작성자 이름
    content: "", // 공지 내용
    pwd: "", // 비밀번호(수정/삭제용)
  });

  // 입력값 변경 시 상태 업데이트
  const handleChange = (e) => {
    const { name, value } = e.target; // 입력 필드의 name과 value 추출
    setFormData((prev) => ({ ...prev, [name]: value })); // 상태 업데이트
    // 예: name이 'subject'인 경우 formData.subject가 업데이트됨
  };

  // 폼 제출 시 서버로 데이터 전송
  const handleSubmit = async (e) => {
    e.preventDefault(); // 폼 제출 기본 동작 방지
    try {
      const response = await fetch("http://localhost:3001/api/notice", {
        // 공지사항 등록 API
        method: "POST", // POST 요청
        headers: { "Content-Type": "application/json" }, // JSON 형식으로 데이터 전송
        body: JSON.stringify(formData), // formData를 JSON 문자열로 변환
      });
      if (!response.ok) throw new Error("서버 응답 오류"); // 응답이 성공적이지 않으면 오류 발생
      alert("공지사항이 등록되었습니다!");
      navigate("/notice"); // 등록 후 공지사항 메인으로 이동
    } catch (error) {
      alert("등록 실패: " + error.message); // 오류 발생 시 알림
    }
  };

  return (
    <div className="wrapper">
      {/* 공지사항 작성 폼 */}
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="idx" />
        {/* 인덱스는 서버에서 자동 생성되므로 숨김 처리 */}
        <table className="table" border={1}>
          <tbody>
            <tr>
              <th className="header">제목</th>
              <td className="cell">
                {/* 제목 입력란 */}
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>
            <tr>
              <th className="header">작성자</th>
              <td className="cell">
                {/* 작성자 입력란 */}
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </td>
            </tr>
            <tr>
              <th className="header">내용</th>
              <td className="cell">
                {/* 내용 입력란 */}
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  style={{ resize: "none", border: "none" }}
                />
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="cell cell-buttons">
                {/* 비밀번호 입력 및 버튼 영역 */}
                비밀번호:
                <input
                  name="pwd"
                  type="password"
                  value={formData.pwd}
                  onChange={handleChange}
                  required
                />
                <input type="submit" value="추가" />
                <input
                  type="button"
                  value="뒤로가기"
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

export default Notice_Board_InsertForm;
