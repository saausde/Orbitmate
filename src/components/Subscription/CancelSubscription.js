import react, { useState, useEffect } from "react";
import "../../css/Subscription/PaymentForSubscriptions/CancelSubscription.css";
import barcode from "../../images/barcode1.png";
import orbitmateIcon1 from "../../images/orbitmateIcon1.png";
import { useUser } from "../../contexts/UserContext";
import { useNavigate, useLocation } from "react-router-dom";

function CancelSubscription() {
  const { user } = useUser();
  const [subscription, setSubscription] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const subscription_endDate = location.state?.subscription_endDate;

  // 구독 정보 요청
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/subscriptions/users/${user.login.user_id}/subscription`
        );
        const data = await response.json();
        console.log("구독 정보 응답:", data);
        setSubscription(data.data);
      } catch (error) {
        console.error("구독 정보 불러오기 실패:", error);
      }
    };

    fetchSubscription();
  }, []);

  // 사용자 프로필 요청
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/users/${user.login.user_id}/profile`
        );
        const data = await response.json();
        console.log("사용자 정보:", data);
        setUserProfile(data.data);
      } catch (error) {
        console.error("사용자 정보 불러오기 실패:", error);
      }
    };

    fetchUserProfile();
  }, []);

  //시간 빼고 구독 종료날짜 깔끔하게
  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toISOString().split("T")[0];
  };

  const goToMain = () => {
    navigate("/");
  };

  return (
    <div id="CancelSubscription_Main_f">
      <div id="receipt_f">
        <div id="inner">OrbitMate</div>
        <div id="apple-logo">
          <img src={orbitmateIcon1} />
        </div>
        <div className="body_receipt">
          <div id="details">
            <span className="label">닉네임:</span>
            <span className="value">{userProfile?.username}</span>
          </div>
          <div id="details">
            <span className="label">뱃지:</span>
            <span className="value">{userProfile?.badge}</span>
          </div>
          <div id="details">
            <span className="label">사용자 이메일:</span>
            <span className="value">{userProfile?.email}</span>
          </div>
          <div id="details">
            <span className="label">구독 시작일:</span>
            <span className="value">
              {formatDate(subscription?.subscription_start)}
            </span>
          </div>
          <div id="details">
            <span className="label">구독 마지막 일:</span>
            <span className="value">{formatDate(subscription_endDate)}</span>
          </div>
          <div id="details">
            <span className="label">변경 구독제:</span>
            <span className="value">{subscription?.tier?.tier_name}</span>
          </div>
        </div>
        <div id="barcode">
          <img src={barcode} />
        </div>

        <div id="buttons">
          <button onClick={goToMain} className="replay-btn">
            메인으로
          </button>
        </div>
      </div>
    </div>
  );
}

export default CancelSubscription;
