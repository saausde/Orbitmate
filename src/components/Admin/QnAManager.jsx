import React, { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import "../../css/AdminCSS/QnAManager.css";

export default function QnaManager() {
  const [qnaList, setQnaList] = useState([]); // QnA 목록
  const [selectedQna, setSelectedQna] = useState(null); // 선택한 질문
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림 여부
  const [answerContent, setAnswerContent] = useState(""); // 답변 내용 입력
  const [postDetail, setPostDetail] = useState(null);
  const [comments, setComments] = useState([]);

  const { user } = useUser();
  const userName = user?.profile?.username;

  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchQnAs();
  }, []);

  const fetchQnAs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/posts?language=ko`);
      const json = await res.json();

      if (!res.ok || json.status !== "success") {
        throw new Error("QnA 조회 실패");
      }

      // 공지사항 제외 (is_notice === false)
      const onlyQna = json.data.filter((post) => post.is_notice === false);
      setQnaList(onlyQna);
    } catch (err) {
      alert("QnA 로딩 실패: " + err.message);
    }
  };

  const handleRowClick = async (qna) => {
    try {
      const [postRes, commentRes] = await Promise.all([
        fetch(
          `${API_BASE}/api/posts/${qna.post_id}?language=ko&include_all_translations=true`
        ),
        fetch(
          `${API_BASE}/api/posts/${qna.post_id}/comments?limit=100&offset=0`
        ),
      ]);

      const postJson = await postRes.json();
      const commentJson = await commentRes.json();

      if (postJson.status !== "success" || commentJson.status !== "success") {
        throw new Error("상세 조회 실패");
      }

      setSelectedQna(qna);
      setPostDetail(postJson.data);
      setComments(commentJson.data.comments);
      setAnswerContent("");
      setIsModalOpen(true);
    } catch (err) {
      alert("상세 정보 불러오기 실패: " + err.message);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!userName) {
      alert("로그인 정보가 없습니다.");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/posts/${selectedQna.post_id}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: answerContent,
            user_name: "관리자",
            parent_comment_id: null,
          }),
        }
      );

      const json = await res.json();
      if (!res.ok || json.status !== "success") {
        throw new Error(json.error?.message || "답변 저장 실패");
      }

      alert("답변이 저장되었습니다.");
      setIsModalOpen(false);
      fetchQnAs(); // 목록 새로고침
    } catch (err) {
      alert("답변 저장 실패: " + err.message);
    }
  };

  return (
    <div className="qna-manager">
      <h2>QnA 관리</h2>

      <table className="qna-table">
        <thead>
          <tr>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>비고</th>
          </tr>
        </thead>
        <tbody>
          {qnaList.map((qna) => (
            <tr
              key={qna.post_id}
              onClick={() => handleRowClick(qna)}
              style={{ cursor: "pointer" }}
            >
              <td>{qna.subject}</td>
              <td>{qna.user_name}</td>
              <td>{new Date(qna.created_date).toLocaleString("ko-KR")}</td>
              <td>미답변</td> {/* 이후 답변 여부 판단 로직 추가 */}
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && postDetail && (
        <div className="qna-modal-backdrop">
          <div className="qna-modal">
            <h3>질문 상세 및 답변</h3>

            <p>
              <strong>제목:</strong>{" "}
              {postDetail?.translation?.subject || "(제목 없음)"}
            </p>
            <p>
              <strong>내용:</strong>
            </p>
            <div className="qna-question-content">
              {postDetail?.translation?.content || "(내용 없음)"}
            </div>

            <hr />
            <h4>댓글 목록</h4>
            <ul className="qna-comments">
              {comments.map((c) => (
                <li key={c.comment_id}>
                  <b>{c.user_name}</b>: {c.content}
                </li>
              ))}
            </ul>

            <textarea
              placeholder="답변을 입력하세요"
              rows={6}
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
            />

            <div className="modal-buttons">
              <button onClick={handleAnswerSubmit}>답변 저장</button>
              <button onClick={() => setIsModalOpen(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
