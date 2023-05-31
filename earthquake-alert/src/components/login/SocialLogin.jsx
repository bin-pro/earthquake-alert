import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { Button } from "react-bootstrap";
import { is } from "date-fns/locale";
import SocialLoginModal from "../modal/SocialLoginModal";
import styles from "../../styles/login/login.module.css";
import login from "../../assets/icon/login.png";

let globalUserInfo = null;

const SocialLogin = ({ isMenuOpen }) => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [clickGreeting, setClickGreeting] = useState(false);

  const isPC = useMediaQuery({
    query: "(min-width:820px)",
  });

  const isMobile = useMediaQuery({
    query: "(max-width:819px)",
  });

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token === null) {
      return;
    }
    const fetchUserInfo = async () => {
      try {
        //const response = await fetch("http://localhost:8081/api/user", {
        const response = await fetch(
          "https://server.earthquake-alert.site/api/user",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
          globalUserInfo = data;
        } else {
          sessionStorage.removeItem("token");
          setUserInfo(null);
          globalUserInfo = null;
          window.alert("로그인이 만료되었습니다.");
          window.location.reload();
        }
      } catch (error) {}
    };

    fetchUserInfo();
  }, []);

  const handleWithdrawal = () => {
    const confirmWithdrawal = window.confirm("정말 탈퇴하시겠습니까?");

    if (confirmWithdrawal) {
      //fetch("http://localhost:8081/api/user", {
      fetch("https://server.earthquake-alert.site/api/user", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            sessionStorage.removeItem("token");
            setUserInfo(null);
            globalUserInfo = null;
            window.location.reload();
          } else {
            sessionStorage.removeItem("token");
            setUserInfo(null);
            globalUserInfo = null;
            window.alert("로그인이 만료되었습니다.");
            window.location.reload();
          }
        })
        .catch((error) => {});
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    setUserInfo(null);
    globalUserInfo = null;
    window.location.reload();
  };

  useEffect(() => {
    if (isMenuOpen) setClickGreeting(false);
  }, [isMenuOpen]);

  return (
    <div className="login_box">
      {globalUserInfo || userInfo ? (
        <div>
          <div
            className={styles.nav_greeting}
            onClick={() => {
              if (!isMenuOpen) setClickGreeting((prev) => !prev);
            }}
          >
            {isMobile ? (
              <img src={login} alt="login" width="35px" className="mb-1" />
            ) : (
              `${globalUserInfo ? globalUserInfo?.name : userInfo.name}님`
            )}
          </div>
          {clickGreeting && (
            <div className={styles.modal_content}>
              <div className={styles.nav_modal_greeting}>
                {globalUserInfo?.name}님 환영합니다!
              </div>
              <div className={styles.nav_button_container}>
                <div className={styles.nav_logout} onClick={handleLogout}>
                  로그아웃
                </div>
                <div
                  className={styles.nav_withdrawal}
                  onClick={handleWithdrawal}
                >
                  회원탈퇴
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.nav_login} onClick={handleOpenModal}>
          {isMobile ? <img src={login} alt="login" width="35px" /> : "로그인"}
        </div>
      )}
      {showModal && (
        <SocialLoginModal
          showModal={showModal}
          handleCloseModal={handleCloseModal}
        />
      )}
    </div>
  );
};
export default SocialLogin;
