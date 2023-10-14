import React, { useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { Link } from "react-router-dom";
import NoTokenAccess from "../../../components/molecules/NoTokenAccess";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { toast } from "react-toastify";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);

  const auth = getAuth();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Password dan konfirmasi password harus sama.");
      return;
    }

    // Validasi password
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error(
        "Password harus mengandung huruf dan angka, minimal 8 karakter."
      );
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: username,
      });

      // Simpan data tambahan (username dan nomor HP) ke database
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      const userData = {
        role: user,
      };
      await set(userRef, userData);

      console.log("Registrasi berhasil:", user);
      toast.success("Registrasi berhasil");
    } catch (error) {
      setError(error.message);
      console.error("Registrasi gagal:", error);
      // toast.error("Registrasi gagal");
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
        <h1 className="text-center">Registrasi</h1>
        <form onSubmit={handleRegisterSubmit}>
          <div className="row mb-3">
            <div className="col-md-12">
              {" "}
              {/* Menggunakan col-md-12 untuk Username */}
              <div className="mb-2">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  placeholder="Masukkan Username"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-2">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Masukkan Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-2">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  placeholder="Masukan Password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-2">
                <label className="form-label">Konfirmasi Password</label>
                <input
                  type="password"
                  placeholder="Masukan Konfirmasi Password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className="text-center">
            <button type="submit" className="btn btn-primary center">
              Registrasi
            </button>

            <p>
              sudah punya akun? <Link to="/login">login</Link>
            </p>
          </div>
        </form>
      </div>
    </NoTokenAccess>
  );
};

export default Register;
