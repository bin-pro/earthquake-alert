// Shelter.jsx
import React, { useState, useEffect } from "react";

import GuDropdown from "../components/shelter/GuDropdown";
import DongDropdown from "../components/shelter/DongDropdown";
import ShelterTable from "../components/shelter/ShelterTable";

import "../styles/shelter/dropdown.css";
import "bootstrap/dist/css/bootstrap.min.css";

import { fetchShelterData } from "../utils/api";

const Shelter = () => {
  const [gu, setGu] = useState("-");
  const [dong, setDong] = useState("-");
  const [shelterData, setShelterData] = useState([]);
  const [activePage, setActivePage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchShelterData(gu, dong);
      setShelterData(data);
    };
    fetchData();
  }, [gu, dong]);

  const handlePageChange = (pageNumber) => {
    setActivePage(pageNumber);
  };

  return (
    <>
      <main className="main">
        <h1 className="main_title">지진대피소 상세 정보를 조회해 보세요.</h1>
        <div className="dropdown_wrapper">
          <GuDropdown
            gu={gu}
            setGu={setGu}
            setDong={setDong}
            handlePageChange={handlePageChange}
          />
          <DongDropdown
            gu={gu}
            dong={dong}
            setDong={setDong}
            handlePageChange={handlePageChange}
          />
        </div>
      </main>

      <ShelterTable
        shelterData={shelterData}
        activePage={activePage}
        handlePageChange={handlePageChange}
      />
    </>
  );
};

export default Shelter;
