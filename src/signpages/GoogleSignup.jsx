import { GoogleLogin } from "react-google-login";

function SignupWithGoogle() {
  const handleGoogleSuccess = async (response) => {
    const { profileObj, tokenId } = response;
    // profileObj: { email, name, googleId, ... }
    // tokenId: 구글 인증 토큰

    // 서버에 회원가입/로그인 요청
    const res = await fetch("/api/users/google-register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: profileObj.email,
        username: profileObj.name,
        googleId: profileObj.googleId,
        token: tokenId,
      }),
    });
    // 이후 회원가입/로그인 처리
  };

  const handleGoogleFailure = (error) => {
    alert("구글 인증 실패");
  };

  return (
    <GoogleLogin
      clientId="YOUR_GOOGLE_CLIENT_ID"
      buttonText="구글로 회원가입"
      onSuccess={handleGoogleSuccess}
      onFailure={handleGoogleFailure}
      cookiePolicy={"single_host_origin"}
    />
  );
}
