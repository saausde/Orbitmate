// Sidebar 컴포넌트: 채팅 목록, 새 채팅, QnA/공지 이동, 채팅 옵션(이름 변경/삭제) 등 제공
import React, { useRef, useEffect, useContext, useState } from "react";
import ConfirmModal from "./ConfirmModal";
import { ChatContext } from "../contexts/ChatContext";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import "../css/Sidebar.css";
import "../css/dark.css";
import sideBarImg from "../images/sidebar_icon4.png";
import newChat_icon from "../images/newChat_icon.png";
import orbitmateIcon1 from "../images/orbitmateIcon1.png";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import SearchChatList from "./SearchChatList";

// 주요 기능별로 상세 주석 추가
function Sidebar({ userMessage = "" }) {
  // [상태] 모달 대상, 편집 제목, 모달 위치 등

  const { t, i18n } = useTranslation();
  // 현재 언어 상태 (초기값: 현재 i18n 언어)

  const [modalTarget, setModalTarget] = useState(null); // {id, title} 또는 null
  const [editTitle, setEditTitle] = useState(""); // 채팅 제목 편집용
  const [showModalPos, setShowModalPos] = useState({ top: 0, left: 0 }); // 모달 위치
  const [showConfirm, setShowConfirm] = useState(false);
  const modalBtnRef = useRef(null);
  const profileRef = useRef(null);

  // [컨텍스트] 사용자, 채팅 관련 함수/상태
  const { user } = useUser();

  const {
    currentChatId,
    currentTitle,
    deleteChat,
    chats: chatsRaw,
    setChats,
    clearChats,
    NewChat,
    switchChat,
    showSidebar,
    setShowSidebar,
  } = useContext(ChatContext);
  const chats = Array.isArray(chatsRaw) ? chatsRaw : [];
  const navigate = useNavigate();

  // [사이드바 토글] 열기/닫기
  const toggleSidebar = () => setShowSidebar((prev) => !prev);

  // [채팅 이름 변경 모달] 모달 열기 및 편집 제목 설정
  const updateChat = async (chatId, newTitle) => {
    // 유효성 검사: 빈 제목이면 요청 보내지 않음
    if (!newTitle || newTitle.trim() === "") {
      alert("제목을 입력해 주세요.");
      return;
    }

    setEditTitle(newTitle);
    setModalTarget({ id: chatId, title: newTitle });

    try {
      // 2. API 호출
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/chat/sessions/${chatId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: newTitle,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("채팅 제목 변경 실패");
      }

      const result = await response.json();

      // 3. 변경 결과를 chats에 반영 (Context가 setChats 제공한다고 가정)
      const updatedChats = chats.map((chat) =>
        chat.session_id === chatId
          ? { ...chat, title: result.data.title }
          : chat
      );

      if (typeof setChats === "function") {
        setChats(updatedChats);
      }

      localStorage.setItem("chats", JSON.stringify(updatedChats));
    } catch (error) {
      console.error("채팅 제목 변경 중 오류:", error);
      alert("채팅 제목 변경에 실패했습니다.");
    }
  };

  // [모달 외부 클릭 시 닫기] 모달 바깥 클릭 감지
  useEffect(() => {
    if (!modalTarget) return;

    const handleClick = (e) => {
      if (
        document.getElementById("sidebar-modal-pop") &&
        !document.getElementById("sidebar-modal-pop").contains(e.target)
      ) {
        setModalTarget(null);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [modalTarget]);

  // [새 채팅 생성] 로그인 필요, 생성 후 해당 채팅으로 이동
  const handleNewChat = async () => {
    if (!user?.storedValue) {
      alert("로그인 후 이용해 주세요.");
      navigate("/signin");
      return;
    }

    const sessionId = await NewChat(); // 세션만 추가, 이동하지 않음
    navigate(`/chat/${sessionId}`);
  };

  // [채팅 세션 전환] 채팅 클릭 시 해당 세션으로 이동
  const change_session_id = (id) => {
    navigate(`/chat/${id}`);
  };

  // [QnA/공지 이동]
  const goToQnA = () => {
    navigate("/qna");
  };
  const goTonotice_Board = () => {
    navigate("/notice");
  };

  // 채팅 세션 전체 삭제
  const handleDeleteAll = async () => {
    const success = await clearChats();
    if (success) {
      // 성공 후 동작
    }
    setShowConfirm(false);
    navigate("/");
  };

  const creatorPage = () => {
    navigate("/about_us");
  };

  const goToMain = () => {
    navigate("/");
  };

  // [채팅 미리보기 메시지] 20자 초과 시 ... 처리
  const displayMessage =
    userMessage && userMessage.length > 0
      ? userMessage.length > 20
        ? `${userMessage.substring(0, 9)}...`
        : userMessage
      : t("ChatLog.noMessages");

  // [렌더링] 사이드바, 채팅 목록, 옵션 모달 등 UI
  return (
    <div
      id="side_bar_main"
      className={showSidebar ? "sidebar-open" : "sidebar-closed"}
    >
      {/* 사이드바 토글 버튼 - 항상 보이게 */}
      <div>
        <img
          id="side_btn"
          src={sideBarImg}
          alt="사이드바 열기"
          style={{
            width: 32,
            height: 32,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={toggleSidebar}
        />
      </div>

      {/* 사이드바 프레임 */}
      <div className={`side_bar_frame${showSidebar ? " open" : " closed"}`}>
        {/* 새 채팅 생성 버튼 및 이미지*/}

        <button className="search_icon" onClick={goToMain} />
        <button className="new_chat_btn" onClick={handleNewChat}>
          {t("sidebar_buttons.new_chat")}
        </button>
        {/* 전체 채팅 삭제 버튼 */}
        <button className="new_chat_btn2" onClick={() => setShowConfirm(true)}>
          {t("sidebar_buttons.all_delete_chat")}
        </button>
        {showConfirm && (
          <ConfirmModal
            onConfirm={handleDeleteAll}
            onCancel={() => setShowConfirm(false)}
          />
        )}
        {/* 채팅 목록 */}
        <div className="sidebar_chat_list_wrapper">
          <ul className="sidebar-chat-list">
            {!Array.isArray(chats) || chats.length === 0 ? (
              <li className="chat-noMessage">{t("ChatLog.noMessages")}</li>
            ) : (
              chats.map((chat) => {
                const safeTitle = chat?.title || "새 채팅";

                return (
                  <li
                    key={chat.session_id}
                    onClick={() => {
                      change_session_id(chat.session_id);
                      switchChat(chat.session_id);
                    }}
                    title={safeTitle}
                    className={`chat-item ${
                      chat.session_id === currentChatId ? "active" : "inactive"
                    }`}
                    style={{ position: "relative" }}
                  >
                    {/* 채팅 미리보기(최대 20자) */}
                    {safeTitle.length > 20
                      ? `${safeTitle.slice(0, 17)}...`
                      : safeTitle}

                    {/* 채팅 옵션 버튼 (이름 변경/삭제) */}
                    <button
                      className="options-btn"
                      ref={
                        modalTarget && modalTarget.id === chat.id
                          ? modalBtnRef
                          : null
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setShowModalPos({
                          top: rect.top + window.scrollY + rect.height + 4,
                          left: rect.left + window.scrollX,
                        });
                        setModalTarget({
                          id: chat.session_id,
                          title: safeTitle,
                        });
                        setEditTitle(safeTitle);
                      }}
                      aria-label="채팅 옵션"
                    >
                      ···
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
        {/* QnA/Help Center 버튼 */}
        <div className="sidebar-bottom-buttons">
          {/*<input
            value="QnA"
            type="button"
            className="qnaButton"
            onClick={goToQnA}
          />*/}

          <button onClick={goTonotice_Board} className="helpCenter">
            {t("sidebar_buttons.helpCenter")}
          </button>
          <button className="creatorPage_btn" onClick={creatorPage}>
            {t("sidebar_buttons.aboutTheCreators")}
          </button>
        </div>
      </div>

      {/* 채팅 옵션 모달 (이름 변경/삭제) */}
      {modalTarget &&
        ReactDOM.createPortal(
          <div
            id="sidebar-modal-pop"
            className="sidebar-modal sidebar-modal-pop"
            style={{
              position: "fixed",
              top: showModalPos.top,
              left: showModalPos.left,
              zIndex: 4000,
              minWidth: "220px",
            }}
          >
            <h4 style={{ marginTop: 0 }}>{t("sidebar_buttons.edit_chat")}</h4>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="새 제목을 입력하세요"
              style={{ width: "80%", marginBottom: "12px" }}
            />
            <div>
              {/* 이름 변경 버튼 */}
              <button
                onClick={() => {
                  updateChat(modalTarget.id, editTitle);
                  setModalTarget(null);
                }}
              >
                {t("sidebar_buttons.edit_title")}
              </button>

              {/* 삭제 버튼 */}
              <button
                onClick={async () => {
                  const deletedId = modalTarget.id;
                  setModalTarget(null); // 모달 먼저 닫기
                  await deleteChat(deletedId); // context 내에서 currentChatId도 관리됨

                  // 삭제 후 남은 세션이 있으면 첫 번째 세션으로 이동, 없으면 메인으로 이동
                  const remaining = chats.filter(
                    (chat) => chat.session_id !== deletedId
                  );
                  if (remaining.length > 0) {
                    navigate(`/chat/${remaining[0].session_id}`);
                  } else {
                    navigate("/");
                  }
                }}
                style={{ background: "#e57373" }}
              >
                {t("sidebar_buttons.delete_chat")}
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default Sidebar;
