import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { sendTokenToServer } from "./utils/api";
import App from "./App";
import firebase from "firebase/compat/app";
import "firebase/compat/messaging";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/firebase-messaging-sw.js").then(
      function (registration) {
        console.log("서비스 워커 등록 성공: ", registration.scope);
      },
      function (err) {
        console.log("서비스 워커 등록 실패: ", err);
      }
    );
  });
}

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "earthquake-alert-fcm.firebaseapp.com",
  projectId: "earthquake-alert-fcm",
  storageBucket: "earthquake-alert-fcm.appspot.com",
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
};

firebase.initializeApp(firebaseConfig);
/*
const messaging = firebase.messaging();
//사용자 토큰 가져오기
if (Notification.permission === "granted") {
  // 사용자가 알림을 허용한 경우에만 토큰을 가져옵니다.
  messaging
    .getToken({ vapidKey: process.env.REACT_APP_VAPID_KEY })
    .then((currentToken) => {
      if (currentToken) {
        sendTokenToServer(currentToken); // 백엔드에 토큰 전송
      } else {
        alert("지진 조기경보 시 푸시 알람을 받아보실 수 없습니다.");
      }
    })
    .catch((err) => {
      console.log("An error occurred while retrieving token. ", err);
    });
} else {
  console.log("푸시 알람 권한이 거부되었습니다.");
}

messaging.onMessage((payload) => {
  console.log("Message received. ", payload);

  // 알림 권한 확인
  if (!("Notification" in window)) {
    console.log("This browser does not support system notifications.");
  } else if (Notification.permission === "granted") {
    // 알림 내용 설정
    const notificationTitle = payload.data.title;
    const notificationOptions = {
      body: payload.data.body,
      icon: "/logo192.png",
    };

    // Service Worker를 가져와 알림 표시
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.showNotification(notificationTitle, notificationOptions);
      })
      .catch((err) => {
        console.error("Service Worker failed to show notification: ", err);
      });
  }
});
*/
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
