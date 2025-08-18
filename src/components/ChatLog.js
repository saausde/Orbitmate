// ChatLog.js
import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { ChatContext } from "../contexts/ChatContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import "../App.css";
import "../css/chatPage.css";
import "../css/dark.css";
import InputBox from "./InputBox";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remove_icon from "../images/remove_icon.png";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css"; // 또는 atom-one-dark.css 등
import { useTranslation } from "react-i18next";

function fixBoldWithKorean(text) {
  // 한글과 **볼드**가 붙어있으면 사이에 zero-width-space 삽입
  return text
    .replace(/([\uac00-\ud7af])(\*{2}.*?\*{2})/g, "$1\u200B$2")
    .replace(/(\*{2}.*?\*{2})([\uac00-\ud7af])/g, "$1\u200B$2");
}

function preserveLeadingSpaces(text) {
  // 각 줄의 맨 앞 연속 공백만 &nbsp;로 치환
  return text.replace(/^ +/gm, (spaces) => "\u00A0".repeat(spaces.length));
}

// ChatLog: 채팅 메시지 목록, 입력, 수정, 삭제, 로딩 등 UI/UX 관리 (채팅방에서만 사용)
function ChatLog({ session_id, showSidebar, toggleSidebar }) {
  const { getUserId, chats, setChats } = useContext(ChatContext);
  const location = useLocation();
  const initialInput = location.state?.inputValue || "";
  const { fontSize } = useTheme(); // 테마에서 폰트 크기 가져오기
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [autoScroll, setAutoScroll] = useState(true); // 자동 스크롤 상태
  const [streamingMessageId, setStreamingMessageId] = useState(null); // 스트리밍 중인 AI 메시지 ID

  const inputRef = useRef(null);
  const logRef = useRef(null);
  const codeRefs = useRef([]);
  const { t, i18n } = useTranslation();

  // 메시지 업데이트 헬퍼 함수 (ID 매핑 개선)
  const updateMessageById = useCallback((messageId, updates) => {
    setMessages((prev) => {
      let found = false;
      const updated = prev.map((msg) => {
        if (msg.message_id === messageId) {
          found = true;
          return { ...msg, ...updates, _renderKey: Date.now() };
        }
        return msg;
      });

      // 디버깅을 위한 로그
      if (!found) {
        console.warn(
          `메시지 ID ${messageId}를 찾을 수 없음. 현재 메시지 ID들:`,
          prev.map((m) => m.message_id)
        );
      }

      return updated;
    });
  }, []);

  // 도구 호출 상태 메시지 생성 함수 (확장 가능한 컴포넌트 문법 사용)
  const getToolStatusMessage = useCallback((toolData) => {
    const { type, tool_name, result_summary } = toolData;

    switch (type) {
      case "tool_start":
        return `\n\n:::ai-component type="tool-loading" name="${tool_name}" action="호출":::`;

      case "tool_progress":
        return `\n\n:::ai-component type="tool-loading" name="${tool_name}" action="실행":::`;

      case "tool_complete":
        if (result_summary) {
          return `\n\n:::ai-component type="tool-result" name="${tool_name}" result="${result_summary}":::`;
        } else {
          return `\n\n:::ai-component type="tool-complete" name="${tool_name}":::`;
        }

      case "tool_error":
        return `\n\n:::ai-component type="tool-error" name="${tool_name}" error="${toolData.error}":::`;

      case "tools_batch_start":
        return `\n\n:::ai-component type="batch-loading" action="시작":::`;

      case "tools_batch_complete":
        return ""; // 배치 완료는 표시하지 않음

      default:
        return "";
    }
  }, []);

  // AI 인라인 컴포넌트 렌더링 함수
  const renderAiComponent = useCallback((type, props) => {
    const componentProps = {
      key: `ai-comp-${Date.now()}-${Math.random()}`,
      ...props,
    };

    switch (type) {
      case "tool-loading":
        return (
          <div className="ai-tool-loading" {...componentProps}>
            <div className="tool-spinner-small"></div>
            <span>
              {props.name} {props.action} 중...
            </span>
          </div>
        );

      case "tool-result":
        return (
          <div className="ai-tool-result" {...componentProps}>
            <div className="tool-result-icon">📊</div>
            <div className="tool-result-content">
              <div className="tool-result-header">{props.name} 결과</div>
              <div className="tool-result-data">{props.result}</div>
            </div>
          </div>
        );

      case "tool-complete":
        return (
          <div className="ai-tool-complete" {...componentProps}>
            <div className="tool-complete-icon">✅</div>
            <span>{props.name} 완료</span>
          </div>
        );

      case "tool-error":
        return (
          <div className="ai-tool-error" {...componentProps}>
            <div className="tool-error-icon">❌</div>
            <span>
              {props.name} 실패: {props.error}
            </span>
          </div>
        );

      case "batch-loading":
        return (
          <div className="ai-batch-loading" {...componentProps}>
            <div className="batch-spinner"></div>
            <span>여러 도구 {props.action}...</span>
          </div>
        );

      default:
        return <span>알 수 없는 컴포넌트: {type}</span>;
    }
  }, []);

  // 메시지 내용에서 AI 컴포넌트 파싱 및 렌더링
  const parseMessageContent = useCallback((content) => {
    const componentRegex = /:::ai-component\s+(.+?):::/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = componentRegex.exec(content)) !== null) {
      // 컴포넌트 앞의 일반 텍스트 추가
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.slice(lastIndex, match.index),
        });
      }

      // 컴포넌트 속성 파싱
      const attributeStr = match[1];
      const attributes = {};
      const attrRegex = /(\w+)="([^"]+)"/g;
      let attrMatch;

      while ((attrMatch = attrRegex.exec(attributeStr)) !== null) {
        attributes[attrMatch[1]] = attrMatch[2];
      }

      parts.push({
        type: "component",
        componentType: attributes.type,
        props: attributes,
      });

      lastIndex = componentRegex.lastIndex;
    }

    // 마지막 일반 텍스트 추가
    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex),
      });
    }

    return parts;
  }, []);

  // 메시지 찾기 헬퍼 함수 (더 강력한 검색)
  const findMessageByIdOrContent = useCallback(
    (targetId, content = null) => {
      return messages.find((msg) => {
        // 정확한 ID 매치
        if (msg.message_id === targetId) return true;

        // 임시 ID 패턴 매치 (temp_user_, temp_ai_)
        if (
          targetId.startsWith("temp_") &&
          msg.message_id.startsWith("temp_")
        ) {
          return msg.message_id === targetId;
        }

        // 컨텐츠로 매치 (fallback)
        if (content && msg.message_content === content) {
          return true;
        }

        return false;
      });
    },
    [messages]
  );

  // 새 메시지 생성 헬퍼 함수
  const createMessage = useCallback(
    (messageId, messageType, content, isStreaming = false) => {
      const user_id = getUserId ? getUserId() : localStorage.getItem("user_id");
      return {
        message_id: messageId,
        session_id,
        user_id,
        message_type: messageType,
        message_content: content,
        created_at: new Date().toISOString(),
        ...(isStreaming && { isStreaming: true }),
      };
    },
    [session_id, getUserId]
  );

  useEffect(() => {
    if (initialInput && messages.length === 0) {
      // 메시지가 없을 때만 실행
      setInputMessage(initialInput);
      setTimeout(() => {
        inputRef.current?.focus(); // 포커스
        handleSendMessage({ preventDefault: () => {} });
      }, 100); // 살짝 지연해도 OK
    }
  }, [initialInput, messages]);

  useEffect(() => {
    if (!session_id) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/chat/sessions/${session_id}/messages`
        );

        const data = await response.json();

        if (!response.ok)
          throw new Error(
            data.error?.message ||
              data.error ||
              "메시지를 불러오는 데 실패했습니다."
          );

        // 응답 배열 정리
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : [];

        const normalized = arr.map((msg) => ({
          ...msg,
          message_type: msg.message_type?.toLowerCase() || "user", // 서버가 주는 값 그대로 쓰되, fallback 제공
        }));

        setMessages(normalized);
      } catch (err) {
        setError(err.message || "메시지를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [session_id]);

  // 채팅 제목 자동 생성 함수
  const generateChatTitle = async () => {
    try {
      const user_id = getUserId ? getUserId() : localStorage.getItem("user_id");
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/chat/sessions/${session_id}/generate-title`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id }),
        }
      );

      const data = await response.json();
      if (response.ok && data.status === "success") {
        console.log("채팅 제목 생성됨:", data.data.generated_title);

        // Sidebar에 반영하기 위해 chats 상태 업데이트
        if (setChats && Array.isArray(chats)) {
          const updatedChats = chats.map((chat) =>
            chat.session_id === session_id
              ? { ...chat, title: data.data.generated_title }
              : chat
          );
          setChats(updatedChats);

          // 로컬스토리지도 업데이트
          localStorage.setItem("chats", JSON.stringify(updatedChats));
        }
      }
    } catch (error) {
      console.error("제목 생성 실패:", error);
    }
  };

  const handleAIMessage = async (originalMessage) => {
    try {
      const user_id = getUserId ? getUserId() : localStorage.getItem("user_id");

      // 1. 먼저 사용자 메시지를 즉시 화면에 표시
      const tempUserMessageId = `temp_user_${Date.now()}`;
      const userMessage = createMessage(
        tempUserMessageId,
        "user",
        originalMessage
      );

      setMessages((prev) => [...prev, userMessage]);

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/chat/sessions/${session_id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id,
            message: originalMessage,
            specialModeType: "stream",
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("스트리밍 응답을 받을 수 없습니다.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let aiMessage = "";
      let userMessageId = null;
      let aiMessageId = null;
      let aiMessageCreated = false;
      let tempAiMessageId = null;
      let streamingCompleted = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk
          .split("\n")
          .filter((line) => line.startsWith("data:"));

        for (const line of lines) {
          const dataStr = line.replace(/^data:\s*/, "").trim();
          if (!dataStr) continue;

          // done 신호 체크 (단순 문자열)
          if (dataStr === '{"done":true}') {
            console.log("스트리밍 완료 신호 수신");
            const currentAiId = aiMessageId || tempAiMessageId;
            if (currentAiId && aiMessageCreated) {
              updateMessageById(currentAiId, { isStreaming: false });
            }
            setStreamingMessageId(null);
            streamingCompleted = true;
            break;
          }

          // 도구 실행 이벤트 처리
          if (
            dataStr.includes('"type":"tool_') ||
            dataStr.includes('"type":"tools_batch_')
          ) {
            try {
              const toolEvent = JSON.parse(dataStr);
              if (
                toolEvent.type &&
                (toolEvent.type.startsWith("tool_") ||
                  toolEvent.type.startsWith("tools_batch_"))
              ) {
                const toolStatusMessage = getToolStatusMessage(toolEvent);

                // 현재 스트리밍 중인 AI 메시지에 도구 상태 추가
                const currentAiId = aiMessageId || tempAiMessageId;
                if (currentAiId && aiMessageCreated && toolStatusMessage) {
                  // 기존 메시지에 도구 상태 추가 (이전 도구 상태는 제거)
                  let updatedMessage = aiMessage;

                  // 이전 도구 상태 메시지 제거 (대괄호 + AI 컴포넌트 문법)
                  updatedMessage = updatedMessage.replace(/\n\n\[.*?\]/g, "");
                  updatedMessage = updatedMessage.replace(
                    /\n\n:::ai-component[^:]*:::/g,
                    ""
                  );

                  // 새 도구 상태 추가
                  updateMessageById(currentAiId, {
                    message_content: updatedMessage + toolStatusMessage,
                  });
                }
                continue;
              }
            } catch (e) {
              console.error("도구 이벤트 JSON 파싱 오류", dataStr, e);
            }
          }

          // 최종 성공 응답 처리
          if (dataStr.startsWith('{"status":"success"')) {
            try {
              const parsed = JSON.parse(dataStr);
              console.log("최종 완성 메시지 수신:", parsed.data);

              // ID 업데이트
              if (parsed.data?.user_message_id && tempUserMessageId) {
                userMessageId = parsed.data.user_message_id;
                updateMessageById(tempUserMessageId, {
                  message_id: userMessageId,
                });
              }

              if (parsed.data?.ai_message_id) {
                const finalAiMessageId = parsed.data.ai_message_id;
                const currentAiId = aiMessageId || tempAiMessageId;

                if (currentAiId && aiMessageCreated) {
                  // 최종 메시지에서 도구 상태 정리 (로딩 상태 제거, 결과만 남김)
                  let finalMessage = aiMessage;
                  finalMessage = finalMessage.replace(
                    /\n\n:::ai-component\s+type="tool-loading"[^:]*:::/g,
                    ""
                  );
                  finalMessage = finalMessage.replace(
                    /\n\n:::ai-component\s+type="batch-loading"[^:]*:::/g,
                    ""
                  );
                  finalMessage = finalMessage.replace(
                    /\n\n:::ai-component\s+type="tool-complete"[^:]*:::/g,
                    ""
                  );

                  const updates = {
                    isStreaming: false,
                    message_id: finalAiMessageId,
                    message_content: finalMessage,
                  };
                  if (parsed.data.created_at) {
                    updates.created_at = parsed.data.created_at;
                  }
                  updateMessageById(currentAiId, updates);
                }
              }

              setStreamingMessageId(null);
              streamingCompleted = true;
              break;
            } catch (e) {
              console.error("최종 응답 JSON 파싱 오류", dataStr, e);
            }
          } else {
            // 단순 문자열 메시지 처리 (따옴표 제거)
            const messageChunk = dataStr.replace(/^"/, "").replace(/"$/, "");

            if (messageChunk) {
              aiMessage += messageChunk;

              // AI 메시지가 아직 생성되지 않았다면 생성
              if (!aiMessageCreated) {
                const messageId = aiMessageId || `temp_ai_${Date.now()}`;
                if (!aiMessageId) {
                  tempAiMessageId = messageId;
                }

                const newAiMessage = createMessage(
                  messageId,
                  "ai",
                  aiMessage,
                  true
                );
                setMessages((prev) => [...prev, newAiMessage]);
                aiMessageCreated = true;
                setStreamingMessageId(messageId);
              } else {
                // 기존 AI 메시지 업데이트
                const currentAiId = aiMessageId || tempAiMessageId;
                if (currentAiId) {
                  updateMessageById(currentAiId, {
                    message_content: aiMessage,
                  });
                }
              }
            }
          }
        }

        // 스트리밍이 완료되었으면 while 루프 종료
        if (streamingCompleted) {
          break;
        }
      }

      const currentChat = chats.find((chat) => chat.session_id === session_id);
      const defaultTitles = ["새 세션", "New Session", "新しいセッション"];

      if (currentChat && defaultTitles.includes(currentChat.title.trim())) {
        console.log(
          "✅ 스트리밍 종료. 기본 제목 확인! 제목 생성을 시작합니다."
        );
        generateChatTitle();
      }

      // 스트리밍이 정상 완료되지 않은 경우 최종 정리
      if (!streamingCompleted && (aiMessageId || tempAiMessageId)) {
        const finalMessageId = aiMessageId || tempAiMessageId;
        updateMessageById(finalMessageId, { isStreaming: false });
        setStreamingMessageId(null);
      }
    } catch (e) {
      console.error("AI 메시지 처리 오류:", e);
      alert(e.message);
      setStreamingMessageId(null);
    }
  };

  // 메인 메시지 전송 핸들러
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (isSending || !inputMessage.trim()) return;
    setIsSending(true);

    const originalMessage = inputMessage;
    setInputMessage("");

    await handleAIMessage(originalMessage);

    setIsSending(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // 메시지 수정/삭제/스크롤 핸들러 등은 필요시 추가 구현
  const handleEdit = (id, content) => {
    setEditingMessageId(id);
    setEditedContent(content);
  };

  const handleSaveEdit = async (messageId) => {
    try {
      const user_id = getUserId ? getUserId() : localStorage.getItem("user_id");

      // 0. 편집 대상 메시지 찾기 (강화된 로직)
      const targetMessage = findMessageByIdOrContent(messageId, editedContent);
      if (!targetMessage) {
        console.error(`편집할 메시지를 찾을 수 없음: ID ${messageId}`);
        alert("편집할 메시지를 찾을 수 없습니다. 페이지를 새로고침해주세요.");
        return;
      }

      console.log(`편집 대상 메시지 발견:`, targetMessage);

      // 1. 메시지 수정 요청
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/chat/messages/${messageId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: editedContent,
            user_id,
            edit_reason: "사용자 직접 수정",
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result?.data?.success) {
        throw new Error(
          result?.data?.message || result?.error || "메시지 수정 실패"
        );
      }

      // 2. 기존 AI 응답 제거 (더 안전한 방식)
      setMessages((currentMessages) => {
        const editedIndex = currentMessages.findIndex(
          (m) =>
            m.message_id === messageId ||
            m.message_id === targetMessage.message_id
        );

        if (editedIndex === -1) {
          console.error("메시지 인덱스를 찾을 수 없음");
          return currentMessages;
        }

        const updatedMessages = [...currentMessages];

        // AI 응답이 다음에 있다면 제거
        if (
          editedIndex < updatedMessages.length - 1 &&
          updatedMessages[editedIndex + 1]?.message_type === "ai"
        ) {
          console.log("기존 AI 응답 제거:", updatedMessages[editedIndex + 1]);
          updatedMessages.splice(editedIndex + 1, 1);
        }

        // 3. 수정된 사용자 메시지 반영
        updatedMessages[editedIndex] = {
          ...updatedMessages[editedIndex],
          message_content: editedContent,
          message_id: messageId, // ID 확실히 고정
        };

        return updatedMessages;
      });

      // 4. AI 재응답 요청
      const aiRes = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/chat/sessions/${session_id}/messages/${messageId}/reresponse`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const aiJson = await aiRes.json();
      if (!aiRes.ok || aiJson.status !== "success") {
        throw new Error(aiJson?.data?.message || "AI 재응답 실패");
      }

      // AI 재응답 처리 (더 안전한 방식)
      setMessages((currentMessages) => {
        const editedIndex = currentMessages.findIndex(
          (m) =>
            m.message_id === messageId ||
            (m.message_content === editedContent && m.message_type === "user")
        );

        if (editedIndex === -1) {
          console.error("AI 응답 추가할 위치를 찾을 수 없음");
          return currentMessages;
        }

        const newAIMessage = createMessage(
          aiJson.data.ai_message_id,
          "ai",
          aiJson.data.ai_response
        );
        newAIMessage.created_at = aiJson.data.created_at;

        const updated = [...currentMessages];
        updated.splice(editedIndex + 1, 0, newAIMessage); // AI 응답 추가

        console.log("AI 재응답 추가 완료:", newAIMessage);
        return updated;
      });

      // 5. 상태 초기화
      setEditingMessageId(null);
      setEditedContent("");
    } catch (err) {
      alert("수정 실패: " + err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditedContent("");
  };

  // 텍스트 복사 함수 (클립보드에 메시지 내용 복사)
  const handleCopy = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // fallback: textarea 이용
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      alert("복사되었습니다!");
    } catch (e) {
      alert("복사 실패: " + (e?.message || "권한 문제 또는 환경 미지원"));
    }
  };

  // 삭제
  const handleDelete = async (userMsgId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    console.log(userMsgId);

    try {
      const user_id = getUserId ? getUserId() : localStorage.getItem("user_id");

      // 단일 메시지 삭제
      await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/chat/messages/${userMsgId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user_id,
          }),
        }
      );

      setMessages((prev) => prev.filter((m) => m.message_id !== userMsgId));
    } catch (err) {
      alert("삭제 실패: " + err.message);
    }
  };
  /*
  const handleGoBack = useCallback(
    (e) => {
      e.stopPropagation();
      navigate("/"); // 뒤로가기 시 메인 화면으로 이동
    },
    [navigate]
  );
*/
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

  // 유저가 스크롤하면 자동 스크롤 여부 판단
  useEffect(() => {
    const logElement = logRef.current;
    if (!logElement) return;

    const handleScroll = () => {
      const isNearBottom =
        logElement.scrollHeight - logElement.scrollTop <=
        logElement.clientHeight + 50;
      setAutoScroll(isNearBottom); // 하단에 가까우면 true, 아니면 false
    };

    logElement.addEventListener("scroll", handleScroll);
    return () => logElement.removeEventListener("scroll", handleScroll);
  }, []);

  // 새 메시지가 추가되면 자동 스크롤 (단, autoScroll이 true일 때만)
  useEffect(() => {
    if (autoScroll && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <div
        className={`chat-log${showSidebar ? " shrink" : ""}`}
        onScroll={() => {}}
        ref={logRef}
      >
        {loading && (
          <div className="message-loading">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </div>
        )}
        {error && (
          <div className="error">
            {error === "세션 ID가 제공되지 않았습니다."
              ? i18n.language === "en"
                ? "Session ID was not provided."
                : i18n.language === "ja"
                ? "セッションIDが提供されていません。"
                : error
              : error}
          </div>
        )}
        {!error && !loading && messages.length === 0 && session_id && (
          <div className="empty-message">{t("ChatLog.waiting_message")}</div>
        )}
        {messages.map((msg) => {
          if (editingMessageId === msg.message_id) {
            return (
              <React.Fragment key={msg.message_id}>
                <div
                  className={`message-bubble${
                    msg.message_type === "ai" ? " ai" : " user"
                  }`}
                >
                  <textarea
                    className="edit-textarea"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                  />
                  <div className="message-actions">
                    <img
                      className="message-save-button"
                      src={require("../images/save_icon.png")}
                      alt="저장"
                      style={{ width: 18, height: 18, cursor: "pointer" }}
                      tabIndex={0}
                      aria-label="저장"
                      onClick={() => handleSaveEdit(msg.message_id)}
                    />
                    <img
                      className="message-cancel-button"
                      src={require("../images/cancel_icon2.png")}
                      alt="취소"
                      style={{ width: 18, height: 18, cursor: "pointer" }}
                      tabIndex={0}
                      aria-label="취소"
                      onClick={handleCancelEdit}
                    />
                  </div>
                </div>
              </React.Fragment>
            );
          }
          return (
            <div
              className={`message-bubble${
                msg.message_type === "ai" ? " ai" : " user"
              }${msg.isStreaming ? " streaming" : ""}`}
              key={msg.message_id}
            >
              <div
                className={`message-content markdown-body${
                  msg.message_type === "ai"
                    ? " ai-message-content ai-markdown-body"
                    : ""
                }`}
                style={{ fontSize: `${fontSize}px` }}
              >
                {msg.message_type === "ai" && (
                  <div className="ai-indicator">
                    OrbitMate
                    {msg.isStreaming && (
                      <span className="streaming-indicator">...</span>
                    )}
                  </div>
                )}
                {msg.message_type === "ai" ? (
                  // AI 메시지: 커스텀 컴포넌트 파싱 후 렌더링
                  (() => {
                    const parsedParts = parseMessageContent(
                      msg.message_content || ""
                    );
                    return parsedParts.map((part, index) => {
                      if (part.type === "component") {
                        return renderAiComponent(
                          part.componentType,
                          part.props
                        );
                      } else {
                        return (
                          <ReactMarkdown
                            key={`text-${index}`}
                            remarkPlugins={[remarkGfm]}
                            components={{
                              ul: (props) => (
                                <ul {...props} className="ai-markdown-ul" />
                              ),
                              ol: (props) => (
                                <ol {...props} className="ai-markdown-ol" />
                              ),
                              li: (props) => (
                                <li {...props} className="ai-markdown-li" />
                              ),
                              p: (props) => (
                                <p {...props} className="ai-markdown-p" />
                              ),
                              strong: (props) => <strong {...props} />,
                              em: (props) => <em {...props} />,
                              mark: (props) => <mark {...props} />,
                              kbd: (props) => <kbd {...props} />,
                              sub: (props) => <sub {...props} />,
                              sup: (props) => <sup {...props} />,
                              table: (props) => (
                                <div className="table-container">
                                  <table
                                    {...props}
                                    className="ai-markdown-table"
                                  />
                                </div>
                              ),
                              thead: (props) => (
                                <thead
                                  {...props}
                                  className="ai-markdown-thead"
                                />
                              ),
                              tbody: (props) => (
                                <tbody
                                  {...props}
                                  className="ai-markdown-tbody"
                                />
                              ),
                              tr: (props) => (
                                <tr {...props} className="ai-markdown-tr" />
                              ),
                              th: (props) => (
                                <th {...props} className="ai-markdown-th" />
                              ),
                              td: (props) => (
                                <td {...props} className="ai-markdown-td" />
                              ),
                              code: ({
                                node,
                                inline,
                                className,
                                children,
                                ...props
                              }) => {
                                if (inline) {
                                  return (
                                    <code
                                      {...props}
                                      className={
                                        "ai-markdown-code" +
                                        (className ? ` ${className}` : "")
                                      }
                                    >
                                      {children}
                                    </code>
                                  );
                                }
                                let langClass = className;
                                if (
                                  !langClass ||
                                  !/^language-/.test(langClass)
                                ) {
                                  langClass = "language-plaintext";
                                }
                                return (
                                  <div style={{ position: "relative" }}>
                                    <pre>
                                      <code
                                        ref={(el) => {
                                          if (el) hljs.highlightElement(el);
                                        }}
                                        {...props}
                                        className={langClass}
                                      >
                                        {children}
                                      </code>
                                    </pre>
                                    <button
                                      className="code-copy-btn"
                                      type="button"
                                      title="코드 복사"
                                      onClick={() =>
                                        handleCopy(String(children))
                                      }
                                      tabIndex={0}
                                      aria-label="코드 복사"
                                    >
                                      <img
                                        src={require("../images/copy_icon.png")}
                                        alt="복사"
                                        style={{
                                          width: 16,
                                          height: 16,
                                          marginRight: 4,
                                        }}
                                      />
                                      {t("ChatLog.code_copy")}
                                    </button>
                                  </div>
                                );
                              },
                            }}
                          >
                            {fixBoldWithKorean(
                              part.content.replace(/\\n/g, "\n")
                            )}
                          </ReactMarkdown>
                        );
                      }
                    });
                  })()
                ) : (
                  // 사용자 메시지: 기존 방식
                  <ReactMarkdown
                    key={msg._renderKey || msg.message_id}
                    remarkPlugins={[remarkGfm]}
                    components={{
                      ul: (props) => <ul {...props} className="markdown-ul" />,
                      ol: (props) => <ol {...props} className="markdown-ol" />,
                      li: (props) => <li {...props} className="markdown-li" />,
                      p: (props) => <p {...props} className="markdown-p" />,
                      strong: (props) => <strong {...props} />,
                      em: (props) => <em {...props} />,
                      mark: (props) => <mark {...props} />,
                      kbd: (props) => <kbd {...props} />,
                      sub: (props) => <sub {...props} />,
                      sup: (props) => <sup {...props} />,
                      table: (props) => (
                        <div className="table-container">
                          <table {...props} className="markdown-table" />
                        </div>
                      ),
                      thead: (props) => (
                        <thead {...props} className="markdown-thead" />
                      ),
                      tbody: (props) => (
                        <tbody {...props} className="markdown-tbody" />
                      ),
                      tr: (props) => <tr {...props} className="markdown-tr" />,
                      th: (props) => <th {...props} className="markdown-th" />,
                      td: (props) => <td {...props} className="markdown-td" />,
                      code: (props) => (
                        <code {...props} className="markdown-code" />
                      ),
                      span: (props) => (
                        <span {...props} className="markdown-span" />
                      ),
                    }}
                  >
                    {(msg.message_content || "").replace(/\\n/g, "\n")}
                  </ReactMarkdown>
                )}
                <div
                  className={`message-meta${
                    msg.message_type === "user" ? " user-meta" : " ai-meta"
                  }`}
                >
                  {msg.message_type === "user" ? "나" : "AI"} ·
                  {new Date(msg.created_at).toLocaleString("ko-KR", {
                    hour12: false,
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </div>
              </div>
              {editingMessageId !== msg.message_id && (
                <div className="message-actions">
                  {msg.message_type === "user" && (
                    <img
                      title="수정"
                      className="message-edit-button"
                      src={require("../images/edit_icon.png")}
                      alt="수정"
                      style={{ width: 18, height: 18, cursor: "pointer" }}
                      tabIndex={0}
                      aria-label="수정"
                      onClick={() =>
                        handleEdit(msg.message_id, msg.message_content)
                      }
                    />
                  )}
                  <img
                    title="복사"
                    className="message-copy-button"
                    src={require("../images/copy_icon.png")}
                    alt="복사"
                    style={{ width: 18, height: 18, cursor: "pointer" }}
                    tabIndex={0}
                    aria-label="복사"
                    onClick={() => handleCopy(msg.message_content)}
                  />
                  <img
                    title="삭제"
                    className="message-delete-button"
                    src={require("../images/remove_icon.png")}
                    alt="삭제"
                    style={{ width: 18, height: 18, cursor: "pointer" }}
                    tabIndex={0}
                    aria-label="삭제"
                    onClick={() => handleDelete(msg.message_id)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <form className="chat-input-container">
        <InputBox
          id="chat-input"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onSubmit={handleSendMessage}
          placeholder={t("title_section.input_placeholder")}
          inputClassName="userInput_in_chatlog"
          buttonClassName="submit_inputValue"
          autoFocus={true}
          disabled={false}
          inputRef={inputRef}
        />
      </form>
      {/*<button className="chatlog_back_btn" onClick={handleGoBack} />*/}
    </>
  );
}

export default ChatLog;
