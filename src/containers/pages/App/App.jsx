import React from "react";
import ListMenu from "../Dashboard/listMenu/ListMenu";
import ListPemesan from "../Dashboard/listPemesan/ListPemesan";
import RiwayatPemesan from "../Dashboard/riwayatPemesan/RiwayatPemesan";
import Home from "../Home/Home";
import Login from "../Login/Login";
import Register from "../Register/Register";
import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Terimakasih from "../terimakasih/Terimakasih";
import RiwayatPembelianUser from "../RiwayatPembelianUser/RiwayatPembelianUser";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/riwayat" Component={RiwayatPembelianUser} />
        <Route path="/terimakasih/:id" Component={Terimakasih} />

        <Route path="/login" Component={Login} />
        <Route path="/register" Component={Register} />

        <Route path="/listMenu" Component={ListMenu} />
        <Route path="/listPemesan" Component={ListPemesan} />
        <Route path="/riwayatPemesan" Component={RiwayatPemesan} />
      </Routes>
    </Router>
  );
}

export default App;
