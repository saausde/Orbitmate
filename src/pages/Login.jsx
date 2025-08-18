import React, { useEffect, useState, useRef, useContext } from "react";
import { ChatContext } from "../contexts/ChatContext";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useSignTheme } from "../contexts/SignTheme";
import { useTheme } from "../contexts/ThemeContext";
import "../css/Sign.css";
// Login: 로그인 폼 컴포넌트
export default function Login() {
  const { setChats } = useContext(ChatContext);
  const { signTheme } = useSignTheme(); // 테마(라이트/다크)
  const navigate = useNavigate(); // 페이지 이동
  const inputRef = useRef(null); // 이메일 입력 ref
  const pwdRef = useRef(null); // 비밀번호 입력 ref
  const { user, setUser } = useUser(); // 유저 상태 변경
  const { setTheme, setFontSize, setPrimaryColor } = useTheme();

  // 입력값 및 에러 메시지 상태
  const [email, setEmail] = useState("");
  const [errorMsg1, setErrorMsg1] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg2, setErrorMsg2] = useState("");

  useEffect(() => {
    if (user) {
      console.log("🧠 업데이트된 유저 상태:", user);
    }
  }, [user]);

  // 1) 스페이스바 입력 차단
  const preventSpace = (e) => {
    if (e.key === " ") e.preventDefault();
  };

  // 2) 붙여넣기 시 공백 제거
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\s+/g, "");
    document.execCommand("insertText", false, pasted);
  };

  // 3) 로그인 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg1("");
    setErrorMsg2("");

    const em = email.trim();
    const pwd = password.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // 이메일 유효성 검사
    if (!em) {
      setErrorMsg1("이메일 주소를 입력해주세요.");
      inputRef.current?.focus();
      return;
    }
    if (!emailPattern.test(em)) {
      setErrorMsg1("유효한 이메일 주소를 입력해주세요.");
      inputRef.current?.focus();
      return;
    }
    if (!pwd) {
      setErrorMsg2("비밀번호를 입력해주세요.");
      pwdRef.current?.focus();
      return;
    }

    try {
      // 로그인 요청
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: em, password: pwd }),
        }
      );
      const json = await res.json();
      const isActive = json?.data?.is_active;

      // 후에 다시 정리
      if (isActive === 0) {
        alert("정지된 아이디입니다.");
        return;
      }

      if (isActive === 2) {
        // 관리자 페이지로 이동
        navigate("/admin"); // 실제 관리자 경로로 바꿔주세요
        return;
      }

      if (!res.ok) {
        alert(
          json?.error?.message || "이메일 또는 비밀번호가 올바르지 않습니다."
        );
        return;
      }

      // 프로필 정보 요청
      const profile = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/${json.data.user_id}/profile`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const json2 = await profile.json();

      // 사용자 설정 정보 요청
      const settings = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/${json.data.user_id}/settings`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const json3 = await settings.json();

      setUser({
        login: json.data, // 로그인 응답 (user_id, token 등)
        profile: json2.data, // 프로필 정보
        settings: json3.data, // 설정 정보
        storedValue: true, // 로그인 확인
      });

      // 설정 정보 적용
      if (json3.data) {
        if (json3.data.theme) setTheme(json3.data.theme);
        if (json3.data.font_size) setFontSize(json3.data.font_size);
        if (json3.data.primary_color) setPrimaryColor(json3.data.primary_color);
      }

      // 세션 목록 조회 → chats에 저장
      try {
        const sessionRes = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/sessions/${json.data.user_id}/chat/sessions`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${json.data.token}`,
            },
          }
        );

        if (!sessionRes.ok) {
          console.error("세션 목록 조회 실패");
        } else {
          const sessionJson = await sessionRes.json();

          // 객체 1개를 배열로 감싸서 저장
          setChats(sessionJson.data);
          localStorage.setItem("chats", JSON.stringify(sessionJson.data));
        }
      } catch (err) {
        console.error("세션 조회 오류:", err);
      }

      // 토큰/유저ID 저장 및 메인 이동
      localStorage.setItem("token", json.data.token);
      localStorage.setItem("user_id", json.data.user_id);
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(err.message || "서버에 연결할 수 없습니다.");
    }
  };

  return (
    <div className={signTheme === "light" ? "signpage" : "signdarkpage"}>
      <div className="container">
        <h1>오신 걸 환영합니다</h1>
        <form noValidate onSubmit={handleSubmit}>
          {/* 이메일 입력 */}
          <div className={`input-group${errorMsg1 ? " error" : ""}`}>
            <input
              ref={inputRef}
              type="email"
              placeholder=" "
              value={email}
              onKeyDown={preventSpace}
              onPaste={handlePaste}
              onChange={(e) => {
                const v = e.target.value.replace(/\s+/g, "");
                setEmail(v);
                errorMsg1 && setErrorMsg1("");
              }}
            />
            <label htmlFor="email">이메일 주소</label>
            <div className="error-message">{errorMsg1}</div>
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <div className={`input-group${errorMsg2 ? " error" : ""}`}>
              <input
                ref={pwdRef}
                type="password"
                placeholder=" "
                value={password}
                onKeyDown={preventSpace}
                onPaste={handlePaste}
                onChange={(e) => {
                  const v = e.target.value.replace(/\s+/g, "");
                  setPassword(v);
                  errorMsg2 && setErrorMsg2("");
                }}
                required
              />
              <label>비밀번호</label>
              <div className="error-message">{errorMsg2}</div>
            </div>
          </div>

          {/* 로그인 버튼 */}
          <button type="submit" className="btn-primary">
            계속
          </button>
        </form>

        {/* 회원가입 안내 */}
        <p className="signup-prompt">
          계정이 없으신가요?{" "}
          <Link to="/signup" className="link">
            회원 가입
          </Link>
        </p>
      </div>
    </div>
  );
}
