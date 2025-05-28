import React from 'react';
import '../css/Modal.css';

function Modal({ isModalOpen, onClose, modalNum, className }) {
  const Modallist = (num) => {
    switch (num) {
      case 1:
        return (
          <div className="link-list-modal">
            <ul>
              <li><a href="https://m.entertain.naver.com/home" target="_blank" rel="noopener noreferrer">엔터</a></li>
              <li><a href="https://finance.naver.com/" target="_blank" rel="noopener noreferrer">증권</a></li>
              <li><a href="https://news.naver.com/" target="_blank" rel="noopener noreferrer">뉴스</a></li>
              <li><a href="https://sports.news.naver.com/index" target="_blank" rel="noopener noreferrer">스포츠</a></li>
            </ul>
          </div>
        );
      case 2:
        return (
          <div className="link-list-modal">
            <ul>
              <li><a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">유튜브</a></li>
              <li><a href="https://www.netflix.com" target="_blank" rel="noopener noreferrer">넷플릭스</a></li>
              <li><a href="https://www.coupangplay.com" target="_blank" rel="noopener noreferrer">쿠팡플레이</a></li>
            </ul>
          </div>
        );
      case 3:
        return (
          <div className="link-list-modal">
            <ul>
              <li><a href="https://weather.naver.com" target="_blank" rel="noopener noreferrer">네이버 날씨</a></li>
              <li><a href="https://www.weather.go.kr" target="_blank" rel="noopener noreferrer">기상청 날씨</a></li>
            </ul>
          </div>
        );
      case 4:
        return (
          <div className="link-list-modal">
            <ul>
              <li><a href="https://www.gmarket.co.kr" target="_blank" rel="noopener noreferrer">G마켓</a></li>
              <li><a href="https://www.11st.co.kr" target="_blank" rel="noopener noreferrer">11번가</a></li>
              <li><a href="https://www.coupang.com" target="_blank" rel="noopener noreferrer">쿠팡</a></li>
              <li><a href="https://www.oliveyoung.co.kr" target="_blank" rel="noopener noreferrer">올리브영</a></li>
            </ul>
          </div>
        );
      default:
        return <div>내용을 찾을 수 없습니다.</div>;
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${className}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-body">
          {Modallist(modalNum)}
        </div>
      </div>
    </div>
  );
}

export default Modal;