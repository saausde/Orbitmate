회원가입 / 로그인

설명



사용자가 이메일과 비밀번호로 계정을 생성하고, 닉네임을 설정한 뒤 로그인할 수 있는 기능입니다.

로그인 이후에는 사용자 정보를 불러오고, 세션 목록을 캐싱하여 원활한 이용이 가능하도록 구현했습니다.



구현 상세

1\. 회원가입 (2단계 구조)



1단계 (이메일/비밀번호 입력)



이메일 정규식 검사, 비밀번호 길이(최소 8자) 조건 검증



붙여넣기/스페이스 입력 차단으로 불필요한 공백 방지



서버에 이메일 중복 여부 확인 → 중복 시 알림, 통과 시 닉네임 단계 이동



2단계 (닉네임 입력)



닉네임 공백/미입력 방지



최종적으로 username, email, password를 묶어 서버에 전달하여 가입 완료



2\. 로그인



이메일/비밀번호 입력값 검증



서버에 로그인 요청 → 토큰/유저ID 획득



추가 요청으로 프로필/설정 정보 로딩



채팅 세션 목록 조회 → localStorage와 전역 상태(ChatContext)에 저장



최종적으로 토큰과 유저ID를 로컬 저장소에 보관 후 메인 페이지로 라우팅



핵심 코드

1\) 입력값 정제 및 검증



const preventSpace = (e) => { if (e.key === " ") e.preventDefault(); };



const handlePaste = (e) => {

  e.preventDefault();

  const pasted = e.clipboardData.getData("text").replace(/\\s+/g, "");

  document.execCommand("insertText", false, pasted);

};



const emailPattern = /^\[^\\s@]+@\[^\\s@]+.\[^\\s@]+$/;



2\) 회원가입 1단계 제출 → 중복 검사 → 단계 전이



setData(prev => ({ ...prev, email: em, password: pwd }));



const res = await fetch(${process.env.REACT\_APP\_API\_BASE\_URL}/api/users/check-email, {

  method: "POST",

  headers: { "Content-Type": "application/json" },

  body: JSON.stringify({ email: em }),

});

const json = await res.json();



if (json.data.email\_exists) {

  alert("이미 가입된 이메일입니다.");

  return;

}

navigate("/signup/un"); // 닉네임 입력 단계로 이동



3\) 로그인 후 초기화 (프로필/설정/세션)



setUser({

  login: json.data,

  profile: profileJson.data,

  settings: settingsJson.data,

  storedValue: true,

});



const sessionRes = await fetch(

  ${process.env.REACT\_APP\_API\_BASE\_URL}/api/sessions/${json.data.user\_id}/chat/sessions,

  {

    method: "GET",

    headers: {

      "Content-Type": "application/json",

      Authorization: Bearer ${json.data.token},

    },

  }

);



if (sessionRes.ok) {

  const sessionJson = await sessionRes.json();

  setChats(sessionJson.data);

  localStorage.setItem("chats", JSON.stringify(sessionJson.data));

}



localStorage.setItem("token", json.data.token);

localStorage.setItem("user\_id", json.data.user\_id);



navigate("/");

