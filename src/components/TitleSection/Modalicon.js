import React from "react";
import "../../css/Modalicon.css";
import "../../css/dark.css";

// 여러 개의 모달 트리거 아이콘을 보여주는 컴포넌트
function Modalicon({ isVisible, iconsData }) {
  // 아이콘이 보이지 않아야 할 때 렌더링하지 않음
  if (!isVisible) {
    return null;
  }

  return (
    // Start 버튼 누른 후 UserInput과 함께 나타날 영역에 배치
    <div className="trigger-icons-container">
      {/* 각 트리거 아이콘 버튼 렌더링 */}
      {iconsData.map((icon, index) => (
        <button
          key={icon.id || index}
          className={`modal-trigger-icon icon-${index + 1}`}
          onClick={icon.openModal} // 클릭 시 해당 모달을 여는 함수 호출
          style={{ backgroundImage: `url(${icon.iconUrl})` }} // 배경 이미지로 아이콘 표시
          aria-label={`Open Modal ${index + 1}`}
        ></button>
      ))}
    </div>
  );
}

export default Modalicon;
