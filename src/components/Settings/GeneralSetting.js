import React, { useEffect, useCallback, useState } from "react";
import "../../css/SettingCSS/GeneralSetting.css";
import "../../css/dark.css";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

function GeneralSetting() {
  // user 상태 관리 추가
  const { user, setUser } = useUser();
  // 다국어 처리 훅
  const { t, i18n } = useTranslation();
  // 현재 언어 상태 (초기값: 현재 i18n 언어)
  const [lang, setLang] = useState(
    user?.settings?.language || i18n.language || "ko"
  );
  // 페이지 이동 훅
  const navigate = useNavigate();
  // 테마/폰트/메인 컬러 상태 및 setter (ThemeContext)
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    primaryColor,
    setPrimaryColor,
  } = useTheme();

  // 뒤로가기 버튼 클릭 시 이전 페이지로 이동
  const handleGoBack = useCallback(
    (e) => {
      e.stopPropagation();
      navigate(-2);
    },
    [navigate]
  );

  useEffect(() => {
    const userLang = user?.settings?.language;
    if (userLang && i18n.language !== userLang) {
      i18n.changeLanguage(userLang);
    }
  }, [user?.settings?.language]);

  // 테마 변경 핸들러
  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  // 폰트 크기 변경 핸들러
  const handleFontSizeChange = (e) => {
    setFontSize(parseInt(e.target.value));
  };

  // 메인 컬러 변경 핸들러
  const handlePrimaryColorChange = (e) => {
    setPrimaryColor(e.target.value);
  };

  // 언어 변경 핸들러
  const changeLanguage = (e) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    setLang(newLang);
  };

  useEffect(() => {
    // 현재 user 상태 콘솔에 출력 (디버깅용)
    console.log("🧠 현재 user 상태:", user);
  }, [user]);

  // 사용자 설정 저장
  useEffect(() => {
    // user가 없거나 settings가 없으면 저장하지 않음
    // user?.settings가 없으면 초기값으로 설정된 상태를 사용
    if (!user?.settings) return;
    const prev = user.settings;

    const isUnchanged =
      prev.theme === theme &&
      prev.font_size === fontSize &&
      prev.primary_color === primaryColor &&
      prev.language === i18n.language;

    if (isUnchanged) return;

    const userId = localStorage.getItem("user_id"); // 또는 user?.login?.user_id
    if (!userId) return;

    const saveSettings = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/users/${userId}/settings`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              theme, // 현재 테마
              font_size: fontSize, // 폰트 크기
              primary_color: primaryColor, // 문서엔 없지만 서버가 받으면 포함 가능
              language: i18n.language, // i18n 상태 그대로 반영
              notifications_enabled: false, // 사용 안 하면 false로 고정
              ai_model_preference: "", // 공백으로
            }),
          }
        );

        // 서버 응답 처리
        const json = await res.json();
        if (!res.ok) {
          console.error("설정 저장 실패:", json);
        } else {
          // 서버 응답 기준으로 user.settings를 최신화
          const updatedSettings = {
            ...user.settings,
            ...json.data, // 서버가 응답한 설정 필드로 덮어쓰기
          };

          if (
            JSON.stringify(user.settings) !== JSON.stringify(updatedSettings)
          ) {
            setUser({
              ...user,
              settings: updatedSettings,
            });
          }
        }
      } catch (err) {
        console.error("설정 저장 중 오류 발생:", err);
      }
    };

    saveSettings(); // 비동기 함수 호출
  }, [theme, fontSize, primaryColor, i18n.language]); // 테마, 폰트 크기, 메인 컬러, 언어 변경 시마다 실행

  // i18n 언어 변경 시 lang 상태 동기화
  useEffect(() => {
    setLang(i18n.language);
  }, [i18n.language]);

  // 테마 변경 시 body 클래스 적용
  useEffect(() => {
    document.body.className = ""; // 기존 테마 제거
    document.body.classList.add(theme); // 새로운 테마 적용
  }, [theme]);

  // [설정창 닫기] closeFrame 클릭 시만 닫히도록 수정
  // 드롭다운/설정창 외부 클릭 시 닫기 핸들러에서 select 등 폼 요소 클릭은 무시
  useEffect(() => {
    const handleDocumentClick = (event) => {
      // select, option, input, textarea, button 등 폼 요소 클릭 시 무시
      const tag = event.target.tagName;
      if (["SELECT", "OPTION", "INPUT", "TEXTAREA", "BUTTON"].includes(tag))
        return;
      // closeFrame(X 버튼) 클릭 시만 닫기
      if (event.target.classList.contains("closeFrame")) {
        document.getElementById("setting_MainFrame").style.display = "none";
        return;
      }
    };
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  return (
    <div id="general_setting_frame">
      {/* 설정 타이틀 */}
      <h3 className="general_setting_title">{t("general_setting.title")}</h3>
      <hr className="titleDivider" />

      {/* 테마 설정 영역 */}
      <div className="themePart">
        {t("general_setting.theme")}
        {/* 테마 선택 드롭다운 */}
        <select
          className="themeOption"
          value={theme}
          onChange={handleThemeChange}
          tabIndex={0}
          aria-label="Theme select"
        >
          <option value="light">{t("general_setting.light_theme")}</option>
          <option value="dark">{t("general_setting.dark_theme")}</option>
        </select>
      </div>
      <hr className="themeDivider" />

      {/* 언어 설정 영역 */}
      <div className="languagePart">
        {t("general_setting.language")}
        {/* 언어 선택 드롭다운 */}
        <select
          className="languageOption"
          onChange={changeLanguage}
          value={lang}
          tabIndex={0}
          aria-label="Language select"
        >
          <option value="ko">{t("general_setting.ko")}</option>
          <option value="en">{t("general_setting.en")}</option>
        </select>
      </div>
      <hr className="languageDivider" />

      {/* (추후) 폰트 크기/메인 컬러 설정 영역 추가 가능 */}
      <div className="fontSizePart">
        {t("general_setting.font_size")}
        {/* 폰트 크기 선택 드롭다운 */}
        <select
          value={fontSize}
          onChange={handleFontSizeChange}
          className="fontSizeOption"
        >
          <option value={12}>{t("general_setting.font_size_minimal")}</option>
          <option value={14}>{t("general_setting.font_size_small")}</option>
          <option value={16}>{t("general_setting.font_size_medium")}</option>
          <option value={18}>{t("general_setting.font_size_large")}</option>
          <option value={20}>{t("general_setting.font_size_xlarge")}</option>
        </select>
      </div>
      <hr className="fontSizeDivider" />
    </div>
  );
}

export default GeneralSetting;
