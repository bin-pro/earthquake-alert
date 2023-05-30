import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import React, { useEffect, useState } from "react";
import Shelter from "./pages/Shelter";
import Record from "./pages/Record";
import Home from "./pages/Home";
import Rule from "./pages/Rule/Rule";
import SubPage1 from "./pages/Rule/SubPage1";
import SubPage2 from "./pages/Rule/SubPage2";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import EarthquakeModal from "./components/modal/EarthquakeModal";
import firebase from "firebase/compat/app";
import "firebase/compat/messaging";
import { sendTokenToServer } from "./utils/api";

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showEarthquakeModal, setShowEarthquakeModal] = useState(false);
  const [earthquakeData, setEarthquakeData] = useState(null);

  useEffect(() => {
    const saveToken = () => {
      const urlParams = new URLSearchParams(location.search);
      const token = urlParams.get("token");

      if (token) {
        sessionStorage.setItem("token", token);
        console.log("토큰 값:", token);
        // Redirect to the Home page
        navigate("/");
      }
    };

    saveToken();
  }, [location.search]);

  useEffect(() => {
    const messaging = firebase.messaging();

    if (Notification.permission === "granted") {
      messaging
        .getToken({ vapidKey: process.env.REACT_APP_VAPID_KEY })
        .then((currentToken) => {
          if (currentToken) {
            sendTokenToServer(currentToken);
          } else {
            console.log("지진 조기경보 시 푸시 알람을 받아보실 수 없습니다.");
          }
        })
        .catch((err) => {
          console.log("An error occurred while retrieving token. ", err);
        });

      messaging.onMessage((payload) => {
        console.log("Message received. ", payload);
        const data = {
          location: payload.data.loc,
          lat: payload.data.lat,
          lng: payload.data.lon,
          magnitude: payload.data.mt,
          tmEqk: payload.data.time,
        };

        setEarthquakeData(data);
        setShowEarthquakeModal(true);
      });
    } else {
      console.log("푸시 알람 권한이 거부되었습니다.");
    }
  }, [navigate]);

  const closeEarthquakeModal = () => {
    setShowEarthquakeModal(false);
  };

  return (
    <div>
      <Routes>
        <Route path="/shelter" element={<Shelter />} />
        <Route path="/record" element={<Record />} />
        <Route path="/rule" element={<Rule />}>
          <Route path="subpage1" element={<SubPage1 />} />
          <Route path="subpage2" element={<SubPage2 />} />
        </Route>
        <Route path="/" element={<Home />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>
      {showEarthquakeModal && (
        <EarthquakeModal
          showEarthquakeModal={showEarthquakeModal}
          closeEarthquakeModal={closeEarthquakeModal}
          earthquakeData={earthquakeData}
        />
      )}
    </div>
  );
};

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}
