import React, { useEffect, useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
// import "./Login.css";
import { Link } from "react-router-dom";
import NoTokenAccess from "../../../components/molecules/NoTokenAccess";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    const auth = getAuth();

    try {
      await signInWithEmailAndPassword(auth, email, password);

      toast.success("Login berhasil");
    } catch (error) {
      setError(error.message);

      // toast.error("Login gagal");
    }
  };

  return (
    <NoTokenAccess>
      <div className="container mt-5" style={{ maxWidth: "500px" }}>
        <div>
          <Link to={"/"} className="btn btn-light ">
            <AiOutlineArrowLeft /> Home
          </Link>
        </div>

        <h1 className="text-center">Login</h1>
        <form onSubmit={handleLoginSubmit}>
          <div className="mb-2">
            <label className="form-label">Email</label>
            <input
              type="email"
              placeholder="Masukkan Email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="Password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div className="text-center">
            <div className="mt-5">
              <button type="submit" className="btn btn-primary center">
                Login
              </button>
              <p>
                Belum Punya Akun? <Link to="/register">Register</Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </NoTokenAccess>
  );
};

export default Login;
