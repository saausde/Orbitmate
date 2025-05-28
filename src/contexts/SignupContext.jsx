// src/context/SignupContext.jsx
import { createContext, useContext, useState } from "react";

const SignupContext = createContext();

export function SignupProvider({ children }) {
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  return (
    <SignupContext.Provider value={{ data, setData }}>
      {children}
    </SignupContext.Provider>
  );
}

export function useSignup() {
  return useContext(SignupContext);
}
