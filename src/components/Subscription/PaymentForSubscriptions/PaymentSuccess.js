import React, { useState, useEffect } from "react";
import "../../../css/Subscription/PaymentForSubscriptions/PaymentSuccess.css";
import complete_icon from "../../../images/complete_icon1.png";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useUser } from "../../../contexts/UserContext";
import { useTranslation } from "react-i18next";
function PaymentSuccess() {
  const [subscription, setSubscription] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { t, i18n } = useTranslation();

  const { plan_displayName, tierName, price, selectedCard } =
    location.state || {};

  //구독 업그레이드
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/subscriptions/users/${user.login.user_id}/subscription`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tier_name: tierName,
            }),
          }
        );
        const data = await response.json();
        console.log("구독 정보 응답:", data);
        setSubscription(data.data); // tier_name 등 포함된 객체
      } catch (error) {
        console.error("구독 정보 불러오기 실패:", error);
      }
    };

    fetchSubscription();
  }, []);

  const goToMain = () => {
    navigate("/");
  };

  return (
    <div id="PaymentSuccess_f">
      <div className="main_f">
        <div className="upper">
          <div className="progression_f2">
            <div className="progression_in_begin2"></div>
            <div className="progression_in_payment2"></div>
            <hr className="progressionHr3" />
            <hr className="progressionHr4" />
            <div className="progression_in_completion2"></div>
            <div className="progression_titles2">
              <a className="progression_title_a">
                {t("subscriptionProcess.select_plan")}
              </a>
              <a className="progression_title_b">
                {t("subscriptionProcess.enter_payment")}
              </a>
              <a className="progression_title_c">
                {t("subscriptionProcess.payment_complete")}
              </a>
            </div>
          </div>
          <img className="complete_icon" src={complete_icon} alt="완료" />
          <p>{t("paymentComplete.completed")}</p>
        </div>
        <div className="lower">
          <div className="inforContent">
            <div className="payment_row">
              <span className="label">
                {t("paymentComplete.subscription_info")}
              </span>
              <span className="value">{plan_displayName}</span>
            </div>
            <div className="payment_row">
              <span className="label">
                {t("paymentComplete.payment_amount")}
              </span>
              <span className="value">${price}</span>
            </div>
            <div className="payment_row2">
              <span className="label">
                {t("paymentComplete.payment_method")}
              </span>
              <span className="value">
                {selectedCard?.name}
                {/*{t("paymentComplete.credit_card")}*/}
              </span>
            </div>
          </div>
          <div className="cancel_info_f">
            <p className="cancel_info">
              {t("paymentComplete.cancel_info_body")}
            </p>
          </div>
          <button className="goToMain_btn" onClick={goToMain}>
            {t("paymentComplete.go_to_main")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
