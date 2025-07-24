import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignup } from "../contexts/SignupContext";
import { useSignTheme } from "../contexts/SignTheme";

// 회원가입 1단계: 이메일/비밀번호 입력 컴포넌트
export default function Signup() {
  const { signTheme } = useSignTheme(); // 테마(라이트/다크)
  const navigate = useNavigate(); // 페이지 이동
  const { setData } = useSignup(); // 회원가입 데이터 저장
  const inputRef = useRef(null); // 이메일 입력 ref
  const pwdRef = useRef(null); // 비밀번호 입력 ref

  // 입력값 및 상태
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showReq, setShowReq] = useState(false); // 비밀번호 조건 표시
  const [valids, setValids] = useState([false]); // 비밀번호 조건
  const [errorMsg1, setErrorMsg1] = useState("");
  const [errorMsg2, setErrorMsg2] = useState("");

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

  // 3) 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg1("");
    setErrorMsg2("");

    const pwd = password.trim();
    setValids([pwd.length >= 8]);
    setShowReq(pwd.length > 0);

    const em = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 이메일/비밀번호 유효성 검사
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
      return;
    }
    if (!valids.every((ok) => ok)) {
      setErrorMsg2("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    try {
      // 1단계 데이터 저장
      setData((prev) => ({ ...prev, email: em, password: pwd }));
      // 이메일 중복 체크
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/check-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: em }),
        }
      );
      const json = await res.json();
      if (json.data.email_exists) {
        alert("이미 가입된 이메일입니다.");
        return;
      }
      navigate("/signup/un"); // 닉네임 입력 단계로 이동
    } catch (err) {
      if (err) setErrorMsg1(err.message);
    }
  };

  return (
    <div className={signTheme === "light" ? "signpage" : "signdarkpage"}>
      <div className="container">
        <h1>계정 만들기</h1>
        <form noValidate onSubmit={handleSubmit}>
          {/* 이메일 입력 */}
          <div className={`input-group${errorMsg1 ? " error" : ""}`}>
            <input
              ref={inputRef}
              type="email"
              placeholder=""
              value={email}
              onKeyDown={preventSpace}
              onPaste={handlePaste}
              onChange={(e) => {
                const v = e.target.value.replace(/\s+/g, "");
                setEmail(v);
                setErrorMsg1("");
              }}
            />
            <label htmlFor="email">이메일 주소</label>
            <div className="error-message">{errorMsg1}</div>
          </div>

          {/* 비밀번호 입력 */}
          <div className={`input-group${errorMsg2 ? " error" : ""}`}>
            <input
              ref={pwdRef}
              type="password"
              placeholder=""
              id="password"
              value={password}
              required
              onFocus={() => setShowReq(true)}
              onBlur={() => password === "" && setShowReq(false)}
              onKeyDown={preventSpace}
              onPaste={handlePaste}
              onChange={(e) => {
                const v = e.target.value.replace(/\s+/g, "");
                setPassword(v);
                setValids([v.length >= 8]);
              }}
            />
            <label htmlFor="password">비밀번호</label>
            <div className="error-message">{errorMsg2}</div>
            {/* 비밀번호 조건 안내 */}
            <div className={`password-requirements${showReq ? "" : " hidden"}`}>
              <ul>
                <li className={valids[0] ? "valid" : "invalid"}>
                  최소 8자 이상
                </li>
                {/* 비밀번호 조건 추가 시 이곳에 */}
              </ul>
            </div>
          </div>

          {/* 회원가입 진행 버튼 */}
          <button type="submit" className="btn-primary signup-btn">
            계속
          </button>
        </form>
        {/* 로그인 안내 */}
        <p className="signup-prompt">
          이미 계정이 있으신가요?{" "}
          <Link to="/signin" className="link">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
