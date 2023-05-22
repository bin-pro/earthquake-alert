import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { sendTokenToServer } from "./utils/api";
import App from "./App";
import firebase from "firebase/app";
import "firebase/messaging";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("../public/firebase-messaging-sw.js").then(
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
const messaging = firebase.messaging();
//사용자 토큰 가져오기
messaging
  .getToken({ vapidKey: process.env.REACT_APP_VAPID_KEY })
  .then((currentToken) => {
    if (currentToken) {
      sendTokenToServer(currentToken); // 백엔드에 토큰 전송
    } else {
      // Show permission request UI
      alert("푸시 알람을 받아보실 수 없습니다.");
    }
  })
  .catch((err) => {
    console.log("An error occurred while retrieving token. ", err);
  });

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
