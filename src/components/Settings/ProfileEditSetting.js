import React, { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import profile_sample from "../../images/among_us_character.png";
import "../../css/SettingCSS/ProfileEditSetting.css";
import "../../css/dark.css";
import { useUser } from "../../contexts/UserContext";
import LoginButton from "../TitleSection/LoginButton";
import { useTranslation } from "react-i18next";

function ProfileEditSetting({
  isDropdownOpen,
  onToggleDropdown,
  onEditProfile,
  setUploadedImage: setUploadedImageFromParent,
}) {
  // 사용자 정보 및 상태 관리
  const { user, setUser, logout, DeleteAccount } = useUser();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

  // 다국어 처리 훅
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState("ko");

  // 구독 티어 이름 매핑 객체 (API 응답에 따른 매핑 선언)
  const tierNameMap = {
    "오빗메이트 코멧": "OrbitMate Comet",
    "오빗메이트 플래닛": "OrbitMate Planet",
    "오빗메이트 스타": "OrbitMate Star",
    "오빗메이트 갤럭시": "OrbitMate Galaxy",
  };

  // 티어 이름을 언어에 맞게 변환하는 함수 (영어는 매핑된 이름 사용)
  const getTierDisplayName = (tierDisplayName) => {
    if (i18n.language === "en") {
      return tierNameMap[tierDisplayName] || tierDisplayName;
    }
    return tierDisplayName;
  };

  // 프로필 이미지, 입력값 상태
  const [uploadedImage, setUploadedImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null); // 원본 이미지 URL
  const [selectedImageFile, setSelectedImageFile] = useState(null); // 선택된 파일 (업로드 전)
  const [previewImage, setPreviewImage] = useState(null);
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editTheme, setEditTheme] = useState("dark");
  const [editBadge, setEditBadge] = useState("");
  const [edit_profile, setedit_profile] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const calculateProgress = () => {
    const currentExp = user?.profile?.experience || 0;
    const nextLevelExp = user?.profile?.next_level_experience || 100;
    return Math.min((currentExp / nextLevelExp) * 100, 100);
  };

  // 드롭다운 외부 클릭 시 닫기
  const handleDocumentClick = useCallback(
    (event) => {
      const dropdown = dropdownRef.current;
      const profile = profileRef.current;
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

  // 프로필 수정 모드 진입 시 기존 정보 입력란에 반영
  useEffect(() => {
    if (user?.profile) {
      setEditEmail(user.profile.email || "");
      setEditName(user.profile.username || "");
      setEditBio(user.profile.bio || "");
      setEditTheme(user.profile.theme_preference || "space");
      setEditBadge(user.profile.badge || "");

      const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/\/$/, "");
      const profileImagePath = user.profile.profile_image_path;
      const fullImageUrl = profileImagePath
        ? `${baseUrl}${profileImagePath}`
        : null;

      setOriginalImage(fullImageUrl);
      setPreviewImage(fullImageUrl);
    }
  }, [user?.profile]);

  // 사용자 구독 정보 조회
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user?.login?.user_id) return;

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/subscriptions/users/${user.login.user_id}/subscription`
        );
        const data = await response.json();
        setSubscription(data.data);
      } catch (error) {
        console.error("구독 정보 불러오기 실패:", error);
      }
    };

    fetchSubscription();
  }, [user?.login?.user_id]);

  // 로그인 상태가 아니면 로그인 버튼 노출
  if (!user?.storedValue) return <LoginButton />;

  // 프로필 저장(수정) 함수
  const save = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/${user.login.user_id}/profile`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: editName,
            bio: editBio,
            theme_preference: editTheme,
            badge: editBadge,
          }),
        }
      );

      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error || "프로필 업데이트 실패");

      // 구조 유지하며 profile만 업데이트
      setUser((prev) => {
        if (!prev) {
          console.warn("User state is null, skipping profile update");
          return prev;
        }
        return {
          ...prev,
          profile: {
            ...prev.profile,
            username: editName,
            bio: editBio,
            theme_preference: editTheme,
            badge: editBadge,
          },
        };
      });

      setUploadedImage(previewImage);
      setUploadedImageFromParent?.(previewImage);
      setedit_profile(false);

      // 성공 피드백
      const successEl = document.createElement("div");
      successEl.textContent = "프로필이 업데이트되었습니다!";
      successEl.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        background: #23a559; color: white; padding: 12px 16px;
        border-radius: 4px; font-size: 14px; font-weight: 500;
        animation: slideInRight 0.3s ease-out;
      `;
      document.body.appendChild(successEl);
      setTimeout(() => successEl.remove(), 3000);
    } catch (err) {
      console.error(err);
      // 에러 피드백
      const errorEl = document.createElement("div");
      errorEl.textContent = err.message;
      errorEl.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        background: #da373c; color: white; padding: 12px 16px;
        border-radius: 4px; font-size: 14px; font-weight: 500;
      `;
      document.body.appendChild(errorEl);
      setTimeout(() => errorEl.remove(), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // 프로필 수정 취소
  const cancel = () => {
    setEditEmail(user?.profile?.email || "");
    setEditName(user?.profile?.username || "");
    setEditBio(user?.profile?.bio || "");
    setEditTheme(user?.profile?.theme_preference || "dark");
    setEditBadge(user?.profile?.badge || "");
    setPreviewImage(originalImage);
    setSelectedImageFile(null);
    setedit_profile(false);
  };

  // 프로필 수정 모드 진입
  const handleEditProfileClick = (e) => {
    e.preventDefault();
    onToggleDropdown(false);
    onEditProfile();
    setedit_profile(true);
  };

  // 로그아웃 처리
  const handleLogoutClick = (e) => {
    e.preventDefault();
    onToggleDropdown(false);
    logout();
    navigate("/signin");
  };

  // 프로필 이미지 변경 핸들러
  const handleImgChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 유효성 검사
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("이미지 파일 크기는 최대 2MB입니다.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. 파일 업로드
      const formData = new FormData();
      formData.append("profileImage", file); // ✅ 여기서 file을 직접 사용

      const imageRes = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/${user.login.user_id}/profile/image`,
        {
          method: "POST",
          body: formData,
        }
      );

      const imageData = await imageRes.json();
      if (!imageRes.ok)
        throw new Error(imageData.message || "이미지 업로드 실패");

      // 2. 미리보기 반영
      const baseUrl = process.env.REACT_APP_API_BASE_URL.replace(/\/$/, "");
      const uploadedImagePath = imageData.data.profile_image_path;
      const fullUrl = `${baseUrl}${uploadedImagePath}?t=${Date.now()}`;

      setPreviewImage(fullUrl);
      setUploadedImage(fullUrl);
      setUploadedImageFromParent?.(fullUrl);

      // 3. user context 업데이트
      setUser((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          profile_image_path: uploadedImagePath,
        },
      }));
    } catch (err) {
      console.error("이미지 업로드 실패:", err);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 회원 탈퇴
  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      )
    ) {
      return;
    }

    try {
      await DeleteAccount(user.login.user_id);
      localStorage.clear();
      navigate("/signin");
    } catch (error) {
      console.error("계정 삭제 실패:", error);
      alert("계정 삭제에 실패했습니다.");
    }
  };

  // 테마에 따른 배너 스타일 결정
  const getBannerStyle = (theme) => {
    switch (theme) {
      case "light":
        return {
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          className: "",
        };
      case "space":
        return {
          background: "#000",
          className: "space-theme",
        };
      case "purple":
        return {
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          className: "",
        };
      case "green":
        return {
          background: "linear-gradient(135deg, #11998e, #38ef7d)",
          className: "",
        };
      default:
        return {
          background: "linear-gradient(135deg, #5865f2, #7289da, #b794f6)",
          className: "",
        };
    }
  };

  return (
    <div
      id="edit_profile_main"
      className={`${isLoading ? "loading" : ""} ${
        editTheme === "light" ? "theme-light" : ""
      }`}
    >
      {/* 배너 영역 */}
      <div
        className={`profile-banner ${getBannerStyle(editTheme).className}`}
        style={{ background: getBannerStyle(editTheme).background }}
      >
        {editTheme === "space" && (
          <video
            className="space-video"
            autoPlay
            loop
            playsInline
            muted
            data-mtctest-ignore="true"
          >
            <source
              src="https://cdn.discordapp.com/assets/content/a0b45cf7a3d455e779fb8bc319d12aeeddd1099ebc390234f257f6736f2047bd.webm"
              type="video/webm"
            />
          </video>
        )}
      </div>

      {/* 프로필 이미지 */}
      <div className="profile-avatar-container">
        <div
          className="profile-avatar"
          onClick={() =>
            !isLoading && document.getElementById("profileImageInput").click()
          }
        >
          <img
            src={previewImage || uploadedImage || profile_sample}
            alt="profile"
          />
          <div className="profile-avatar-overlay">
            <span className="camera-icon">📷</span>
          </div>
        </div>
        <input
          id="profileImageInput"
          className="hidden-file-input"
          type="file"
          onChange={handleImgChange}
          accept="image/*"
          disabled={isLoading}
        />
      </div>

      {/* 프로필 정보 영역 */}
      <div className="profile-content">
        {/* 뱃지 */}
        {(user?.profile?.badge || editBadge) && (
          <div className="user-badges">
            <span className="badge">
              {edit_profile ? editBadge : user?.profile?.badge}
            </span>
          </div>
        )}

        {/* 사용자명 */}
        <h2 className="profile-username">
          {edit_profile
            ? editName || t("profileEdit_Setting.username")
            : user?.profile?.username || t("profileEdit_Setting.username")}
        </h2>

        {/* 표시명 (이메일) */}
        <p className="profile-display-name">
          {user?.profile?.email || "user@example.com"}
        </p>

        {/* 상태 표시 */}
        <div className="status-indicator">
          <div className="status-dot"></div>
          <span className="status-text">
            {t("profileEdit_Setting.onlineStatus")}
          </span>
        </div>

        {/* 바이오 */}
        <div className="profile-bio">
          {edit_profile
            ? editBio || (
                <span className="profile-bio-placeholder">
                  {t("profileEdit_Setting.placeholderYourIntroduction")}
                </span>
              )
            : user?.profile?.bio || (
                <span className="profile-bio-placeholder">
                  {t("profileEdit_Setting.placeholderYourIntroduction")}
                </span>
              )}
        </div>

        {/* 구독 정보 */}
        {subscription?.tier && (
          <div className="profile-info-section">
            <div className="status-indicator">
              <span className="status-text">
                {t("profileEdit_Setting.subscription")}:{" "}
                {getTierDisplayName(subscription.tier.tier_display_name)}
              </span>
            </div>
          </div>
        )}

        <div className="profile-info-section">
          <div className="status-indicator">
            <span className="status-text">
              {t("profileEdit_Setting.level")} {user?.profile?.level || 1}
              {/* •{" "}
              {user?.profile?.experience || 0} /{" "}
              {user?.profile?.next_level_experience || 100} EXP*/}
            </span>
          </div>
        </div>
      </div>

      {/* 편집 폼 */}
      <div className={`edit-form ${edit_profile ? "active" : ""}`}>
        <div className="form-group">
          <label className="form-label">
            {t("profileEdit_Setting.username")}
          </label>
          <input
            className="form-input"
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="사용자명을 입력하세요"
            maxLength={30}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            {t("profileEdit_Setting.UserBio")}
          </label>
          <textarea
            className="form-textarea"
            value={editBio}
            onChange={(e) => setEditBio(e.target.value)}
            placeholder={t("profileEdit_Setting.empty_introduction")}
            maxLength={500}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t("profileEdit_Setting.theme")}</label>
          <select
            className="form-input"
            value={editTheme}
            onChange={(e) => setEditTheme(e.target.value)}
          >
            <option value="dark">{t("profileEdit_Setting.dark")}</option>
            <option value="light">{t("profileEdit_Setting.light")}</option>
            <option value="space">{t("profileEdit_Setting.space")}</option>
            <option value="purple">{t("profileEdit_Setting.purple")}</option>
            <option value="green">{t("profileEdit_Setting.green")}</option>
          </select>
        </div>

        {/* <div className="form-group">
          <label className="form-label">뱃지</label>
          <input
            className="form-input"
            type="text"
            value={editBadge}
            onChange={(e) => setEditBadge(e.target.value)}
            placeholder="뱃지를 입력하세요"
            maxLength={50}
          />
        </div> */}

        <div className="button-group">
          <button
            className="discord-button secondary"
            onClick={cancel}
            disabled={isLoading}
          >
            {t("sidebar_buttons.cancel")}
          </button>
          <button
            className="discord-button primary"
            onClick={save}
            disabled={isLoading}
          >
            {isLoading ? "저장 중..." : t("profileEdit_Setting.save")}
          </button>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="profile-actions">
        {!edit_profile && (
          <button className="action-button" onClick={handleEditProfileClick}>
            {t("profileEdit_Setting.title")}
          </button>
        )}

        <button className="action-button secondary" onClick={handleLogoutClick}>
          {t("profileEdit_Setting.logout")}
        </button>

        <button className="discord-button danger" onClick={handleDeleteAccount}>
          {t("profileEdit_Setting.delete_account")}
        </button>
      </div>
    </div>
  );
}

export default ProfileEditSetting;
