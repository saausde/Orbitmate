import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useSignTheme } from "../contexts/SignTheme";

export default function Login() {
  const { signTheme } = useSignTheme();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const pwdRef = useRef(null);
  const { setUser } = useUser();

  const [email, setEmail] = useState("");
  const [errorMsg1, setErrorMsg1] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg2, setErrorMsg2] = useState("");

  console.log(signTheme)

  // 1) 스페이스바 키 입력 차단
  const preventSpace = (e) => {
    if (e.key === " ") e.preventDefault();
  };

  // 2) 붙여넣기 시 공백 제거
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\s+/g, "");
    document.execCommand("insertText", false, pasted);
  };

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
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: em, password: pwd }),
        }
      );
      const json = await res.json();

      if (!res.ok) {
        alert(json.error || "이메일 또는 비밀번호가 올바르지 않습니다.");
        return;
      }

      setUser({
        ...json,
        storedValue: true,
      });

      const test = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/${json.user_id}/profile`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const json2 = await test.json();

      setUser({
        ...json2,
        storedValue: true,
      });

      console.log("성공", json2)

      localStorage.setItem("token", json.token);
      localStorage.setItem("user_id", json.user_id); // user_id 저장
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
            <label  htmlFor="email">이메일 주소</label>
            <div className="error-message">{errorMsg1}</div>
          </div>

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

          <button type="submit" className="btn-primary">
            계속
          </button>
        </form>

        <p className="signup-prompt">
          계정이 없으신가요?
          <Link to="/signup" className="link">
            회원 가입
          </Link>
        </p>
      </div>
    </div>
  );
}
