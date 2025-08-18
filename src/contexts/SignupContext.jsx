// SignupContext: 회원가입 단계별 입력 데이터(이메일, 비밀번호 등) 전역 관리 컨텍스트
import { createContext, useContext, useState } from "react";

// 1) SignupContext 생성
const SignupContext = createContext();

// 2) Provider: 회원가입 입력 데이터 상태 관리 및 하위에 제공
export function SignupProvider({ children }) {
  // [상태] 회원가입 입력 데이터(이메일, 비밀번호 등)
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  // Provider로 하위 컴포넌트에 data/setData 제공
  return (
    <SignupContext.Provider value={{ data, setData }}>
      {children}
    </SignupContext.Provider>
  );
}

// 3) 편의 훅: SignupContext 값 쉽게 사용
export function useSignup() {
  return useContext(SignupContext);
}
