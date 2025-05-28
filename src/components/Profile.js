import React, { useRef, useEffect, useState, useCallback } from "react";
import userIcon from "../images/user-icon.png";
import { useNavigate } from "react-router-dom"; // React Router 사용 가정
import profile_sample from "../images/among_us_character.png";
import "../App.css";
import { useUser } from "../contexts/UserContext";
import LoginButton from "./LoginButton";

const Profile = ({
  onToggleDropdown,
  onEditProfile,
  onUiSettings,
  isDropdownOpen,
}) => {
  const { user, logout, setUser } = useUser();
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate(); // 페이지 전환을 위한 useNavigate 훅 사용

  //프로필 편집 누르면 편집할 수 있는 창이 하나 뜨게 설정
  const [edit_profile, setedit_profile] = useState(false);
  const [animation, setanimation] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName]   = useState("");
  const [editBio, setEditBio] = useState("");


  //드롭다운이 열려있을 때, 외부 클릭 시 닫히게함.
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
  ); // 의존성 명시

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [handleDocumentClick]); // useCallback로 메모이제이션된 함수만 의존성으로 넣기

  //프로필 수정 창이 열리면 기존 사용자 정보로 입력 필드 채움.
  useEffect(() => {
    if (edit_profile && user) {
      setEditEmail(user.email || "");
      setEditName(user.username || "");
      setEditBio(user.bio || "");
      setPreviewImage(user.profile_image_path || null);
    }
  }, [edit_profile, user]);

  if (!user?.storedValue) return <LoginButton />;

  const save = async () => {
    try {
      // 서버에 업데이트 요청
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/${user.user_id}/profile`,
        {
          method: "PUT", //프로필 수정 내용을 서버에 PUT 으로 전송
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: editName, bio: editBio }),
        }
      );
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error || "프로필 업데이트 실패");

      console.log("또 성공", updated)
      
      // 컨텍스트와 로컬 상태 업데이트
      setUser({ ...updated, storedValue: true });
      setUploadedImage(previewImage);
      setedit_profile(false);
      alert("프로필이 업데이트되었습니다.");
      //window.location.reload();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const cancel = () => {
    setedit_profile(false);
  };

  const handleUiSettingsClick = () => {
    onToggleDropdown(false); // 드롭다운 닫기
    onUiSettings();
    navigate("/UISettings"); // UI 설정 페이지로 이동
  };

  const handleEditProfileClick = () => {
    onToggleDropdown(false); // 드롭다운 닫기
    onEditProfile(); // 프로필 편집 처리
    setedit_profile(true);
    setanimation(true);
  };

  const handleLogoutClick = () => {
    onToggleDropdown(false); // 드롭다운 닫기
    logout();
    navigate("/signin")
  };

  const handleImgChange = (e) => {
    //e.target.files(사용자가 선택한 이미지파일) 을 file에 담기
    //사용할 이미지는 하나이기때문에 배열을 0만 잡는다.
    const file = e.target.files[0];
    //파일이 존재한다면
    if (file) {
      //FileReader를 사용해 파일을 읽을 준비를 하고
      const reader = new FileReader();
      //onloadend: 읽은 파일을 실행할 함수영역
      reader.onloadend = () => {
        //reader.result(읽은 파일의 결과) setUploadedImage에 담는다.
        setPreviewImage(reader.result);
      };
      //읽은 파일을 URL로 바꿔주는 함수
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile-container">
      <div
        className="user-icon-container"
        onClick={onToggleDropdown} // () => onToggleDropdown(!isDropdownOpen) 대신 onToggleDropdown 직접 호출
        ref={profileRef}
      >
        <img
          className="user-icon"
          src={uploadedImage ? uploadedImage : userIcon}
          alt="user icon"
          style={{
            width: "45px",
            height: "45px",
            borderRadius: "50%",
          }}
        />
      </div>

      <div
        id="userDropdown"
        className={`dropdown-content ${isDropdownOpen ? "active" : ""}`}
        ref={dropdownRef}
      >
        <a href="" onClick={handleEditProfileClick}>
          프로필 편집
        </a>
        <a href="" onClick={handleUiSettingsClick}>
          UI 설정
        </a>
        <a href="" onClick={handleLogoutClick}>
          로그아웃
        </a>
      </div>

      <div
        id="edit_profile"
        style={{
          display: edit_profile ? "block" : "none",
        }}
      >
        <div className="edit_profile_frame"></div>
        <hr className="vertical_hr" />
        <div className="my_profile">My Profile</div>
        <hr
          className="my_profile_hr"
          style={{
            width: "700px",
            position: "absolute",
            top: "230px",
            left: "580px",
            height: "3px",
            background: "linear-gradient(to right, #ffffff, #ff79c6, #50fa7b)",
            border: "none",
            borderRadius: "4px",
            boxShadow: "0 0 6px rgba(255, 255, 255, 0.4)",
          }}
        />

        <input className="profile_setting" type="button" value="프로필 세팅" />
        <input
          className="edit_complete"
          type="button"
          value="저장"
          onClick={save}
        />
        <input
          className="cancel_btn"
          type="button"
          value="취소"
          onClick={cancel}
        />
        <div className="profile_image">
          <img
            className="profile_sample"
            src={previewImage || uploadedImage || profile_sample}
            alt="profile"
          />
        </div>

        <input
          className="change_profile_img"
          type="file"
          onChange={handleImgChange}
        />

        <div className="first_name">Name</div>
        <input
          className="change_name_f"
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
        />
        <div className="edit_email">Email</div>
        <input
          className="edit_email_input"
          type="email"
          value={editEmail}
          onChange={(e) => setEditEmail(e.target.value)}
        />
        <div className="phone_number">Phone</div>
        <input className="edit_phone_number_input" />
      </div>
    </div>
  );
};

export default Profile;
