import { useNavigate } from "react-router-dom"; // React Router 사용 가정
import "../../css/Profile.css";
import "../../css/dark.css";
import GeneralSetting from "../Settings/GeneralSetting";

// 로그인 페이지로 이동하는 버튼 컴포넌트
export default function LoginButton() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate("/signin")}
      className="login-button"
      style={{
        position: "fixed", // 화면 기준 고정 위치
        top: "16px",
        right: "16px",
        zIndex: 99999, // 최상단 레이어
        pointerEvents: "auto", // 클릭 허용
      }}
    >
      로그인
    </button>
  );
}
