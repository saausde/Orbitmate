import React, { useState } from "react";
import "../css/AboutUs.css";
import BackgroundParticles from "./TitleSection/BackgroundParticles";
//-----------------사진 임포트-----------------
import String from "../images/string1.png";
import person1 from "../images/person1.png";
import wooPhoto from "../images/wooPhoto.png";
import jayPhoto from "../images/JayPhoto.png";
import email_icon from "../images/contact_email_icon1.png";
import location_icon from "../images/contact_location_icon1.png";
import phone_icon from "../images/contact_phone_icon1.png";
import barcode from "../images/barcode1.png";
//--------------------------------------------
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
function AboutUs() {
  const [showContactDetail, setshowContactDetail] = useState(false);
  const [SelectedDevInfo, setSelectedDevInfo] = useState("");
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const handlercontact = (devInfo) => {
    setSelectedDevInfo(devInfo);
    setshowContactDetail(true);
  };

  const close = () => {
    setshowContactDetail(false);
  };

  const goToMain = () => {
    navigate("/");
  };
  return (
    <div id="main_creators">
      <BackgroundParticles color="#ffffff" />
      <div className="header">
        <button onClick={goToMain} className="closeAll">
          x
        </button>
        <h1>{t("about_us.title")}</h1>
        <p>{t("about_us.description")}</p>
      </div>
      <div id="creatorsCard_f">
        <div className="card_wrap jay">
          <div className="card_inner">
            <div className="card_front">
              {/* 이미지 레이어 */}
              <div className="photoLayer"></div>

              <div className="card_front_label"></div>
              <h2 className="orbitmate_strong">OrbitMate</h2>
              <p className="devName">{t("about_each.jayname")}</p>
              <p className="workposition">{t("about_us.position")}</p>
              <img className="barcode" src={barcode} />
            </div>

            <div className="card_back">
              <div className="namebox">{t("about_each.jayname")}</div>
              <div className="My_role">{t("about_each.jayRole")}</div>
              <button
                className="contact_btn"
                onClick={() =>
                  handlercontact({
                    Dev_Name: "나재훈",
                    Dev_Email: "noahop.9no.8@gamil.com",
                    Dev_Phone: "010-2442-5863",
                    Dev_Location: "경기도 화성시 동탄대로999",
                  })
                }
              >
                Contact
              </button>
            </div>
          </div>
        </div>

        <div className="card_wrap woo">
          <div className="card_inner">
            <div className="card_front">
              {/* 이미지 레이어 */}
              <div className="photoLayer"></div>
              <div className="card_front_label"></div>
              <h2>OrbitMate</h2>
              {/* <img className="IDPhoto" src={wooPhoto} /> */}{" "}
              {/* 필요시 주석 해제 */}
              <p className="devName">{t("about_each.wooname")}</p>
              <p className="workposition">{t("about_us.position")}</p>
              <img className="barcode" src={barcode} />
            </div>
            <div className="card_back">
              <div className="namebox">{t("about_each.wooname")}</div>
              <div className="My_role">{t("about_each.wooRole")}</div>
              <button
                className="contact_btn"
                onClick={() =>
                  handlercontact({
                    Dev_Name: "신우철",
                    Dev_Email: "dudfkr44@naver.com",
                    Dev_Phone: "010-8869-9649",
                    Dev_Location: "경기도 고양시 토당로 93",
                  })
                }
              >
                Contact
              </button>
            </div>
          </div>
        </div>

        <div className="card_wrap un">
          <div className="card_inner">
            <div className="card_front">
              {/* 이미지 레이어 */}
              <div className="photoLayer"></div>
              <div className="card_front_label"></div>
              <h2>OrbitMate</h2>
              {/*<img className="IDPhoto" src={person1} />*/}
              <p className="devName">이은석</p>
              <p className="workposition">{t("about_us.position")}</p>

              <img className="barcode" src={barcode} />
            </div>
            <div className="card_back">
              <div className="namebox">EunSeok Lee</div>
              <div className="My_role">
                {/*프로젝트 역할내용*/}
                전반적인 기능구현{/*나중에 자세히쓸게요*/}
              </div>
              <button
                className="contact_btn"
                onClick={() => {
                  handlercontact({
                    Dev_Name: "이은석",
                    Dev_Email: "527esl@gamil.com",
                    Dev_Phone: "010-9669-4682",
                    Dev_Location: "서울특별시 은평구 은평로 11길 15",
                  });
                }}
              >
                Contact
              </button>
            </div>
          </div>
        </div>
        <div className="card_wrap hong">
          <div className="card_inner">
            <div className="card_front">
              {/* 이미지 레이어 */}
              <div className="photoLayer"></div>
              <div className="card_front_label"></div>
              <h2>OrbitMate</h2>
              {/*<img className="IDPhoto" src={person1} />*/}
              <p className="devName">{t("about_each.simname")}</p>
              <p className="workposition">{t("about_us.position")}</p>

              <img className="barcode" src={barcode} />
            </div>
            <div className="card_back">
              <div className="namebox">{t("about_each.simname")}</div>
              <div className="My_role">
                {/*프로젝트 역할내용*/}
                {t("about_each.simRole")}
              </div>
              <button
                className="contact_btn"
                onClick={() => {
                  handlercontact({
                    Dev_Name: "심홍익",
                    Dev_Email: "shongig@gamil.com",
                    Dev_Phone: "010-2344-2617",
                    Dev_Location: "경기도 부천시 역곡동",
                  });
                }}
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </div>
      {showContactDetail ? (
        <div id="contact_detail_f">
          <div className="left_f_contact">
            <a>{t("about_us.ContactUs")}</a>
            <p>{SelectedDevInfo.Dev_Name} 연락처</p>
            <a>{t("about_us.ContactUs2")}</a>
          </div>
          <div className="right_f_contact">
            <div className="contactDetail_box">
              <p className="category_title">Email Support</p>
              <p>{SelectedDevInfo.Dev_Email}</p>
            </div>
            <hr />
            <div className="contactDetail_box">
              <p className="category_title">Phone Number</p>
              <p>{SelectedDevInfo.Dev_Phone}</p>
            </div>
            <hr />
            <div className="contactDetail_box">
              <p className="category_title">Location</p>
              <p>{SelectedDevInfo.Dev_Location}</p>
            </div>
            <hr />
            <div className="icon_imgs_f">
              <img className="email_icon" src={email_icon} />
              <img className="phone_icon" src={phone_icon} />
              <img className="location_icon" src={location_icon} />
            </div>
            <button onClick={close} className="close_contact_detail">
              X
            </button>
          </div>
        </div>
      ) : (
        ""
      )}
      <div className="footer">
        <div className="worktime_f">
          <h1>{t("about_us.worktime")}</h1>
          <p>50{t("about_us.days")}</p>
        </div>
        <hr className="footerHr" />
        <div className="numberOfMember_f">
          <h1>{t("about_us.numberOfdevs")}</h1>
          <p>4</p>
        </div>
        <hr className="footerHr" />
        <div className="supported_by_f">
          <h1>{t("about_us.AI_Model")}</h1>
          <p>Google Gemini 2.5 flash</p>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
