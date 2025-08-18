// 훅(Hook) : 리액트에서 함수형 컴포넌트에서 상태 관리와 생명주기 기능을 사용할 수 있게 해주는 기능
// useState: 함수형 컴포넌트에서 컴포넌트의 생명주기(상태 갱신, 비활성화)와 관련된 작업(data 연동, 구독) 등을 처리할 때 사용
// useEffect: 컴포넌트가 호출된 후 특정 작업을 수행하거나, 컴포넌트가 갱신될 때마다 실행되는 함수를 정의할 때 사용
// useParams: URL 파라미터를 추출하여 컴포넌트에서 사용할 수 있게 해주는 훅
// useNavigate: 페이지 이동을 위한 함수형 컴포넌트에서 사용되는 훅
// useTranslation: 다국어 지원을 위한 i18n 라이브러리의 훅으로, 현재 언어 설정과 번역 기능을 제공
import { useEffect, useState, useRef, useContext } from "react";
import { ChatContext } from "../../contexts/ChatContext";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../../css/NoticeDetail.css";
import "../../css/dark.css";
import right_arrow from "../../images/right-arrow.png";
import remove_icon from "../../images/remove_icon.png";
import edit_icon from "../../images/edit_icon.png";
import happy from "../../images/happy.png";
import neutral from "../../images/neutral.png";
import dissapointment from "../../images/dissapointment.png";
import { useUser } from "../../contexts/UserContext";
import Profile from "../Settings/Profile";
import Sidebar from "../Sidebar";

function NoticeDetail() {
  // 현재 위치 정보 가져오기
  const location = useLocation();
  //현재 사용자 정보 보내기
  const { user } = useUser();
  // URL 파라미터에서 공지 ID 추출
  const { id } = useParams();
  // 공지 상세 데이터 상태
  const [notice, setNotice] = useState(null);
  // 페이지 이동을 위한 navigate
  const navigate = useNavigate();
  // 피드백(만족도) 중복 클릭 방지 상태
  const [voted, setVoted] = useState(false);
  // 다국어 처리 훅
  const { t, i18n } = useTranslation();
  // 현재 언어 상태
  const [lang, setLang] = useState(i18n.language || "ko");
  // 댓글 열고닫기
  const [seecommentsFrame, setseecommentsFrame] = useState(false);
  //댓글 값 저장
  const [commentValue, setcommentValue] = useState("");
  //댓글 목록 담기
  const [commentList, setcommentList] = useState([]);
  //유저아이디 저장
  const user_name = user?.login?.username;
  //댓글 아이디저장
  const comment_id = commentList.comment_id;
  //삭제/수정팝업 보이게 하는 참/거짓
  const [showEdit_delete, setshowEdit_delete] = useState(false);
  //댓글 수정 창
  const [showCommentEdit, setshowCommentEdit] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  //사용자 선호 언어 가져오기
  const language = user?.settings?.language;
  //공지 또는 QnA 구별하기
  const is_notice = notice?.is_notice;
  console.log("지금 공지인가요?", is_notice);

  // 프로필 드롭다운 상태 관리
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const handleEditProfile = () => {
    setIsDropdownOpen(false);
    // 프로필 편집 로직 (구현 필요)
  };
  const handleLogout = () => {
    setIsDropdownOpen(false);
    navigate("/signin");
  };

  // 사이드바 컴포넌트에 사용할 변수 선언
  const { session_id } = useParams(); // URL에서 세션 ID 추출
  const context = useContext(ChatContext); // 채팅 컨텍스트
  const { showSidebar, setShowSidebar } = context; // 사이드바 상태
  const mainRef = useRef(null);

  // 사이드바 토글 함수
  // 현재 세션 정보 표시용 메시지
  const sidebarUserMessage = session_id
    ? `Current Session: ${session_id.substring(0, 8)}...`
    : "No active session";

  // 사이드바 토글 함수
  const toggleSidebar = () => setShowSidebar((prev) => !prev);

  // 페이지 로드 시 사이드바 상태 초기화
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0; // 페이지 로드 시 스크롤을 맨 위로 이동
    }
    setShowSidebar(false); // 초기 상태에서 사이드바를 숨김
  }, [setShowSidebar]);

  //수정한 값 가져오기
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");

  //댓글 수 카운팅
  const numberOfComments = 0;

  // 공지 상세 데이터 fetch (id 또는 언어 변경 시마다)
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/posts/${id}/?language=${language}`
        );
        if (!response.ok) throw new Error(`서버 응답 오류: ${response.status}`);
        const data = await response.json();
        setNotice(data.data || data);
        console.log(">>", notice);
      } catch (error) {
        console.error(error);
        setNotice(null);
      }
    })();
  }, [id, language]);

  // 댓글 목록 불러오기 함수
  const fetchcommentList = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/posts/${id}/comments`
      );
      const data = await response.json();
      console.log("댓글 응답 전체:", data);

      setcommentList(data.data.comments);
    } catch (error) {
      console.error("댓글 정보 불러오기 실패:", error);
    }
  };

  //댓글 목록 불러오기
  useEffect(() => {
    if (id) fetchcommentList();
  }, [id]);

  //댓글 생성 DB접근 (완료)
  const submit_comments = async (e) => {
    e.preventDefault(); // 새로고침 막기
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/posts/${id}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: commentValue,
            user_name: user?.login?.username,
          }),
        }
      );

      const data = await response.json();
      console.log("댓글 등록 성공:", data);
      alert("댓글이 등록되었습니다!");
      setcommentValue("");
      // 댓글 목록 새로고침
      fetchcommentList();

      console.log("전송할 데이터:", {
        content: commentValue,
        user_name,
      });
      //navigate("/notice"); 등록 후 페이지 이동
    } catch (error) {
      console.error("댓글 등록 실패:", error);
      alert("댓글등록에 실패했습니다.");
    }
  };

  useEffect(() => {
    console.log("업데이트된 commentList:", commentList);
  }, [commentList]);

  // 게시글 삭제
  const deletePost = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/posts/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({ id, user_name }),
        }
      );

      if (!response.ok) {
        throw new Error("삭제 실패");
      }

      const result = await response.json();
      console.log("삭제 성공:", result);
      alert("글이 삭제되었습니다.");
      navigate("/notice"); //삭제 후 목록으로 이동
    } catch (error) {
      console.error("에러 발생:", error);
      alert("해당 게시글은 본인만 삭제할 수 있습니다.");
    }
  };

  //게시글 수정
  const editPost = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/posts/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            id,
            user_name,
            subject: subject,
            content: content,
            pwd: password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("수정 실패");
      }

      const result = await response.json();
      console.log("수정 성공:", result);
      alert("글이 수정되었습니다.");
      setshowEdit_delete(false);
    } catch (error) {
      console.error("에러 발생:", error);
      alert("해당 게시글은 본인만 수정할 수 있습니다.");
    }
  };

  //댓글삭제
  const deleteComment = async (comment_id) => {
    console.log("유저이름:", user_name);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/comments/${comment_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_name }),
        }
      );

      if (!response.ok) {
        throw new Error("삭제 실패");
      }

      const result = await response.json();
      console.log("댓글 삭제 성공:", result);
      alert("댓글이 삭제되었습니다.");
      // 댓글 목록 새로고침 등 추가
      fetchcommentList();
    } catch (error) {
      console.error("에러 발생:", error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  //댓글 수정
  const editComment = async (comment_id) => {
    console.log("현재 댓글 아아디", comment_id);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/comments/${comment_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            user_name,
            content: content,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("수정 실패");
      }

      const result = await response.json();
      console.log("댓글 수정 성공:", result);
      alert("댓글이 수정되었습니다.");
      setshowCommentEdit(false);
    } catch (error) {
      console.error("댓글 수정 에러 발생:", error);
      alert("해당 댓글은 본인만 수정할 수 있습니다.");
    }
  };

  // 메인 페이지로 이동
  const goToMain = () => navigate("/");
  // 공지 목록 페이지로 이동
  const goToNoticeList = () => navigate("/notice", { state: { is_notice } });
  // 언어 변경 핸들러
  const handleLangChange = (e) => {
    i18n.changeLanguage(e.target.value);
    setLang(e.target.value);
  };

  //피드백(만족도) 전송 핸들러
  const handleFeedback = async (type) => {
    if (voted) return; // 이미 투표했으면 무시
    setVoted(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/feedback`,
        {
          // method: 전송 방식
          // POST: 데이터를 주소창에 파라미터를 표시하지 않고 서버에 전송할 때 사용
          // headers: 요청 헤더 설정
          // "Content-Type": "application/json": 요청 본문이 JSON 형식임을 명시
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, idx: id }),
        }
      );
      if (!response.ok) throw new Error("서버 오류");
      alert("피드백 감사합니다!");
    } catch (error) {
      alert("피드백 전송 실패");
    }
  };

  // 데이터 로딩 중 처리
  if (!notice) return <div>Loading...</div>;

  const seecomments = () => {
    setseecommentsFrame((prev) => !prev);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit_comments(e);
      // setcommentValue(""); 제거 - submit_comments에서 처리
    }
  };
  const yourValue = lang === "ko" ? notice.content_ko : notice.content_en;

  function handleSubmit(event) {
    event.preventDefault(); // 페이지 리로드 방지

    const password = event.target.password.value; // input name="password"의 값 읽기

    if (password === "맞는 비밀번호") {
      // 수정 처리 로직
    } else {
      /*alert("비밀번호가 틀렸습니다.");*/
    }
  }

  function handleSubmit_Comment(e) {
    e.preventDefault();

    if (!content.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    if (!selectedCommentId) {
      alert("수정할 댓글 ID가 없습니다.");
      return;
    }

    editComment(selectedCommentId); // 여기서 editComment 호출
  }

  return (
    <div className="noticeDetail_container">
      <div className="sidebar_notice_page">
        {/* Sidebar를 최상위에 렌더링하여 브라우저 기준 고정 */}
        <Sidebar
          userMessage={sidebarUserMessage}
          showSidebar={showSidebar}
          toggleSidebar={toggleSidebar}
          location={location} // 추가
        />
      </div>
      {/* 상단 헤더 영역 */}
      <div className="head_page">
        <div className="title_section_noticeMain">
          <h1 className="title">
            <a onClick={goToMain}>OrbitMate</a>
          </h1>
          <div className="qna_Notice_f"></div>
        </div>
        {/* 검색창 (기능 없음) */}
        <input
          name="search_box"
          className="search_box"
          placeholder={t("noticeBoard_main.text_placeholder")}
        />
        <div className="profile_notice_page">
          {/* 프로필 드롭다운 */}
          <Profile
            isDropdownOpen={isDropdownOpen}
            onToggleDropdown={toggleDropdown}
            onEditProfile={handleEditProfile}
            onLogout={handleLogout}
          />
        </div>
      </div>
      {/* 공지 상세 내용 영역 */}
      <div className="notice_detail_content">
        <div className="direction_part">
          <div className="direction_left">
            <a
              className="direction"
              href="/notice"
              onClick={(e) => {
                e.preventDefault();
                goToNoticeList();
              }}
            >
              {is_notice
                ? t("notice_detail.direction")
                : t("notice_detail.directionToQnA")}
            </a>
            <img
              src={right_arrow}
              className="right_arrow_for_notice_detail"
              alt="right arrow"
            />
            <a
              className="direction2"
              href="#"
              tabIndex={-1}
              style={{
                pointerEvents: "none",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              {notice?.translation?.subject}
            </a>
          </div>

          <h3 className="noice_date">{notice?.created_date.slice(0, 10)}</h3>
        </div>

        {/* 공지 제목 */}
        <div className="subject_line_QnA">
          <h2>{notice.translation?.subject}</h2>
          <h3 className="postWriter">
            {notice?.user_name === "관리자"
              ? `👨‍🚀${notice?.user_name}`
              : notice?.user_name}
          </h3>
        </div>
        {/* 수정창 */}
        {showEdit_delete && (
          <form onSubmit={handleSubmit}>
            <div className="confirm_edit">
              <h2>{t("post_edit.form_title")}</h2>
              <div className="confirm_edit_body">
                <h3>{t("post_edit.subject_label")}</h3>
                <input
                  className="edit_input subject"
                  name="subject"
                  placeholder={t("post_edit.subject_placeholder")}
                  /*value={notice?.translation?.subject}*/
                  onChange={(e) => setSubject(e.target.value)}
                />
                <h3>{t("post_edit.content_label")}</h3>
                <textarea
                  className="edit_input content"
                  name="content"
                  placeholder={t("post_edit.content_placeholder")}
                  /* value={notice?.translation?.content}*/
                  onChange={(e) => setContent(e.target.value)}
                ></textarea>
                <h3>{t("post_edit.password_label")}</h3>
                <input
                  className="edit_input password"
                  type="password"
                  name="password"
                  placeholder={t("post_edit.password_placeholder")}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" onClick={() => editPost(id)}>
                {t("comment_edit.submit_button")}
              </button>
              <button
                value="수정"
                type="button"
                onClick={() => setshowEdit_delete(false)}
              >
                {t("comment_edit.cancel_button")}
              </button>
            </div>
          </form>
        )}
        {/*댓글 수정 창*/}
        {showCommentEdit && (
          <form onSubmit={handleSubmit_Comment}>
            <div className="confirm_edit">
              <h2>{t("comment_edit.form_title")}</h2>
              <div className="confirm_edit_body">
                <h3>{t("comment_edit.content_label")}</h3>
                <textarea
                  value={content}
                  className="edit_input content"
                  name="content"
                  placeholder={t("comment_edit.content_placeholder")}
                  /* value={notice?.translation?.content}*/
                  onChange={(e) => setContent(e.target.value)}
                ></textarea>
              </div>

              <button
                type="submit"
                onSubmit={() => {
                  editComment(comment_id);
                }}
              >
                {t("comment_edit.submit_button")}
              </button>
              <button
                value="수정"
                type="button"
                onClick={() => setshowCommentEdit(false)}
              >
                {t("comment_edit.cancel_button")}
              </button>
            </div>
          </form>
        )}
        {/* 게시글 본문 */}
        <div className="notice_content_part">
          <p className="notice_content">{notice.translation?.content}</p>
          {/*<p dangerouslySetInnerHTML={{ __html: yourValue }} />*/}
        </div>
        {/*댓글 영역*/}
        {!notice?.is_notice && notice?.user_name === user_name && (
          <>
            <div className="comment_input_f">
              <button
                className="delete_post_btn"
                onClick={() => deletePost(id)}
              >
                <img className="delete_comment_btn_icon" src={remove_icon} />
                {t("notice_detail.delete_post")}
              </button>
              <button
                className="edit_post_btn"
                onClick={() => setshowEdit_delete(true)}
              >
                <img className="delete_comment_btn_icon" src={edit_icon} />
                {t("notice_detail.edit_post")}
              </button>
            </div>
            <div className="seeComments_btn_wrap">
              <button className="seeComments_btn" onClick={seecomments}>
                💬 {t("notice_detail.view_comments")} ({commentList.length})
              </button>
              {seecommentsFrame && (
                <form onSubmit={submit_comments}>
                  <input
                    className="comment_input"
                    value={commentValue}
                    onChange={(e) => setcommentValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={t("notice_detail.input_comment_guide")}
                  />
                </form>
              )}
              {/* 댓글 보기 버튼 클릭 시 댓글 프레임 보이기 */}
              {seecommentsFrame && (
                <div className="comments_frame">
                  {/* 댓글 목록 표시 */}
                  {commentList && commentList.length > 0 && (
                    <div className="comments_list">
                      {commentList.map((comment) => (
                        <div
                          key={comment.comment_id}
                          className="comment_card_f"
                        >
                          <div className="comment_header">
                            {/*user?.profile?.profile_image_path && ( 현재 본인이 아닌 다른 유저의 이미지를 가져오는데 문제가 있어 잠시 주석처리하였음
                              <img
                                src={
                                  user.profile.profile_image_path.startsWith(
                                    "http"
                                  )
                                    ? user.profile.profile_image_path //문제지점 프로필 이미지 어떻게 가져올지 고민
                                    : `${process.env.REACT_APP_API_BASE_URL}${user.profile.profile_image_path}`
                                }
                                alt="avatar"
                                className="avatar"
                              />
                            )*/}
                            <div className="user_info">
                              <span className="username">
                                {comment.user_name === "관리자"
                                  ? ` 👨‍🚀${comment.user_name}`
                                  : comment.user_name}
                              </span>
                              <span className="timestamp">
                                {new Date(
                                  comment.created_date
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="comment_content">
                            {comment.content}
                          </div>
                          <div className="comment_actions">
                            <div className="left_actions">
                              {/* <span>👍 0</span>
                              <span>💬 0</span>
                              <span className="reply_btn">Reply</span>*/}
                            </div>
                            <div className="right_actions">
                              {comment.user_name === user_name && (
                                <>
                                  <button
                                    className="delete_comment_btn"
                                    onClick={() =>
                                      deleteComment(
                                        comment.comment_id,
                                        user_name
                                      )
                                    }
                                  >
                                    <img
                                      className="delete_comment_btn_icon"
                                      src={remove_icon}
                                    />
                                    {t("notice_detail.delete_post")}
                                  </button>
                                  {/*댓글 수정*/}
                                  <button
                                    className="edit_comment_btn"
                                    onClick={() => {
                                      setshowCommentEdit(true);
                                      setSelectedCommentId(comment.comment_id);

                                      setContent(comment.content);
                                    }}
                                  >
                                    <img
                                      className="delete_comment_btn_icon"
                                      src={edit_icon}
                                    />
                                    {t("notice_detail.edit_post")}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          <hr />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
        {/* 만족도 피드백 영역 
        <div className="satisfaction_frame">
          {notice?.is_notice ? (
            <h5 className="satisfaction_header">
              {t("notice_detail.satisfaction_quote")}
            </h5>
          ) : (
            <h5 className="satisfaction_header">
              {t("notice_detail.satisfaction_quote_QnA")}
            </h5>
          )}

          {/* 만족/보통/불만족 아이콘 클릭 시 피드백 전송 
          <div className="satisfaction_icons">
            <img
              src={happy}
              alt="happy"
              onClick={() => handleFeedback("happy")}
              style={{
                opacity: voted ? 0.5 : 1,
                cursor: voted ? "not-allowed" : "pointer",
              }}
            />
            <img
              src={neutral}
              alt="neutral"
              onClick={() => handleFeedback("neutral")}
              style={{
                opacity: voted ? 0.5 : 1,
                cursor: voted ? "not-allowed" : "pointer",
              }}
            />
            <img
              src={dissapointment}
              alt="dissapointment"
              onClick={() => handleFeedback("dissapointment")}
              style={{
                opacity: voted ? 0.5 : 1,
                cursor: voted ? "not-allowed" : "pointer",
              }}
            />
          </div>
        </div>*/}
      </div>
    </div>
  );
}

export default NoticeDetail;
