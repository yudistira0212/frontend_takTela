import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import "./Navbar.css";
import { getDatabase, onValue, ref } from "firebase/database";
import { TbLogout } from "react-icons//tb";

const Navbar = (porps) => {
  const [admin, setAdmin] = useState();
  const [email, setEmail] = useState();
  const [userName, setUserName] = useState();

  const database = getDatabase();

  const auth = getAuth();
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();

  const logOut = () => {
    signOut(auth)
      .then(() => {
        setIsLogin(false);

        navigate("/");
      })
      .catch((error) => {
        // An error happened.
      });
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLogin(true);
        setEmail(user.email);
        setUserName(user.displayName);
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

          setAdmin(userData.role);
        } else {
        }
      });
    } catch (error) {
      console.error("Terjadi kesalahan saat mengambil data pengguna:", error);
    }
  };

  return (
    <nav
      className="navbar navbar-expand-lg bg-white position-fixed  shadow-sm"
      style={{ top: 0, zIndex: 1, width: "100%" }}
    >
      <div className="container">
        <NavLink className="navbar-brand">{porps.namaNav}</NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link btn mx-2 btn-light" to="/" exact>
                Menu
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className="nav-link btn mx-2 btn-light"
                to="/riwayat"
                exact
              >
                Riwayat
              </NavLink>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link  btn mx-2 btn-light"
                onClick={() => {
                  const openWhatsApp = () => {
                    const message = `Halo min Saya ${userName} ingin bertanya terkait produk anda,`;
                    const phoneNumber = "+6282248250159";
                    const whatsappURL = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
                      message
                    )}`;
                    window.open(whatsappURL, "_blank");
                  };
                  openWhatsApp();
                }}
                exact
              >
                Contact admin
              </Link>
            </li>
            {admin === "admin" && (
              <li className="nav-item">
                <NavLink
                  className="nav-link btn mx-2 btn-light"
                  to="/listMenu"
                  exact
                >
                  Dashboard
                </NavLink>
              </li>
            )}
          </ul>
          <div className=" d-flex justify-content-center  align-items-center gap-3 ">
            <div>{userName}</div>
            {isLogin ? (
              <button className="btn btn-light" onClick={logOut}>
                Log Out <TbLogout />
              </button>
            ) : (
              <NavLink to="/login" className="btn btn-light">
                Login
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
