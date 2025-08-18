import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "../../css/Notice_Board.css";
import "../../css/dark.css";
import QnAIcon1 from "../../images/QnAIcon1.png";
import right_arrow from "../../images/right-arrow.png";
import chatBot_icon from "../../images/chatBot_icon.png";
import { useTranslation } from "react-i18next";
import ChatBot from "./ChatBot";
import { useUser } from "../../contexts/UserContext";
import "../../css/toAskPage.css";

function ToAskPage() {
  const [chatBot, setchatBot] = useState(false);
  const navigate = useNavigate();
  // 공지사항 목록 상태
  const [notices, setNotices] = useState([]);
  // 다국어 처리 훅
  const { t, i18n } = useTranslation();
  // 현재 언어 상태
  const [lang, setLang] = useState(i18n.language || "ko");
  const { user } = useUser();
  const [showNoticeOrQnA, setShowNoticeOrQnA] = useState(true);
  const [createQnA, setcreateQnA] = useState(null);
  const [subject, setsubject] = useState("");
  const [content, setContent] = useState("");
  const [pwd, setpwd] = useState("");
  const [origin_language, setorigin_language] = useState("kr");
  const [is_notice, setis_notice] = useState(false);
  const user_name = user?.login?.username;

  //게시글 생성 DB접근
  const handleSubmit = async (e) => {
    e.preventDefault(); // 새로고침 막기
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/posts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject,
            content,
            user_name,
            pwd,
            origin_language: "kor",
            is_notice,
          }),
        }
      );

      const data = await response.json();
      console.log("질문 등록 성공:", data);
      alert("질문이 등록되었습니다!");
      console.log("전송할 데이터:", {
        subject,
        content,
        user_name,
        pwd,
        origin_language,
        is_notice,
      });
      navigate("/notice"); // 등록 후 페이지 이동
    } catch (error) {
      console.error("질문 등록 실패:", error);
      alert("등록에 실패했습니다.");
    }
  };

  // 메인 페이지로 이동
  const goToMain = () => navigate("/");
  // 공지 상세 페이지로 이동
  const goToDetail = (post_id) => navigate(`/notice/${post_id}`);
  // 공지 작성 폼으로 이동
  const goToInsertForm = () => navigate("/insertFormPage");
  // 언어 변경 핸들러
  const questionPage = () => {
    navigate("/toAsk");
  };
  const handleChatBot = () => {
    setchatBot((prev) => !prev);
  };

  const handerNoticeOrQnA = () => {
    setShowNoticeOrQnA((prev) => !prev);
    console.log(">>>>!!", showNoticeOrQnA);
  };

  return (
    <div className="main">
      {/* 상단 헤더 영역 */}
      <div className="head_page">
        <h1 className="title">
          <a onClick={goToMain}>OrbitMate</a>
        </h1>
        {/* 검색창 (현재 기능 없음) */}
        <input
          name="search_box"
          className="search_box"
          placeholder={t("noticeBoard_main.text_placeholder")}
        />
      </div>
      {/* 질문 본문 영역 */}
      <div className="ask_main">
        {/* 질문 아이콘 및 부제목 */}
        <img src={QnAIcon1} alt="질문 아이콘" className="notice_icon_toAsk" />
        <h1 className="subtitle_toAsk">무엇이든 질문해 보세요!</h1>
        {/* 질문하기 폼 */}
        <form id="form_main_f" onSubmit={handleSubmit}>
          <div className="QnA_form_group">
            <label className="QnALableTitle" htmlFor="title">
              제목
            </label>
            <input
              className="QnA_subject_input"
              name="title"
              type="text"
              autoComplete="off"
              required
              onChange={(e) => setsubject(e.target.value)}
            />
            <label className="QnALablePass" htmlFor="pass">
              비밀번호
            </label>
            <input
              className="QnA_Password_input"
              name="pwd"
              type="password"
              autoComplete="off"
              required
              onChange={(e) => setpwd(e.target.value)}
            />
          </div>

          <div className="QnA_form_group2">
            <label className="QnALableContent" htmlFor="content">
              내용
            </label>
            <textarea
              className="QnA_content"
              name="content"
              rows="5"
              required
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
          </div>

          <button className="QnA_Ask_btn" type="submit">
            질문하기
          </button>
          <button
            type="button"
            className="backToBefore"
            onClick={() => navigate(-1)}
          >
            뒤로가기
          </button>
        </form>
      </div>
      {/*<button className="chatbot_btn" onClick={handleChatBot} />
      {chatBot && <ChatBot />}*/}
    </div>
  );
}

export default ToAskPage;
