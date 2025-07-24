import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/Subscription/SubscriptionMain.css";
import { useTranslation } from "react-i18next";
import { useUser } from "../../contexts/UserContext";
import { Trans } from "react-i18next";

function SubscriptionMain() {
  const { t, i18n } = useTranslation();
  const { user } = useUser();
  const [subscription, setSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("personal");
  const [showcancel, setshowcancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const navigate = useNavigate();

  //메인페이지로
  const close = () => {
    navigate("/");
  };

  //개인/비즈니스 토글 함수
  const handleToggle = (type) => {
    setSelectedPlan(type);
  };

  //사용자 구독 정보 조회 DB접근
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/subscriptions/users/${user.login.user_id}/subscription`
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

  const subscription_endDate = subscription?.subscription_end;

  //언어변경에 쓰인 혜택들 배열로가져오는함수
  const free_features = t("subscriptionMain_free.free_features", {
    returnObjects: true,
  });
  const plus_features = t("subscriptionMain_plus.plus_features", {
    returnObjects: true,
  });
  const ultimate_features = t("subscriptionMain_ultimate.ultimate_features", {
    returnObjects: true,
  });
  const business_features = t("subscriptionMain_business.business_features", {
    returnObjects: true,
  });

  //구매페이지 이동
  const purchase = (tier) => {
    navigate("/upgrade_plan/purchase", {
      state: {
        plan_displayName: tier.plan_displayName,
        tierName: tier.tier_name,
        price: tier.price,
        currency: tier.currency,
      },
    });
  };

  const handlerCancel = (free) => {
    setshowcancel(true);
  };

  const close_cancel = () => {
    setshowcancel(false);
  };

  //구독취소 DB
  const handleConfirmCancel = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/subscriptions/users/${user.login.user_id}/subscription`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            immediate: false, // true로 하면 즉시 취소
            reason: cancelReason, // 상태값으로부터 reason 전달
          }),
        }
      );

      if (!response.ok) throw new Error("구독 취소 실패");

      const result = await response.json();
      console.log("구독 취소 완료:", result);

      // 성공 후 상태 업데이트 or 리디렉션
      setSubscription(result.data.subscription);
      setshowcancel(false); // 취소창 닫기
      navigate("/upgrade_plan/cancelplan", {
        state: { subscription_endDate: subscription_endDate },
      });
    } catch (error) {
      console.error("구독 취소 에러:", error);
    }
  };

  //시간 빼고 구독 종료날짜 깔끔하게
  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toISOString().split("T")[0];
  };

  return (
    <div id="subscriptionMain">
      {/*구독취소 프레임==================================================*/}
      {showcancel ? (
        <div id="cancel_f">
          <div className="headforCancel_f">
            <h1>OrbitMate</h1>
          </div>
          <div className="bodyforCancel_f">
            <p>{t("subscriptionMain.expiryNotice2")}</p>
            <div className="expiryNotice">
              <p>
                <Trans
                  i18nKey="subscriptionMain.expiryNotice"
                  values={{ date: formatDate(subscription?.subscription_end) }}
                  components={{ span: <span className="highlight" /> }}
                />
              </p>
            </div>
            <h1>{t("subscriptionMain.reasonCancel")}</h1>
            <input placeholder={t("subscriptionMain.placeholder_reason")} />
            <h1>{t("subscriptionMain.feedback")}</h1>
            <input placeholder={t("subscriptionMain.placeholder_feedback")} />
          </div>
          <div className="yesOrno_f">
            <button onClick={handleConfirmCancel}>
              {t("subscriptionMain.yes")}
            </button>
            <button
              style={{ backgroundColor: "#cf2929ff" }}
              onClick={close_cancel}
            >
              {t("subscriptionMain.no")}
            </button>
          </div>
        </div>
      ) : (
        ""
      )}
      {/*===============================================================*/}
      <div className="subHead">
        <h2 className="sub_title">{t("subscriptionMain.title")}</h2>
        <div className="toggle_f_wrapper">
          <div className="toggle_f">
            <div
              className="animation_f"
              style={{
                left: selectedPlan === "personal" ? "0%" : "39.5%",
              }}
            ></div>
            <div className="personal_toggle_f">
              <button
                onClick={() => handleToggle("personal")}
                className={selectedPlan === "personal" ? "active" : ""}
              >
                {t("subscriptionMain.personalToggle_btn")}
              </button>
            </div>
            <div className="business_toggle_f">
              <button
                onClick={() => handleToggle("business")}
                className={selectedPlan === "business" ? "active" : ""}
              >
                {t("subscriptionMain.businessToggle_btn")}
              </button>
            </div>
          </div>
        </div>
        <button className="closeFrame_btn" onClick={close}>
          X
        </button>
      </div>

      <div className="subBody">
        {selectedPlan === "personal" && (
          <>
            <div className="free_f">
              <h2>OrbitMate Comet</h2>
              <p className="price_f">
                $0
                <span className="per_month">
                  {t("subscriptionMain_free.per_month_free")}
                </span>
              </p>
              <p className="plan_desc">
                {t("subscriptionMain_free.plan_desc_free")}
              </p>
              <button
                className={`free_btn ${
                  subscription?.tier.tier_name === "free" ? "disabled_btn" : ""
                }`}
                disabled={subscription?.tier.tier_name === "free"}
                onClick={handlerCancel} //free버튼 누르면 free라는 문자열을 보낼거임
              >
                {subscription?.tier?.tier_name != "free"
                  ? t("subscriptionMain.freePlan")
                  : t("subscriptionMain_free.freePlan_btn")}
              </button>
              <div className="free_benefits">
                <ul>
                  {free_features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="pro_f">
              <h2>OrbitMate Planet</h2>
              <p className="price_f_Pro">
                $20
                <span className="per_month_Plus">
                  {t("subscriptionMain_plus.per_month_plus")}
                </span>
              </p>
              <p className="plan_desc_Plus">
                {t("subscriptionMain_plus.plan_desc_plus")}
              </p>
              <button
                className={`Plus_btn ${
                  subscription?.tier.tier_name === "planet"
                    ? "disabled_btn"
                    : ""
                }`}
                disabled={subscription?.tier.tier_name === "planet"}
                onClick={() => {
                  if (subscription?.tier?.tier_name !== "planet") {
                    purchase({
                      plan_displayName: "OrbitMate Planet",
                      tier_name: "planet",
                      price: 20,
                      currency: "USD",
                    });
                  }
                }}
              >
                {subscription?.tier?.tier_name === "planet" //OrbitMate Pro
                  ? t("subscriptionMain.currentPlan")
                  : t("subscriptionMain_plus.plusPlan_btn")}
              </button>
              <div className="plus_benefits">
                <ul>
                  {plus_features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="pro_f">
              <h2>OrbitMate Star</h2>
              <p className="price_f_Pro">
                $200
                <span className="per_month_Pro">
                  {t("subscriptionMain_ultimate.per_month_ultimate")}
                </span>
              </p>
              <p className="plan_desc_Pro">
                {t("subscriptionMain_ultimate.plan_desc_ultimate")}
              </p>
              <button
                className={`Pro_btn ${
                  subscription?.tier.tier_name === "star" ? "disabled_btn" : ""
                }`}
                disabled={subscription?.tier.tier_name === "star"}
                onClick={() => {
                  if (subscription?.tier.tier_name !== "star") {
                    purchase({
                      plan_displayName: "OrbitMate Star",
                      tier_name: "star",
                      price: 200,
                      currency: "USD",
                    });
                  }
                }}
              >
                {subscription?.tier?.tier_name === "star"
                  ? t("subscriptionMain.currentPlan")
                  : t("subscriptionMain_ultimate.ultimatePlan_btn")}
              </button>
              <div className="pro_benefits">
                <ul>
                  {ultimate_features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
        {selectedPlan === "business" && (
          <div className="business_f">
            <h2>OrbitMate Galaxy</h2>
            <p className="price_f_Enterprise">
              $350
              <span className="per_month_Enterprise">
                {t("subscriptionMain_business.per_month_business")}
              </span>
            </p>
            <p className="plan_desc_Enterprise">
              {t("subscriptionMain_business.plan_desc_business")}
            </p>
            <button
              className={`Enterprise_btn ${
                subscription?.tier.tier_name === "galaxy" ? "disabled_btn" : ""
              }`}
              disabled={subscription?.tier.tier_name === "galaxy"}
              onClick={() => {
                if (subscription?.tier.tier_name !== "galaxy") {
                  purchase({
                    plan_displayName: "OrbitMate Galaxy",
                    tier_name: "galaxy",
                    price: 350,
                    currency: "USD",
                  });
                }
              }}
            >
              {subscription?.tier?.tier_name === "galaxy"
                ? "현재 나의 플랜"
                : t("subscriptionMain_business.businessPlan_btn")}
            </button>
            <div className="Enterprise_benefits">
              <ul>
                {business_features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="subFoot">
        <p>{t("subscriptionMain.moreFeatures")}</p>
        <p>
          OrbitMate Enterprise{" "}
          <a className="returnHomepage" href="/">
            {t("subscriptionMain.here")}
          </a>
        </p>
      </div>
    </div>
  );
}
export default SubscriptionMain;
