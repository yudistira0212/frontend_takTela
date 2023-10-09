import React, { useEffect, useState } from "react";
import Protected from "../../../components/molecules/Protected";
import Navbar from "../../../components/Navbar/Navbar";
import { NavLink, useNavigate } from "react-router-dom";
import { getDatabase, onValue, ref } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { RxHamburgerMenu } from "react-icons/rx";
const Dashboard = ({ children }) => {
  const database = getDatabase();

  const auth = getAuth();

  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData(user.uid);
      }
    });
  }, []);

  const fetchData = async (userUid) => {
    try {
      const userRef = ref(database, `users/${userUid}`);

      onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();

          if (userData.role !== "admin") {
            navigate("/");
          }
        } else {
          console.log("Data pengguna tidak ditemukan.");
        }
      });
    } catch (error) {
      console.error("Terjadi kesalahan saat mengambil data pengguna:", error);
    }
  };

  return (
    <Protected>
      <React.Fragment>
        <Navbar namaNav="Dashboard" />
        <div className="container " style={{ height: "100vh" }}>
          <div className="" style={{ paddingTop: "70px " }}>
            <button
              class="btn  btn-outline-dark"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasExample"
              aria-controls="offcanvasExample"
            >
              <RxHamburgerMenu /> more
            </button>
            <div
              class="offcanvas offcanvas-start"
              style={{ maxWidth: "300px" }}
              tabindex="-1"
              id="offcanvasExample"
              // aria-labelledby="offcanvasExampleLabel"
            >
              <div class="offcanvas-header">
                <h5 class="offcanvas-title" id="offcanvasExampleLabel">
                  Dashboard
                </h5>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="offcanvas"
                  aria-label="Close"
                ></button>
              </div>
              <div class="offcanvas-body">
                <nav className="sideBar">
                  <NavLink
                    style={{ width: "200px" }}
                    className="btn m-2 btn-outline-dark"
                    to={"/listMenu"}
                  >
                    List Menu
                  </NavLink>

                  <div>
                    <NavLink
                      style={{ width: "200px" }}
                      className="btn m-2 btn-outline-dark"
                      to={"/listPemesan"}
                    >
                      List Pemesan
                    </NavLink>
                  </div>
                  <div>
                    <NavLink
                      style={{ width: "200px" }}
                      className="btn m-2 btn-outline-dark"
                      to={"/riwayatPemesan"}
                    >
                      Riwayat Pemesan
                    </NavLink>
                  </div>
                </nav>
              </div>
            </div>
            <div>{children}</div>
          </div>
        </div>
      </React.Fragment>
    </Protected>
  );
};

export default Dashboard;
