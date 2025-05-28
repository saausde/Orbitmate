import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import page404 from "../images/Page404.png";

export default function Page404() {
  const navigate = useNavigate();

  const handleGoBack = useCallback((e) => {
    e.stopPropagation();
    navigate(-1);
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #b3e0ff 0%, #e0f7fa 100%)",
      }}
    >
      <h1 style={{ color: "#2196f3", fontWeight: "bold", fontSize: "2.5rem", marginBottom: "0.5em" }}>
        404 Not Found
      </h1>
      <p
        style={{
          color: "#1976d2",
          fontSize: "1.2rem",
          textAlign: "center",
          marginBottom: "1.5em",
          background: "rgba(255,255,255,0.7)",
          borderRadius: "12px",
          padding: "1em 2em",
          boxShadow: "0 2px 8px rgba(33,150,243,0.08)",
        }}
      >
        페이지를 찾을 수 없습니다.
        <br />
        요청하신 페이지는 제가 먹었어요.
      </p>
      <p
        style={{
          color: "#1976d2",
          fontSize: "0.8rem",
          textAlign: "center",
          marginBottom: "1.5em",

        }} 
      > 
      참고로 저는 책 먹는 여우가 아니에요
      <br />
      어린 왕자에 나오는 여우에요
      </p>
      <img
        src={page404}
        alt="404 Not Found Fox ate your page"
        style={{
          width: "100%",
          maxWidth: "300px",
          margin: "0 auto 2em auto",
          backgroundColor:"rgb(144, 209, 255)",
          borderRadius: "60px",
          boxShadow: "0 4px 16px rgba(33,150,243,0.15)",
        }}
      />
      <button
        onClick={handleGoBack}
        onMouseDown={(e) => e.preventDefault()}
        style={{
          background: "#4fc3f7",
          color: "#fff",
          border: "none", 
          borderRadius: "20px",
          padding: "0.7em 2em",
          fontSize: "1rem",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(33,150,243,0.15)",
          transition: "background 0.2s",
        }}
        onMouseOver={e => (e.currentTarget.style.background = "#0288d1")}
        onMouseOut={e => (e.currentTarget.style.background = "#4fc3f7")}
      >
        🦊 뒤로가기
      </button>
    </div>
  );
}