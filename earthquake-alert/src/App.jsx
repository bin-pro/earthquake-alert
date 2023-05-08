import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import GoogleMap from "./components/GoogleMap";
import "./styles/App.css";
import Shelter from "./pages/Shelter";
import Record from "./pages/Record";
import "./styles/shelter/dropdown.css";

const App = () => {
  return (
    <div className="root">

      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/shelter" element={<Shelter />} />
          <Route path="/record" element={<Record />} />
        </Routes>
      </BrowserRouter>
      <main>
        <div className="map_title">내 주변 대피소를 찾아보세요</div>
        <div className="map">
        <GoogleMap />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;