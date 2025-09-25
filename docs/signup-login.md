회원가입 / 로그인 – 프론트 핵심 코드

입력값 정제(공백 차단) + 즉시 검증
설명: 타이핑·붙여넣기 단계에서 불필요한 공백을 제거하고, 이메일/비밀번호 형식을 즉시 점검해 UX와 데이터 무결성을 높임.
핵심 코드:
const preventSpace = (e) => { if (e.key === " ") e.preventDefault(); };
const handlePaste = (e) => { e.preventDefault(); const pasted = e.clipboardData.getData("text").replace(/\s+/g, ""); document.execCommand("insertText", false, pasted); };
const emailPattern = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
if (!emailPattern.test(em)) { setErrorMsg1("유효한 이메일 주소를 입력해주세요."); inputRef.current?.focus(); return; }
if (password.trim().length < 8) { setErrorMsg2("비밀번호는 최소 8자 이상이어야 합니다."); return; }

회원가입 1단계 → 서버 중복 체크 → 단계 전환
설명: 로컬 상태에 1단계 정보를 저장한 뒤, 서버에 이메일 중복 여부를 확인하고 닉네임 단계로 전환.
핵심 코드:
setData(prev => ({ ...prev, email: em, password: pwd }));
const res = await fetch(${process.env.REACT_APP_API_BASE_URL}/api/users/check-email, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: em }) });
const json = await res.json();
if (json.data.email_exists) { alert("이미 가입된 이메일입니다."); return; }
navigate("/signup/un");

회원가입 2단계(닉네임) → 최종 등록
설명: 닉네임 필수 입력 검증 후 서버로 username, email, password를 전송하여 가입 완료.
핵심 코드:
if (!nickname.trim()) { setError("닉네임을 입력해주세요."); inputRef.current?.focus(); return; }
const res = await fetch(${process.env.REACT_APP_API_BASE_URL}/api/users/register, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: nickname, email: data.email, password: data.password }) });
if (!res.ok) throw new Error(json?.error?.message || "오류가 발생했습니다.");
alert("회원가입 성공! 다시 로그인 해주세요.");
navigate("/signin");

로그인 제출 → 사용자/설정 로딩 → 세션 캐싱 → 라우팅
설명: 로그인 성공 후 추가 API로 프로필·설정 정보를 불러오고, 채팅 세션을 전역 상태와 localStorage에 캐싱해 새로고침에도 상태를 유지.
핵심 코드:
const loginRes = await fetch(${process.env.REACT_APP_API_BASE_URL}/api/users/login, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: em, password: pwd }) });
const loginJson = await loginRes.json();
const profileJson = await (await fetch(${process.env.REACT_APP_API_BASE_URL}/api/users/${loginJson.data.user_id}/profile)).json();
const settingsJson = await (await fetch(${process.env.REACT_APP_API_BASE_URL}/api/users/${loginJson.data.user_id}/settings)).json();
setUser({ login: loginJson.data, profile: profileJson.data, settings: settingsJson.data, storedValue: true });
const sessionRes = await fetch(${process.env.REACT_APP_API_BASE_URL}/api/sessions/${loginJson.data.user_id}/chat/sessions, { method: "GET", headers: { "Content-Type": "application/json", Authorization: Bearer ${loginJson.data.token} } });
if (sessionRes.ok) { const sessionJson = await sessionRes.json(); setChats(sessionJson.data); localStorage.setItem("chats", JSON.stringify(sessionJson.data)); }
localStorage.setItem("token", loginJson.data.token);
localStorage.setItem("user_id", loginJson.data.user_id);
navigate("/");

폼 UX 가드(포커스/에러 메세지/중복 제출 방지)
설명: 잘못된 입력 시 해당 입력으로 포커스를 이동하고, 에러 메세지를 인라인으로 표시. onSubmit에서 기본동작(e.preventDefault)으로 중복 제출을 방지.
핵심 코드:
if (!em) { setErrorMsg1("이메일 주소를 입력해주세요."); inputRef.current?.focus(); return; }
if (!pwd) { setErrorMsg2("비밀번호를 입력해주세요."); pwdRef.current?.focus(); return; }

<form noValidate onSubmit={handleSubmit}> … </form>
