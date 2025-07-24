import React from "react";
import ReactDOM from "react-dom";
import { useTranslation } from "react-i18next";
import "../css/ConfirmModal.css"; // 스타일 분리 권장

function ConfirmModal({ onConfirm, onCancel }) {
  const { t, i18n } = useTranslation();
  const modalContent = (
    <div className="confirm-modal-backdrop">
      <div className="confirm-modal">
        <p>{t("sidebar_buttons.confirm_question")}</p>
        <div className="confirm-buttons">
          <button onClick={onConfirm}>{t("sidebar_buttons.confirm")}</button>
          <button onClick={onCancel}>{t("sidebar_buttons.cancel")}</button>
        </div>
      </div>
    </div>
  );
  return ReactDOM.createPortal(modalContent, document.body); // ✅ createPortal의 두 번째 인자는 JSX가 아님
}
export default ConfirmModal;
