// src/components/LoginButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function LoginButton() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate("/signin")}
      className="login-button"
    >
      로그인
    </button>
  );
}
