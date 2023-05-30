import React from "react";
import { Modal, Button } from "react-bootstrap";

const EarthquakeModal = ({
  showEarthquakeModal,
  closeEarthquakeModal,
  earthquakeData,
  recenterMap,
  getMyLocation,
}) => {
  useEffect(() => {
    if (earthquakeData.lat !== null && earthquakeData.lng !== null) {
      recenterMap(earthquakeData.lat, earthquakeData.lng);
    }
  }, [earthquakeData.lat, earthquakeData.lng]);

  return (
    <Modal show={showEarthquakeModal} onHide={closeEarthquakeModal}>
      <Modal.Header closeButton>
        <Modal.Title>지진이 발생했습니다.</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {earthquakeData &&
          earthquakeData.lat &&
          earthquakeData.lng &&
          earthquakeData.magnitude && (
            <>
              <p>위치: {earthquakeData.location}</p>
              <p>위도: {earthquakeData.lat}</p>
              <p>경도: {earthquakeData.lng}</p>
              <p>규모: {earthquakeData.magnitude}</p>
              <p>
                시간:{" "}
                {earthquakeData.tmEqk.substring(2, 4) +
                  "년 " +
                  parseInt(earthquakeData.tmEqk.substring(5, 7)) +
                  "월 " +
                  parseInt(earthquakeData.tmEqk.substring(8, 10)) +
                  "일 " +
                  earthquakeData.tmEqk.substring(11, 13) +
                  "시 " +
                  earthquakeData.tmEqk.substring(14, 16) +
                  "분 " +
                  earthquakeData.tmEqk.substring(17, 19) +
                  "초"}
              </p>
            </>
          )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            getMyLocation();
            closeEarthquakeModal();
          }}
        >
          내 주변 대피소 찾기
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            closeEarthquakeModal();
            recenterMap(earthquakeData.lat, earthquakeData.lng); // 버튼 클릭 시 진앙지 위치를 중심으로 지도 업데이트
          }}
        >
          진앙지 주변 대피소 찾기
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EarthquakeModal;
