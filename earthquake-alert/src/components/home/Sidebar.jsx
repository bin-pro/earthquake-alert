import { useEffect, useState, useRef } from "react";
import styles from "../../styles/home/sidebar.module.css";
import { fetchMapPlaceData } from "../../utils/api";
import remove from "../../assets/icon/remove-filled.svg";
import { useMediaQuery } from "react-responsive";
import { set } from "date-fns";

const Sidebar = ({
  isSidebarOpen,
  toggleSidebar,
  lat,
  lng,
  map,
  location,
  getMyLocation,
  clickedLocation,
  updateMapCenter,
}) => {
  const [isRotated, setIsRotated] = useState(false); // 새로고침버튼 회전 여부
  const [isModalOpen, setIsModalOpen] = useState(false); // 북마크 모달창 여부
  const [bookmarkName, setBookmarkName] = useState(""); // 북마크 이름
  // const [isDisplayed, setIsDisplayed] = useState(true); // 대피소 정보 표시 여부
  // const [bookmarks, setBookmarks] = useState(
  //   JSON.parse(localStorage.getItem("bookmarks")) ?? []
  // ); // Store bookmarks
  const nearbyShelterRef = useRef([]); // 주변 대피소 정보
  const [isRemoveToggle, setIsRemoveToggle] = useState(false); // 북마크 삭제버튼 클릭 여부
  const [showToast, setShowToast] = useState(false); // State variable to track toast visibility
  const [bookmarks, setBookmarks] = useState([]); // 북마크 정보
  // const [isLogin, setIsLogin] = useState(false); // 로그인 여부

  let topValue =
    70 +
    50 *
      (nearbyShelterRef.current?.length === 0
        ? 1
        : nearbyShelterRef.current?.length);

  const isPC = useMediaQuery({
    query: "(min-width:820px)",
  });

  const isMobile = useMediaQuery({
    query: "(max-width:819px)",
  });

  // const token = sessionStorage.getItem("token");

  // const checkLogin = () => {
  //   if (token === null) return;
  //   if (token) {
  //     fetch("http://localhost:8081/api/user", {
  //      fetch("https://server.earthquake-alert.site/api/user", {
  //       method: "GET",
  //       headers: {
  //         Authorization: `Bearer ${token}`
  //       }
  //     })
  //       .then((res) => {
  //         if (res.ok) {
  //           setIsLogin(true);
  //         } else {
  //           setIsLogin(false);
  //           window.alert("로그인이 만료되었습니다.");
  //           window.location.reload();
  //         }
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //       });
  //   }
  // };

  // useState(() => {
  //   checkLogin();
  // }, []);

  const getFavoritePlaces = () => {
    const token = sessionStorage.getItem("token");
    if (token === null) return;
    fetch("https://server.earthquake-alert.site/api/user/favorite", {
      //fetch("http://localhost:8081/api/user/favorite", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          // setIsLogin(false);
          sessionStorage.removeItem("token");
          window.alert("로그인이 만료되었습니다.");
          window.location.reload();
        }
      })
      .then(
        (res) => {
          setBookmarks(res.favoritePlaces);
        },
        (error) => {}
      );
  };

  useEffect(() => {
    getFavoritePlaces();
  }, []);

  // useEffect(() => {
  //   if (isLogin === false) {
  //     setBookmarks([]);
  //     return;
  //   }
  //   getFavoritePlaces();
  // }, [isLogin]);

  const postFavoritePlace = (shelterList) => {
    const token = sessionStorage.getItem("token");
    if (token === null) {
      window.alert("로그인이 필요합니다.");
      toggleSidebar();
      return;
    }
    //fetch("http://localhost:8081/api/user/favorite", {
    fetch("https://server.earthquake-alert.site/api/user/favorite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        placeName: bookmarkName,
        placeAddress: clickedLocation.address,
        placeLat: clickedLocation.lat,
        placeLng: clickedLocation.lng,
        shelterDtoList: shelterList,
      }),
    }).then(
      (res) => {
        if (res.ok) {
          getFavoritePlaces();
        } else {
          sessionStorage.removeItem("token");
          window.alert("로그인이 만료되었습니다.");
          window.location.reload();
        }
      },
      (error) => {}
    );
  };

  const deleteFavoritePlace = (placeId) => {
    const token = sessionStorage.getItem("token");
    if (token === null) {
      window.alert("로그인이 필요합니다.");
      return;
    }
    fetch(`https://server.earthquake-alert.site/api/user/favorite/${placeId}`, {
      //fetch(`http://localhost:8081/api/user/favorite/${placeId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then(
      (res) => {
        if (res.ok) {
          getFavoritePlaces();
        } else {
          sessionStorage.removeItem("token");
          window.alert("로그인이 만료되었습니다.");
          window.location.reload();
        }
      },
      (error) => {}
    );
  };

  const refresh = () => {
    setIsRotated(true);
    getMyLocation();
    setTimeout(() => {
      setIsRotated(false);
    }, 500);
  };

  // 저장한 위치의 1km 반경 이내 대피소 3개
  const handleBookmarkSave = async () => {
    if (bookmarkName !== "") {
      if (bookmarks.length >= 5) {
        setShowToast((prev) => !prev); // Display toast when the number of bookmarks exceeds 5
        return;
      }

      const filteredShelter = await fetchMapPlaceData().then((data) =>
        data.filter(
          (item) =>
            item.lat > clickedLocation.lat - 0.01 &&
            item.lat < clickedLocation.lat + 0.01 &&
            item.lng > clickedLocation.lng - 0.01 &&
            item.lng < clickedLocation.lng + 0.01
        )
      );

      // 가까운 순으로 정렬
      const sortedFilteredShelter = filteredShelter.sort((a, b) => {
        const aDistance = Math.sqrt(
          Math.pow(a.lat - clickedLocation.lat, 2) +
            Math.pow(a.lng - clickedLocation.lng, 2)
        );
        const bDistance = Math.sqrt(
          Math.pow(b.lat - clickedLocation.lat, 2) +
            Math.pow(b.lng - clickedLocation.lng, 2)
        );
        return aDistance - bDistance;
      });

      const shelterList = sortedFilteredShelter.slice(0, 3).map((item) => {
        return {
          shelterAddress: item.name,
          shelterLat: item.lat,
          shelterLng: item.lng,
        };
      });
      postFavoritePlace(shelterList);
      setIsModalOpen(false);
      setBookmarkName("");
      isMobile && toggleSidebar();
    }
  };

  // 현재위치의 1km 이내 대피소 3개
  useEffect(() => {
    const findNearestShelter = () => {
      fetchMapPlaceData().then((data) => {
        if (
          location !== "위치정보없음" ||
          location.indexOf("서울특별시") !== -1
        ) {
          const filteredShelter = data.filter((item) => {
            return (
              item.lat > lat - 0.01 &&
              item.lat < lat + 0.01 &&
              item.lng > lng - 0.01 &&
              item.lng < lng + 0.01
            );
          });

          // 가까운 순으로 정렬
          const sortedFilteredShelter = filteredShelter.sort((a, b) => {
            const aDistance = Math.sqrt(
              Math.pow(a.lat - lat, 2) + Math.pow(a.lng - lng, 2)
            );
            const bDistance = Math.sqrt(
              Math.pow(b.lat - lat, 2) + Math.pow(b.lng - lng, 2)
            );
            return aDistance - bDistance;
          });

          nearbyShelterRef.current = sortedFilteredShelter.slice(0, 3);
        }
      });
    };

    findNearestShelter();
  }, [location, lat, lng]);

  return (
    <>
      {/* 사이드바 오픈 */}
      <button
        className={`${styles.bookmark_button} ${
          isSidebarOpen ? styles.open : ""
        }`}
        onClick={() => {
          toggleSidebar();
          setIsRemoveToggle(false);
          setIsModalOpen(false);
        }}
      >
        ⭐
      </button>

      {/* Toast */}
      {showToast && (
        <div className={styles.toast}>최대 5개까지 저장할 수 있습니다.</div>
      )}

      {/* 북마크 모달 */}
      {isModalOpen && (
        <div className={styles.modal_content}>
          <input
            type="text"
            className={styles.modal_input}
            value={bookmarkName}
            onChange={(e) => setBookmarkName(e.target.value)}
            placeholder="저장할 이름을 입력하세요."
          />
          <input
            type="text"
            className={styles.modal_input}
            value={clickedLocation?.address}
            placeholder="저장할 위치를 클릭하세요."
            title="저장할 위치를 지도에서 클릭하세요."
          />
          <div className={styles.modal_button_container}>
            <button
              className={styles.modal_button}
              onClick={handleBookmarkSave}
            >
              저장
            </button>
            <button
              className={styles.modal_button}
              onClick={() => setIsModalOpen(false)}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 사이드바 */}
      <div className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ""}`}>
        <div
          className={`${styles.bookmark_refresh} ${
            isRotated ? styles.rotate : ""
          }`}
          onClick={() => refresh()}
        ></div>
        <div
          className={styles.bookmark_add}
          onClick={() => {
            setIsModalOpen((prev) => !prev);
            isMobile && toggleSidebar();
          }}
        ></div>
        <div
          className={styles.bookmark_remove}
          onClick={() => setIsRemoveToggle((prev) => !prev)}
        ></div>
        <div className={styles.my_location_container}>
          <div
            className={styles.my_location}
            // onClick={() => setIsDisplayed(!isDisplayed)}
            onClick={() => {
              updateMapCenter(lat, lng);
              isMobile && toggleSidebar();
            }}
          >
            <div className={styles.my_location_title}>현재 위치</div>
            <div className={styles.my_location_name}>{location}</div>
          </div>
          {nearbyShelterRef.current?.length !== 0 ? (
            nearbyShelterRef.current.map((item, idx) => (
              <div
                key={`${item?.name}_${idx}`}
                className={`${styles.my_location_item} ${styles.displayed}`}
                style={{ top: `${70 + 50 * idx}px` }}
                onClick={() => {
                  updateMapCenter(item.lat, item.lng);
                  isMobile && toggleSidebar();
                }}
              >
                {item.name.includes(",")
                  ? item.name.slice(0, item.name.indexOf(","))
                  : item.name}
              </div>
            ))
          ) : (
            <div
              className={`${styles.my_location_item} ${styles.displayed}`}
              style={{ top: "70px", cursor: "default" }}
            >
              주변 대피소 조회 불가
            </div>
          )}

          {bookmarks?.length > 0 &&
            bookmarks.map((bookmark, index) => {
              let additionalOffset = 0;

              if (index > 0) {
                for (let i = index - 1; i >= 0; i--) {
                  additionalOffset +=
                    50 *
                    (bookmarks[i]?.shelterDtoList?.length === 0
                      ? 1
                      : bookmarks[i]?.shelterDtoList?.length);
                }
              }

              return (
                <div key={`${bookmark.placeName}_${bookmark.placeLat}`}>
                  <div
                    className={styles.my_location}
                    style={{
                      top: `${topValue + 70 * index + additionalOffset}px`,
                    }}
                    onClick={() => {
                      updateMapCenter(
                        parseFloat(bookmark.placeLat),
                        parseFloat(bookmark.placeLng)
                      );
                      isMobile && toggleSidebar();
                    }}
                  >
                    <div className={styles.my_location_title}>
                      {bookmark.placeName}
                      {isRemoveToggle && (
                        <img
                          src={remove}
                          alt="remove"
                          width="20px"
                          height="20px"
                          className={styles.bookmark_remove_item}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFavoritePlace(bookmark.placeId);
                          }}
                        />
                      )}
                    </div>
                    <div className={styles.my_location_name}>
                      {bookmark.placeAddress}
                    </div>
                  </div>
                  {bookmark.shelterDtoList.length > 0 ? (
                    bookmark.shelterDtoList.map((item, idx) => (
                      <div
                        key={`${item.shelterAddress}_${idx}`}
                        className={`${styles.my_location_item} ${styles.displayed}`}
                        style={{
                          top: `${
                            topValue +
                            70 * index +
                            additionalOffset +
                            70 +
                            50 * idx
                          }px`,
                        }}
                        onClick={() => {
                          updateMapCenter(
                            parseFloat(item.shelterLat),
                            parseFloat(item.shelterLng)
                          );
                          isMobile && toggleSidebar();
                        }}
                      >
                        {item.shelterAddress.includes(",")
                          ? item.shelterAddress.slice(
                              0,
                              item.shelterAddress.indexOf(",")
                            )
                          : item.shelterAddress}
                      </div>
                    ))
                  ) : (
                    <div
                      className={`${styles.my_location_item} ${styles.displayed}`}
                      style={{
                        top: `${
                          topValue + 70 * index + additionalOffset + 70
                        }px`,
                        cursor: "default",
                      }}
                    >
                      주변 대피소 조회 불가
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
