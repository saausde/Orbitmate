import React from "react";
//particles-bg라는 외부 라이브러리에서 ParticlesBg 컴포넌트를 불러옴
import ParticlesBg from "particles-bg";

const BackgroundParticles = ({ type = "random", bg = true }) => {
  return (
    <ParticlesBg 
      type={type} 
      bg={bg}
      style={{
        position: 'absolute',
        zIndex: 0, // 사이드바(보통 z-index: 1000)보다 낮게 설정
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'transparent' // 배경 투명화
      }}
    />
  );
};

export default BackgroundParticles;