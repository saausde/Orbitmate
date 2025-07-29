import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import ko from "../../locales/ko.json";
import en from "../../locales/en.json";
import ja from "../../locales/ja.json";

// i18next 다국어 설정 및 초기화
// LanguageDetector를 use()에 추가하여 브라우저 언어 자동 감지 활성화
// resources: 지원 언어 및 번역 리소스
// lng: 기본 언어
// fallbackLng: 지원하지 않는 언어일 때 대체 언어
// interpolation: XSS 방지 설정

i18next
  .use(LanguageDetector) // 브라우저 언어 감지
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ko: { translation: ko },
      ja: { translation: ja },
    },
    lng: "ko", // 기본 언어
    fallbackLng: "ko",
    interpolation: { escapeValue: false },
    detection: {
      // localStorage, navigator 등에서 언어 감지
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
  });

export default i18next;
