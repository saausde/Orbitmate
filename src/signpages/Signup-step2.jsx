import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../contexts/SignupContext";
import { useSignTheme } from "../contexts/SignTheme";

export default function SignupNickname() {
  const { signTheme } = useSignTheme();
  const navigate = useNavigate();
  const { data } = useSignup();
  const inputRef = useRef(null);

  const [nickname, setNickname] = useState(data.nickname || "");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const ni = nickname.trim();
    if (!ni) {
      setError("닉네임을 입력해주세요.");
      inputRef.current?.focus();
      return;
    }

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: ni, // API 문서의 username 필드
            email: data.email, // 1단계에서 저장해 둔 값
            password: data.password, // 2단계에서 저장해 둔 값
          }),
        }
      );
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "오류가 발생했습니다.");
      }

      alert("회원가입 성공! 다시 로그인 해주세요.");
      navigate("/signin");
    } catch (err) {
      setError(err.message || "서버 오류가 발생했습니다.");
    }
  };

  return (
    <div className={signTheme === "light" ? "signpage" : "signdarkpage"}>
      <div className="container">
        <h1>닉네임을 정해주세요</h1>
        <form noValidate onSubmit={handleSubmit}>
          <div className={`input-group${error ? " error" : ""}`}>
            <input
              ref={inputRef}
              type="text"
              placeholder=" "
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                if (error) setError("");
              }}
            />
            <label>닉네임</label>
            {error && <div className="error-message">{error}</div>}
          </div>

          {/*회원 가입 시 추가하고 싶은 데이터는 이곳에서*/}

          <button type="submit" className="btn-primary">
            완료
          </button>
        </form>
      </div>
    </div>
  );
}
