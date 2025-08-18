import React, { useEffect, useState } from "react";
import ParticlesBg from "particles-bg";
import "../../css/BackgroundParticles.css";
import { useTheme } from "../../contexts/ThemeContext";

const BackgroundParticles = ({
  type = "cobweb",
  bg = true,
  color,
  opacity,
}) => {
  const { theme } = useTheme(); // 테마 컨텍스트에서 현재 테마 가져오기
  const particleColor = color || (theme === "dark" ? "#00ffff" : "#ffffff"); // 테마에 따라 파티클 색상 설정
  const [show, setShow] = useState(true); // Particles 컴포넌트의 표시 여부 상태

  useEffect(() => {
    // Particles 재적용 트리거
    setShow(false);
    const timer = setTimeout(() => setShow(true), 100); // 100ms 지연
    return () => clearTimeout(timer);
  }, [type, particleColor, bg]);

  return show ? (
    <ParticlesBg type={type} color={particleColor} bg={bg} />
  ) : null;
};

export default BackgroundParticles;
