// Profile 컴포넌트: 사용자 프로필, 드롭다운, 프로필 편집, 드래그 이동, 언어 설정 등 UI/UX 제공
import React, { useRef, useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import userIcon from "../../images/user-icon.png";
import { useNavigate } from "react-router-dom"; // 페이지 이동
import setting_icon from "../../images/setting_icon2.png";
import profile_edit_img from "../../images/profile_edit.png";
import account_icon from "../../images/account_icon.png";
//import Dev_img from "../../images/dev_icon.png";
import notification_icon from "../../images/notification_icon.png";
import OrbitmateUpgrade_icon from "../../images/Orbitmate_Upgrade_icon2.png";
import logOut_img from "../../images/log_out.png";
import admin_icon1 from "../../images/admin_icon1.png";
import "../../css/Profile.css";
import "../../css/dark.css";
import { useUser } from "../../contexts/UserContext";
import LoginButton from "../TitleSection/LoginButton";
import GeneralSetting from "./GeneralSetting";
import ProfileEditSetting from "./ProfileEditSetting";
import ReactDOM from "react-dom";

// 주요 기능별로 상세 주석 추가
const Profile = ({ onToggleDropdown, onEditProfile, isDropdownOpen }) => {
  // 다국어 처리 및 언어 애니메이션 상태
  const { t, i18n } = useTranslation();

  // 사용자 정보 및 인증 관련 상태/함수
  const { user, logout, setUser } = useUser(); // 사용자 정보 가져오기
  // 사용자 ID를 가져오는 함수 (user 객체에서 id 속성 추출)
  const getUserId = () => user?.id; // 사용자 ID 가져오기
  const dropdownRef = useRef(null); // 드롭다운 참조
  const profileRef = useRef(null); // 프로필 아이콘 참조
  const navigate = useNavigate(); // 페이지 이동
  const [LanguageAnimation, setIsLanguageAnimation] = useState(); // 언어 변경 애니메이션 상태

  const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/\/$/, ""); // API 기본 URL (슬래시 제거)
  const profileImagePath = user?.profile?.profile_image_path; // 사용자 프로필 이미지 경로
  const profileImageUrl = profileImagePath // 프로필 이미지 URL 생성
    ? `${baseUrl}${profileImagePath}` // API 기본 URL과 프로필 이미지 경로 결합
    : null; // 프로필 이미지가 없으면 null

  // [API 연동] 사용자 설정 저장 함수
  const saveUserSettings = async (settings) => {
    // 사용자 설정 저장 함수
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/${getUserId()}`,
        {
          method: "PUT", // PUT 메서드로 사용자 정보 업데이트
          headers: {
            "Content-Type": "application/json", // 요청 본문이 JSON 형식임을 명시
          },
          body: JSON.stringify(settings), // 설정 객체를 JSON 문자열로 변환하여 요청 본문에 포함
        }
      );
      const data = await response.json(); // 응답을 JSON으로 파싱
      if (data.status === "success") {
        console.log("사용자 설정 저장 성공:", data.data.message); // 성공 메시지 출력
      } else {
        console.error("설정 저장 실패:", data.message); // 실패 메시지 출력
      }
    } catch (error) {
      console.error("설정 저장 중 오류 발생:", error); // 오류 발생 시 콘솔에 출력
    }
  };

  // [언어 전환] 언어 변경 및 서버 저장
  const handleLanguageToggle = () => {
    // 언어 순환: 한국어 -> 영어 -> 일본어 -> 한국어
    let newLang;
    if (i18n.language === "ko") {
      newLang = "en";
    } else if (i18n.language === "en") {
      newLang = "ja";
    } else {
      newLang = "ko";
    }
    i18n.changeLanguage(newLang); // 언어 변경
    saveUserSettings({ language: newLang });
  };

  // [언어 변경 애니메이션] 언어 변경 시 애니메이션 트리거
  useEffect(() => {
    const onLanguageChange = () => {
      setIsLanguageAnimation(true); // 언어 변경 시 애니메이션 시작
      setTimeout(() => setIsLanguageAnimation(false), 300); // 0.3초 후 애니메이션 종료
    };
    i18n.on("languageChanged", onLanguageChange); // 이벤트 등록
    return () => {
      i18n.off("languageChanged", onLanguageChange); // 메모리 누수 방지
    };
  }, [i18n]);

  // [프로필 편집] 편집 창 표시 상태
  const [edit_profile, setEditProfile] = useState(false);
  // [드래그 이동] 위치, 오프셋, 드래깅 상태
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const mainFrameRef = useRef(null); // 편집창 프레임 참조

  // [설정 탭] 일반/프로필 설정 탭 상태
  const [showGeneralSetting, setshowGeneralSetting] = useState(true);
  const [showProfileSetting, setshowProfileSetting] = useState(false);
  // [프로필 이미지] 업로드/미리보기 상태
  const [uploadedImage, setUploadedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // [드래그 시작] 마우스/터치 위치 저장
  const handleDragStart = (e) => {
    // select, input, textarea, button 등 폼 요소 클릭 시 드래그 시작하지 않음
    const tag = e.target.tagName;
    if (["SELECT", "INPUT", "TEXTAREA", "BUTTON", "OPTION"].includes(tag))
      return;
    e.preventDefault();
    setDragging(true);
    const rect = mainFrameRef.current.getBoundingClientRect();
    const clientX = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;
    setDragOffset({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
  };

  // [드래그 중] 위치 실시간 갱신
  const handleDrag = (e) => {
    if (!dragging) return;
    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;
    setDragPos({
      x: clientX - dragOffset.x,
      y: clientY - dragOffset.y,
    });
  };

  // [드래그 끝] 드래그 상태 해제
  const handleDragEnd = () => {
    setDragging(false);
  };

  // [드래그 이벤트 등록/해제] 드래그 상태에 따라 이벤트 바인딩
  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleDrag);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleDrag);
      window.addEventListener("touchend", handleDragEnd);
    } else {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDrag);
      window.removeEventListener("touchend", handleDragEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDrag);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [dragging, dragOffset]);

  // [드롭다운 외부 클릭 시 닫기] 드롭다운/프로필 영역 외 클릭 감지
  const handleDocumentClick = useCallback(
    (event) => {
      const dropdown = dropdownRef.current; // 드롭다운 참조
      const profile = profileRef.current; // 프로필 아이콘 참조
      // 드롭다운이 열려 있고, 클릭한 요소가 드롭다운이나 프로필 아이콘이 아닐 때 닫기
      if (
        isDropdownOpen &&
        dropdown &&
        profile &&
        !dropdown.contains(event.target) &&
        !profile.contains(event.target)
      ) {
        onToggleDropdown(false);
      }
    },
    [isDropdownOpen, onToggleDropdown]
  );

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [handleDocumentClick]);

  // [로그인 상태 아닐 때] 로그인 버튼만 표시
  if (!user?.storedValue) return <LoginButton />;

  // [프로필 편집 취소]
  const cancel = () => {
    setEditProfile(false);
  };

  // [프로필 편집 버튼 클릭] 드롭다운 닫고 편집창 표시
  const handleEditProfileClick = () => {
    onToggleDropdown(false);
    onEditProfile();
    setEditProfile(true);
  };

  // [로그아웃 버튼 클릭] 드롭다운 닫고 로그아웃 처리
  const handleLogoutClick = () => {
    onToggleDropdown(false);
    logout();
    navigate("/signin");
  };

  // [프로필 이미지 변경] 파일 선택 시 미리보기
  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // [설정 탭 전환] 일반/프로필 설정 탭 전환
  const handleGeneralSetting = () => {
    setshowGeneralSetting(true);
    setshowProfileSetting(false);
  };
  const handlerProfileEditSetting = () => {
    setshowProfileSetting(true);
    setshowGeneralSetting(false);
  };
  // [설정창 닫기]
  const cancelSettingFrame = () => {
    setEditProfile(false);
  };

  const handlesubscription = () => {
    navigate("/upgrade_plan");
  };

  const handleDev = () => {
    navigate("/admin");
  };

  // [렌더링] 프로필, 드롭다운, 편집창 UI
  return (
    <>
      {/* 프로필 아이콘 (클릭 시 드롭다운) */}
      <div
        className="user-icon-container"
        onClick={onToggleDropdown}
        ref={profileRef}
      >
        <img
          className="user-icon"
          src={uploadedImage || profileImageUrl || userIcon}
          alt="user icon"
        />
      </div>
      {/* 드롭다운 메뉴 */}
      <div
        className={`dropdown-content ${isDropdownOpen ? "active" : ""}`}
        ref={dropdownRef}
      >
        <img src={setting_icon} className="setting_icon" />
        <img src={logOut_img} className="logOut_icon" />
        <img src={account_icon} className="Account_icon" />
        {user?.profile.is_admin == 1 && (
          <img src={admin_icon1} className="admin_icon1" />
        )}
        {/*<img src={Dev_img} className="Dev_icon" />*/}
        <img src={OrbitmateUpgrade_icon} className="OrbitmateUpgrade_icon" />
        <a style={{ pointerEvents: "none" }} className="user_username">
          {user?.profile?.username}
        </a>

        <a href="" onClick={handlesubscription}>
          OrbitMate+
        </a>

        <a
          href=""
          onClick={(e) => {
            e.preventDefault();
            handleEditProfileClick();
          }}
        >
          {t("profile_setting.setting")}
        </a>

        <a href="" onClick={handleLogoutClick}>
          {t("profile_setting.logOut")}
        </a>
        {user?.profile.is_admin == 1 && (
          <a
            href=""
            onClick={(e) => {
              e.preventDefault();
              handleDev();
            }}
          >
            {t("profile_setting.adminPage")}
          </a>
        )}
      </div>
      {/* 프로필/설정 편집창 (드래그 이동 가능) */}
      {edit_profile
        ? ReactDOM.createPortal(
            <div
              id="setting_MainFrame"
              ref={mainFrameRef}
              className="active"
              style={{
                left: dragPos.x !== 0 ? dragPos.x : "50%", // 드래그 위치에 따라 좌우 위치 조정
                top: dragPos.y !== 0 ? dragPos.y : "50%", // 드래그 위치에 따라 상하 위치 조정
                transform:
                  dragPos.x !== 0 || dragPos.y !== 0
                    ? "none"
                    : "translate(-50%, -50%)", // 중앙 정렬
                overflow: "visible", // 오버플로우 visible로 설정
              }}
              onMouseDown={handleDragStart} // 마우스 드래그 시작
              onTouchStart={handleDragStart} // 터치 드래그 시작
            >
              {/* 닫기(X) 버튼 - 항상 보이도록 강조 */}
              <input
                type="button"
                value="X"
                className="closeFrame"
                onClick={cancelSettingFrame}
                tabIndex={0}
              />
              <div className="CategoriesSetting_f">{/* 배경 레이어 */}</div>
              {/* 일반 설정 탭 */}
              <input
                className="general_setting"
                type="button"
                value={t("profile_setting.general")}
                onClick={handleGeneralSetting}
              />
              {showGeneralSetting && <GeneralSetting />}
              <img src={setting_icon} className="setting_icon_in_general" />
              {/* 프로필 편집 탭 */}
              <div>
                <input
                  className="profile_setting"
                  type="button"
                  value={t("profile_setting.profileEdit_setting")}
                  onClick={handlerProfileEditSetting}
                />
                {showProfileSetting && (
                  <ProfileEditSetting
                    setUploadedImage={setUploadedImage}
                    onToggleDropdown={onToggleDropdown}
                    onEditProfile={() => setEditProfile(true)}
                    isDropdownOpen={isDropdownOpen}
                    closeSettingFrame={() => setEditProfile(false)}
                    user={user}
                  />
                )}
                <img src={profile_edit_img} className="profile_edit_icon" />
              </div>
              <div>
                <input
                  className="notification_setting"
                  type="button"
                  value={t("notification_setting.title")}
                />
                <img className="notification_icon" src={notification_icon} />
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
};

export default Profile;
