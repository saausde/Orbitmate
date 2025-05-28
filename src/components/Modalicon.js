import React from "react";
import "../css/Modalicon.css";

function modalicon({ isVisible, iconsData }) {
  if (!isVisible) {
    return null;
  }

  return (
    // Start 버튼 누른 후 UserInput과 함께 나타날 영역에 배치
    <div className="trigger-icons-container">
      {iconsData.map((icon, index) => (
        // 각 트리거 아이콘 버튼
        <button
          key={icon.id || index}
          className={`modal-trigger-icon icon-${index + 1}`} // 각 아이콘별 고유 클래스 및 순서 클래스
          onClick={icon.openModal} // 클릭 시 해당 모달을 여는 함수 호출
          style={{ backgroundImage: `url(${icon.iconUrl})` }} // 배경 이미지로 아이콘 표시
          aria-label={`Open Modal ${index + 1}`} // 접근성을 위한 라벨 (필요시 icon.label 사용)
        ></button>
      ))}
    </div>
  );
}

export default modalicon;
