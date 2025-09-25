설정(세팅) – 프론트 핵심 코드



사용자 환경 개인화(테마·언어·폰트) 및 서버 동기화



설명: 사용자가 선택한 테마/언어/폰트 크기는 즉시 UI에 반영되고, 서버(User Settings)에 저장되어 기기/브라우저가 달라도 동일한 환경이 유지됩니다. 설정 화면은 모달로 제공되며, 드래그 이동·외부 클릭 가드 등 UX 안전장치를 적용했습니다.



핵심 코드:



설정 변경 트리거: 테마 setTheme(e.target.value), 폰트 setFontSize(parseInt(e.target.value)), 언어 i18n.changeLanguage(newLang); setLang(newLang)



서버 저장(동기화): PUT /api/users/:userId/settings(body: { theme, font\_size, primary\_color, language, notifications\_enabled:false, ai\_model\_preference:"" }) → 응답 json.data로 setUser({ ...user, settings:{ ...user.settings, ...json.data } })



저장 최적화: 이전값(prev.theme/font\_size/primary\_color/language)과 현재값 비교 후 변경 없으면 저장 스킵



초기 언어 동기화: user.settings.language가 i18n 현재값과 다르면 i18n.changeLanguage(userLang)



바디 테마 적용: document.body.className="" 후 document.body.classList.add(theme)로 단일 테마 클래스 유지



설정 변경 감지 범위: \[theme, fontSize, primaryColor, i18n.language] 변경 시에만 서버 저장 시도



다국어(i18n) 초기화 및 언어 감지



설명: i18next + LanguageDetector로 브라우저/로컬스토리지 기반 언어를 자동 감지하고, 미지원 언어는 한국어로 폴백합니다. 번역 리소스는 ko/en/ja 3종을 로드합니다.



핵심 코드:



초기화: i18next.use(LanguageDetector).use(initReactI18next).init({ resources:{ en, ko, ja }, lng:"ko", fallbackLng:"ko", interpolation:{ escapeValue:false }, detection:{ order:\["localStorage","navigator","htmlTag"], caches:\["localStorage"] } })



언어 변경: i18n.changeLanguage(newLang) 호출 시 UI 문구 즉시 갱신



언어 변경 애니메이션: i18n.on("languageChanged", ...)에서 0.3초 상태 플래그로 피드백 제공



프로필 드롭다운/설정 모달/드래그 이동 UX



설명: 프로필 아이콘 클릭 시 드롭다운이 열리고, “설정” 선택 시 포털(Portal)로 분리 렌더링된 설정 모달이 표시됩니다. 폼 요소 클릭은 외부 클릭 처리에서 제외하여 의도치 않은 닫힘을 방지하고, 헤더 드래그로 모달을 자유롭게 이동할 수 있습니다.



핵심 코드:



드롭다운 외부 클릭 닫기: isDropdownOpen \&\& !dropdown.contains(event.target) \&\& !profile.contains(event.target) → onToggleDropdown(false)



설정창 포털: ReactDOM.createPortal(<div id="setting\_MainFrame" ... />, document.body)



드래그 시작/진행/해제: 비-폼 요소 클릭 시만 시작(SELECT/INPUT/TEXTAREA/BUTTON/OPTION 제외) → dragOffset 계산 → mousemove/touchmove로 dragPos 갱신 → mouseup/touchend 해제, 언마운트 시 리스너 정리



외부 클릭 가드(설정 프레임): 문서 클릭 시 태그 검사로 폼 요소 클릭 무시, X 버튼(.closeFrame) 클릭일 때만 닫기



탭 전환: 일반 설정(showGeneralSetting) ↔ 프로필 편집(showProfileSetting) 상태 토글



프로필 편집(이름·바이오·테마·이미지) 및 서버 반영



설명: 사용자명/소개/테마 등 텍스트 설정은 저장 버튼 클릭 시 서버에 반영하고, 프로필 이미지는 업로드 즉시 서버 저장 후 미리보기를 갱신합니다. 취소 시 원래 값/이미지를 복원하여 실수 방지 UX를 제공합니다.



핵심 코드:



텍스트 저장: PUT /api/users/:user\_id/profile(body: { username, bio, theme\_preference, badge }) → 성공 시 setUser(prev => ({ ...prev, profile:{ ...prev.profile, username:editName, bio:editBio, theme\_preference:editTheme, badge:editBadge } })) 및 토스트 피드백



취소 복원: 편집 전 값(originalImage, 기존 username/bio/theme\_preference/badge)으로 상태 되돌리고 편집 모드 종료



이미지 업로드: 파일 유효성 검사(타입 image/\*, 크기 ≤ 2MB) → POST /api/users/:user\_id/profile/image(FormData: profileImage) → 응답 data.profile\_image\_path로 풀 URL 구성({API\_BASE}{path}?t=${Date.now()}), 미리보기/Context 동기화



업로드 상태: isLoading 동안 버튼/입력 비활성화, 성공/실패 토스트 표시



입력 바인딩: 이름/바이오/테마 value–onChange 양방향 바인딩, 최대 글자수 제한(이름 30, 바이오 500)



언어 토글(프로필 드롭다운 단축 전환) 및 서버 반영



설명: 드롭다운에서 한 번 클릭으로 ko → en → ja → ko 순환 전환하며, 서버에 사용자 설정으로 즉시 저장합니다.



핵심 코드:



토글 로직: i18n.language === "ko" ? "en" : i18n.language === "en" ? "ja" : "ko"



서버 반영: saveUserSettings({ language:newLang }) → PUT /api/users/:id 성공/실패 로그



UI 피드백: languageChanged 이벤트 기반 짧은 애니메이션 상태 표시



계정 액션/가드 및 접근성



설명: 미로그인 시 로그인 버튼만 렌더링, 로그아웃/업그레이드/관리자 이동은 드롭다운 액션으로 제공되며, 관리자인 경우에만 관리자 메뉴가 노출됩니다. 셀렉트에 aria-label과 tabIndex를 지정해 접근성을 확보했습니다.



핵심 코드:



미로그인 가드: if (!user?.storedValue) return <LoginButton />



로그아웃: 드롭다운 닫기 → logout() → /signin 네비게이션



관리자 전용: user?.profile.is\_admin == 1 조건부 메뉴



접근성: aria-label="Theme select", aria-label="Language select", tabIndex={0} 지정



정리 포인트(포폴 문장용)



설정값은 즉시 UI 반영 + 서버 저장으로 일관된 사용자 경험을 보장



i18n + LanguageDetector로 자동 언어 감지 및 폴백, ko/en/ja 다국어 지원



Portal 기반 모달 + 드래그 이동 + 외부 클릭 가드로 안정적인 설정 UX 구현



프로필 편집은 저장 시 서버 반영, 이미지 업로드는 즉시 반영해 피드백을 빠르게 제공



관리자 조건부 메뉴 / 미로그인 가드 / 접근성 속성으로 품질과 편의성 강화

