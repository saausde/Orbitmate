import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Notice_Board_icon from "../../images/notice_board_icon.png";
import right_arrow from "../../images/right-arrow.png";
import { useTranslation } from "react-i18next";
import "../../css/QnACSS/QnA_Main.css";

function QnA_Main() {
  const navigate = useNavigate();
  // Q&A 질문 목록 상태
  const [questions, setQuestions] = useState([]);
  // 다국어 처리 훅
  const { t, i18n } = useTranslation();

  //페이지 : 보고 있는 페이지 번호 저장
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // 서버에서 Q&A 질문 목록을 받아오는 함수
  const fetchQuestions = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/qna`);
      if (!response.ok)
        throw new Error("서버에서 데이터를 가져오는 데 실패했습니다.");

      const data = await response.json();

      setQuestions(Array.isArray(data.questions) ? data.questions : []);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error(err.message);
      setQuestions([]);
    }
  };

  // 컴포넌트가 마운트 될 때 질문 목록 불러오기
  useEffect(() => {
    fetchQuestions();
  }, [currentPage]);

  // 페이지 번호를 바꾸는 함수
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // 페이지네이션 숫자 버튼들을 만드는 함수
  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`page-number-button ${currentPage === i ? "active" : ""}`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="qna_main">
      <div className="qna_body_main">
        <h1>{t("qna.title", "Q&A 게시판")}</h1>
        {/* Q&A 질문 목록 테이블 */}
        <table className="qna_table_main" border={1}>
          <thead>
            <tr>
              <th>{t("qna.table.no", "번호")}</th>
              <th>{t("qna.table.subject", "제목")}</th>
              <th>{t("qna.table.author", "작성자")}</th>
              <th>{t("qna.table.date", "작성일")}</th>
              <th>{t("qna.table.status", "상태")}</th>
            </tr>
          </thead>
          <tbody>
            {/* 질문 리스트 렌더링 */}
            {questions.map((question) => (
              <tr key={question.id}>
                <td>{question.id}</td>
                <td
                  className="qna_subject"
                  onClick={() => navigate(`/qna/${question.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  {/* is_private이 1(true)이면 자물쇠 아이콘 표시 */}
                  {question.is_private === 1 && (
                    <span className="qna_private-icon">🔒 </span>
                  )}
                  {question.subject_ko}
                </td>
                <td>{question.nickname_ko}</td>
                <td>{new Date(question.created_at).toLocaleDateString()}</td>
                <td>
                  <span
                    className={`status-${
                      question.status === "답변완료" ? "completed" : "pending"
                    }`}
                  >
                    {question.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* 질문 작성 페이지로 이동 버튼 */}
        <button onClick={() => navigate("/qna/write")}>질문하기</button>
        <input type="button" value={"뒤로가기"} onClick={() => navigate(-1)} />

        {totalPages > 0 && (
          <div className="pagination-controls">
            <button
              className="page-nav-button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1} //현재 페이지가 1 이라면 ◁비활성화
            >
              {t("pagination.prev", "◁ 이전")}
            </button>

            {renderPageNumbers()}

            <button
              className="page-nav-button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages} //현재 페이지 마지막 이라면 ▷비활성화
            >
              {t("pagination.next", "다음 ▷")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default QnA_Main;
