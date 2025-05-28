import React, { useRef, useCallback, useEffect, useContext, useState } from "react";
import startButton from "../images/KakaoTalk_20250513_170023573_01.png";
import { ChatContext } from "../contexts/ChatContext";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import '../css/Sidebar.css';

// userMessage는 문자열이어야 함
function Sidebar({ showsidebarBtn, userMessage = "" }) {
  const navigate = useNavigate(); 
  const { user } = useUser();
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);
  const { currentChatId, deleteChat, chats, clearChats, resetChat, switchChat } = useContext(ChatContext);
  const [changecolor, setsetchangecolor] = useState(true);
  const [animationValue, setanimationValue] = useState(false);

  const delete_chat = () => {
    deleteChat(currentChatId);
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () =>
      document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleNewChat = async () => {                  // ← 변경: 새 핸들러 추가
    if (!user?.storedValue){
      alert("로그인 후 이용해 주세요.");   
      navigate("/signin");
      return;
    }

    const newId = await resetChat();                         // resetChat()이 newId 반환
    console.log(newId);
    navigate(`/chat/${newId}`);                        // 해당 URL로 이동
  };

  const change_session_id = (id) => {
    navigate(`/chat/${id}`);
  }

  const toggleDropdown = (chatId) => {
    setOpenDropdownId((prev) =>
      prev === chatId ? null : chatId
    );
  };

  // 버튼 색상 전환
  const activate_color = () => {
    setsetchangecolor((prev) => !prev);
    setanimationValue(true);
  };

  // 메시지가 없을 때 안내 문구
  const displayMessage =
    userMessage && userMessage.length > 0
      ? userMessage.length > 20
        ? `${userMessage.substring(0, 9)}...`
        : userMessage
      : "메시지가 없습니다.";

  const isOpen = !changecolor;

  return (
    <div
      id="side_bar_main"
      style={{ position: "relative", margin: "0", padding: "0" }}
    >      <input
        id="side_btn"
        type="button"
        onClick={activate_color}
        style={{
          width: "30px",
          height: "30px",
          top: "1.5vh",
          left: "10px",
          opacity: showsidebarBtn ? 1 : 0,
          transition: "opacity 0.3s ease, background-color 0.3s ease",
          pointerEvents: showsidebarBtn ? "auto" : "none",
          backgroundImage: `url(${startButton})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundColor: changecolor ? "transparent" : "rgb(139, 63, 211)",
          border: "none",
          cursor: "pointer",
          zIndex: "10",
          position: "absolute",
          borderRadius: "50%",
        }}
      />
      <div
        className="side_bar_frame"
        style={{
          width: "350px",
          height: "100.2vh",
          background:
            "linear-gradient(135deg, rgb(139, 63, 211), rgb(61, 35, 106))",
          position: "absolute",
          left: changecolor ? "-360px" : "-10px",
          top: "-10px",
          transition: "left 0.3s ease",
          zIndex: "1",
          overflowY: "auto",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          transform: showsidebarBtn ? "translateX(0px)" : "translateX(13px)",
          transition: "transform 0.5s ease, opacity 0.6s ease"
        }}
      >
        {isOpen && (
          <>
            <button
              className="new_chat_btn"
              type="button"
              onClick={() => {
                handleNewChat()
              }}
              style={{

              }}
            >
              새 채팅
            </button>

            <button
              className="new_chat_btn2"
              type="button"
              onClick={() => {
                clearChats()
              }}
              style={{

              }}
            >
              채팅내역 전체삭제
            </button>
          </>
        )}

        <ul
          style={{
            marginTop: "50px",
            marginRight: "50px",
            color: "white",
            fontWeight: "bold",
            fontSize: "15px",
            listStyle: "none",
            paddingLeft: "20px",
          }}
        >
          {chats.length === 0 ? (
            <li>메시지가 없습니다.</li>
          ) : (
            chats.map(chat => (
              <li
                key={chat.id}
                onClick={() => {
                  change_session_id(chat.id);
                  switchChat(chat.id);
                }} // ← 추가: 클릭 시 해당 세션으로 전환
                title={chat.messages[0]?.message_content || "새 대화"}                style={{
                  position: "relative",
                  display: "flex",
                  color: "black",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textAlign: "center",
                  cursor: "pointer",
                  width: "112%",
                  height: "100%",
                  padding: "10px 8px",
                  margin: "8px auto",
                  borderRadius: "8px",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  backgroundColor:
                    chat.id === currentChatId
                      ? "white"
                      : "rgba(255,255,255,0.2)",
                  transition: "all 0.2s ease"
                }}
              >
                {chat.messages[0]?.message_content.slice(0, 20) || "새 대화"}
                <button
                  className="options-btn"
                  onClick={e => {
                    e.stopPropagation();
                    toggleDropdown(chat.id);
                  }}
                  ref={profileRef}
                  style={{
                    fontSize: "20px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor:
                      chat.id === currentChatId
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(255,255,255,0.2)"
                  }}
                >
                  ···
                </button>

                {openDropdownId === chat.id && (
                  <div className="sidebar-dropdown-content" ref={dropdownRef}>
                    <a
                      href=""
                      onClick={e => {
                        e.preventDefault();
                        deleteChat(chat.id);
                      }}
                    >
                      삭제
                    </a>
                  </div>
                )}

              </li>
            ))
          )}
        </ul>

      </div>
    </div>
  );
}

export default Sidebar;