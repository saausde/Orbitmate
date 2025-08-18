import React from "react";
import i18next from "i18next";
import { createPortal } from "react-dom"; // 추가
import "../../../css/Subscription/PaymentForSubscriptions/plus.css";
import visa from "../../../images/visa-card.png";
import kakao from "../../../images/kakao-card.png";
import union from "../../../images/union-card.png";
import paypal from "../../../images/paypal-card.png";
import apple from "../../../images/apple-card.png";
import master from "../../../images/master-card.png";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Plus() {
  const months = Array.from({ length: 12 }, (_, i) => i + 1); //1부터 12까지 만들어줌
  const currentYear = new Date().getFullYear(); // 올해 연도 가져옴
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardsExpanded, setCardsExpanded] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showSuccessEffect, setShowSuccessEffect] = useState(false);
  const [showParticles, setShowParticles] = useState(false); // 추가
  const particlesRef = useRef(null);
  const { t, i18n } = useTranslation();
  const [cardInfo, setCardInfo] = useState({
    holderName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });
  const navigate = useNavigate();
  const location = useLocation();
  console.log("넘어온 location.state:", location.state);
  const { plan_displayName, tierName, price, currency } = location.state || {};

  const cardTypes = [
    { id: "visa", name: "Visa", img: visa },
    { id: "master", name: "Master", img: master },
    { id: "apple", name: "Apple Pay", img: apple },
    { id: "paypal", name: "PayPal", img: paypal },
    { id: "kakao", name: "Kakao Pay", img: kakao },
    { id: "union", name: "Union Pay", img: union },
  ];

  const getCardPlaceholder = (cardId) => {
    const placeholders = {
      visa: "VISA",
      master: "MasterCard",
      apple: "Apple Pay",
      paypal: "PayPal",
      kakao: "카카오페이",
      union: "UnionPay",
    };
    return placeholders[cardId] || "CARD";
  };

  const getCardNumberPlaceholder = (cardId) => {
    const patterns = {
      visa: "4*** **** **** ****",
      master: "5*** **** **** ****",
      apple: "•••• •••• •••• ••••",
      paypal: "•••• •••• •••• ••••",
      kakao: "•••• •••• •••• ••••",
      union: "62** **** **** ****",
    };
    return patterns[cardId] || "•••• •••• •••• ••••";
  };

  const goTobefore = () => {
    navigate("/upgrade_plan");
  };

  const handleCardSelect = (card) => {
    setSelectedCard(card);
    setCardsExpanded(false);
  };

  const handleInputChange = (field, value) => {
    setCardInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatCardNumber = (number) => {
    return number
      .replace(/\s/g, "")
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  const createParticles = () => {
    const container = particlesRef.current;
    if (!container) return;

    // 기존 파티클 제거
    container.innerHTML = "";

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";

      const angle = (Math.PI * 2 * i) / 20;
      const velocity = 100 + Math.random() * 100;
      const dx = Math.cos(angle) * velocity;
      const dy = Math.sin(angle) * velocity;

      particle.style.cssText = `
        left: 50%;
        top: 50%;
        --dx: ${dx}px;
        --dy: ${dy}px;
        animation: particleExplode 1.5s ease-out forwards;
        animation-delay: ${i * 0.05}s;
      `;

      container.appendChild(particle);

      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 2000);
    }

    // 파티클 효과 종료 후 숨기기
    setTimeout(() => {
      setShowParticles(false);
    }, 2500);
  };

  const handlersubscription = async () => {
    setPaymentProcessing(true);
    setLoading(true);

    const paymentBtn = document.querySelector(".payment_btn");
    paymentBtn.classList.add("processing");
    paymentBtn.value = "처리중...";

    const loader = document.querySelector(".loader");
    loader?.classList.add("payment-processing");

    // 파티클 효과
    setTimeout(() => {
      setShowParticles(true); // 파티클 표시
      setTimeout(() => {
        createParticles();
      }, 100); // 약간의 지연으로 DOM 생성 후 파티클 생성
    }, 1500);

    // 성공 효과
    setTimeout(() => {
      setShowSuccessEffect(true);
    }, 2000);

    const selectedTier = tierName;
    const settings = {
      tier_name: selectedTier,
      timestamp: new Date().toISOString(),
    };

    try {
      // saveSubStatus(settings, selectedTier);

      setTimeout(() => {
        navigate("/upgrade_plan/plus/complete", {
          state: {
            plan_displayName,
            tierName,
            price,
            currency,
            selectedCard,
          },
        });
      }, 4000);
    } catch (error) {
      console.error("결제 처리 중 오류:", error);
      setPaymentProcessing(false);
      setLoading(false);
      paymentBtn.classList.remove("processing");
      paymentBtn.value = "결제하기";
    }
  };

  return (
    <div id="plus_f">
      <div className="payment_container">
        <a className="closeFrame2" onClick={goTobefore}>
          x
        </a>
        <header className="payment_head">
          <p className="planName">{plan_displayName}</p>
          <div className="progression_f">
            <div className="progression_in_begin"></div>
            <div className="progression_in_payment"></div>
            <hr className="progressionHr" />
            <hr className="progressionHr2" />
            <div className="progression_in_completion"></div>
            <div className="progression_titles">
              <p className="progression_title plan">
                {t("subscriptionProcess.select_plan")}
              </p>
              <p className="progression_title Payment">
                {t("subscriptionProcess.enter_payment")}
              </p>
              <p className="progression_title done">
                {t("subscriptionProcess.payment_complete")}
              </p>
            </div>
          </div>
          <hr className="head_hr" />
        </header>

        <main className="payment_body">
          <div className="body_left">
            <div className="selected_card_preview">
              <div className="card_3d_container">
                <div
                  className={`card_3d ${
                    selectedCard?.id === "apple" ? "apple" : ""
                  }`}
                  style={{
                    backgroundImage: selectedCard
                      ? `url(${selectedCard.img})`
                      : "none",
                  }}
                >
                  <div className="card_number">
                    {formatCardNumber(cardInfo.cardNumber) ||
                      (selectedCard
                        ? getCardNumberPlaceholder(selectedCard.id)
                        : "•••• •••• •••• ••••")}
                    {/* 기본 플레이스홀더 */}
                  </div>
                  <div className="card_holder_name">
                    {cardInfo.holderName || "CARD HOLDER"}
                  </div>
                  <div className="card_expiry">
                    {cardInfo.expiryMonth && cardInfo.expiryYear
                      ? `${cardInfo.expiryMonth
                          .toString()
                          .padStart(2, "0")}/${cardInfo.expiryYear
                          .toString()
                          .slice(-2)}`
                      : "MM/YY"}
                  </div>
                </div>
              </div>
            </div>

            {/* 카드 선택 영역 */}
            <div className="card_selection_area">
              <button
                className="card_selector_btn"
                onClick={() => setCardsExpanded(!cardsExpanded)}
                disabled={paymentProcessing}
              >
                {selectedCard
                  ? selectedCard.name
                  : t("subscriptionProcess.select_card")}
                <span className={`arrow ${cardsExpanded ? "expanded" : ""}`}>
                  ▼
                </span>
              </button>
              <div
                className={`card_options ${cardsExpanded ? "expanded" : ""}`}
              >
                {cardTypes.map((card, index) => (
                  <div
                    key={card.id}
                    className="card_option"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                    }}
                    onClick={() => !paymentProcessing && handleCardSelect(card)}
                  >
                    <img src={card.img} alt={card.name} />
                    <span>{card.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <hr className="verticalHr" />
          <div className="body_right">
            <p className="plusPrice_f">
              ${price}{" "}
              <span className="per_month">
                {currency}/{t("subscriptionProcess.monthly")}
              </span>
            </p>
            <div className="payment_input_f">
              <div className="cardholderNmae_f">
                <p>{t("subscriptionProcess.cardholder_name")}</p>
                <input
                  placeholder={t("subscriptionProcess.enter_cardholder_name")}
                  value={cardInfo.holderName}
                  onChange={(e) =>
                    handleInputChange("holderName", e.target.value)
                  }
                  disabled={paymentProcessing}
                />
              </div>
              <div className="cardNumber_f">
                <p>{t("subscriptionProcess.card_number")}</p>
                <input
                  placeholder={t("subscriptionProcess.enter_card_number")}
                  value={cardInfo.cardNumber}
                  onChange={(e) =>
                    handleInputChange("cardNumber", e.target.value)
                  }
                  maxLength="19"
                  disabled={paymentProcessing}
                />
              </div>
              <div className="cardholderBirth_f">
                <p className="expiry_month">
                  {t("subscriptionProcess.expiry_month")}
                </p>
                <p className="expiry_year">
                  {t("subscriptionProcess.expiry_year")}
                </p>
                <p className="cvv_p">CVV</p>

                <select
                  value={cardInfo.expiryMonth}
                  onChange={(e) =>
                    handleInputChange("expiryMonth", e.target.value)
                  }
                  disabled={paymentProcessing}
                >
                  <option value="">
                    {t("subscriptionProcess.select_month")}
                  </option>
                  {/*for문*/}
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>

                <select
                  value={cardInfo.expiryYear}
                  onChange={(e) =>
                    handleInputChange("expiryYear", e.target.value)
                  }
                  disabled={paymentProcessing}
                >
                  <option value="">
                    {" "}
                    {t("subscriptionProcess.select_year")}
                  </option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

                <input
                  placeholder="CVV"
                  value={cardInfo.cvv}
                  onChange={(e) => handleInputChange("cvv", e.target.value)}
                  maxLength="4"
                  disabled={paymentProcessing}
                />
              </div>
            </div>
            <input
              className="payment_btn"
              type="button"
              value={t("subscriptionProcess.pay_now")}
              onClick={handlersubscription}
              disabled={paymentProcessing}
            />
          </div>
          {loading && <div className="loader"></div>}
        </main>
      </div>

      {/* 파티클을 Portal로 body에 직접 렌더링 */}
      {showParticles &&
        createPortal(
          <div className="payment_particles" ref={particlesRef}></div>,
          document.body
        )}

      {/* 성공 이펙트를 Portal로 body에 직접 렌더링 */}
      {showSuccessEffect &&
        createPortal(
          <div className="payment_success_effect show">
            <div className="success_checkmark"></div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default Plus;
