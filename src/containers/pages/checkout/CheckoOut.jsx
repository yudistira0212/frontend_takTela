import React, { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar/Navbar";
import {
  get,
  getDatabase,
  onValue,
  push,
  ref,
  update,
} from "firebase/database";
import Protected from "../../../components/molecules/Protected";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineArrowLeft } from "react-icons/ai";

const CheckOut = (props) => {
  const [dataUser, setDataUser] = useState([]);
  const [alamat, setAlamat] = useState("");
  const [noHp, setNoHp] = useState("");
  const [dataCheck, setDataCheck] = useState([]);

  const Navigate = useNavigate();

  const dataCheckOut = props.dataCheckOut;

  const database = getDatabase();

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setDataUser({
          username: user.displayName,
          email: user.email,
        });
      }
    });
  }, []);

  useEffect(() => {
    const newDataPesan = dataCheckOut
      .map((item, index) => {
        if (item.pesanan !== 0) {
          const pesanan = item.pesanan;
          const harga = item.harga;
          const totalHargaPesanan = pesanan * harga;

          return {
            ...item,
            totalHargaPesanan: totalHargaPesanan,
          };
        } else {
          return null;
        }
      })
      .filter((item) => item !== null);

    setDataCheck(newDataPesan);
  }, []);

  const generateRandomCode = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }
    return code;
  };

  const randomCode = generateRandomCode();

  const handleCheckOut = async () => {
    try {
      if (!dataCheck) {
        console.error("Data Checkout tidak boleh kosong.");
        return;
      }
      if (noHp.length !== 12) {
        console.error("nomor HP tidak boleh kosong");
        return;
      }
      if (!alamat) {
        console.error("Alamat tidak boleh kosong.");
        return;
      }

      // Hitung total harga pesanan
      const totalHarga = dataCheck.reduce((total, item) => {
        return total + item.totalHargaPesanan;
      }, 0);

      // Cek apakah stok mencukupi
      const stokCukup = await cekStokCukup(dataCheck);

      if (!stokCukup) {
        console.error("Stok tidak mencukupi untuk pesanan ini.");
        return;
      }

      // Kurangi stok menu
      await kurangiStokMenu(dataCheck);

      // Transaksi berhasil, tambahkan riwayat pesanan ke database
      const waktuSaatIni = new Date();
      const formatWaktu = waktuSaatIni.toISOString();
      const riwayatRef = ref(database, `Riwayat Pesanan`);
      const dataInput = {
        pesanan: dataCheck,
        flag: 0,
        statusPembayaran: 0,
        alamat: alamat,
        totalHarga: totalHarga,
        waktuPesan: formatWaktu,
        noHp: noHp,
        email: dataUser.email,
        code: randomCode,
      };

      const newRiwayatRef = await push(riwayatRef, dataInput); // Ganti 'push' ke 'newRiwayatRef'

      const id = newRiwayatRef.key;

      Navigate(`/terimakasih/${id}`);
    } catch (error) {
      console.error("Terjadi kesalahan saat menambahkan data:", error);
    }
  };

  const cekStokCukup = async (pesanan) => {
    try {
      // Ambil data menu dari database
      const menuRef = ref(database, "data menu");
      const snapshot = await get(menuRef);

      if (snapshot.exists()) {
        const dataMenu = snapshot.val();

        // Periksa stok untuk setiap item yang dipesan
        for (const item of pesanan) {
          const menuId = item.id;
          const stokMenu = dataMenu[menuId].stok;

          if (item.pesanan > stokMenu) {
            return false; // Stok tidak mencukupi
          }
        }

        return true; // Stok mencukupi
      }
    } catch (error) {
      console.error("Terjadi kesalahan saat memeriksa stok:", error);
    }
  };

  // Fungsi untuk mengurangi stok menu
  const kurangiStokMenu = async (pesanan) => {
    try {
      const updates = {}; // Objek yang akan berisi pembaruan stok

      for (const item of pesanan) {
        const stokKurang = parseInt(item.stok) - item.pesanan;
        const menuId = item.id;

        // Menambahkan pembaruan stok ke objek updates
        updates[`data menu/${menuId}/stok`] = stokKurang;
      }

      // Melakukan pembaruan stok ke Firebase
      await update(ref(database), updates);
    } catch (error) {
      console.error("Terjadi kesalahan saat mengurangi stok menu:", error);
    }
  };

  function formatToIDR(number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  }

  return (
    <Protected>
      <div>
        <Navbar namaNav="CheckOut" />

        <div className="container pt-5 pb-5 ">
          <div
            className="container mt-3 p-2 shadow-sm rounded-3 bg-body-tertiary"
            style={{ maxWidth: "500px" }}
          >
            <div>
              <Link
                onClick={() => props.buttonKembail()}
                className="btn btn-light "
              >
                <AiOutlineArrowLeft /> Home
              </Link>
            </div>
            <div>
              <div className=" fw-bold ">Nama : {dataUser.username}</div>
              <div className=" fw-bold ">Email : {dataUser.email}</div>
            </div>
            <div className="border-top">
              {dataCheck.map((data) => (
                <div key={data.id} className="my-2">
                  <div>
                    {data.nama} {data.variant}
                  </div>
                  <div className="d-flex justify-content-between  container-fluid">
                    <div>
                      {data.pesanan} X {formatToIDR(data.harga)}
                    </div>
                    <div> {formatToIDR(data.totalHargaPesanan)}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-top">
              <div>
                <label className=" form-label ">No Hp</label>
                <input
                  className={`form-control ${
                    noHp.length !== 12 && "is-invalid"
                  }`}
                  aria-label="With textarea"
                  type="number"
                  value={noHp}
                  onChange={(e) => {
                    setNoHp(e.target.value);
                    if (noHp.length <= 12) {
                    }
                  }}
                />
              </div>
              <div>
                <label className=" form-label ">Alamat Anda</label>
                <textarea
                  className={`form-control ${
                    alamat.length === 0 && "is-invalid"
                  }`}
                  aria-label="With textarea"
                  type="text"
                  value={alamat}
                  onChange={(e) => {
                    setAlamat(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div
          className=" position-fixed bg-white border-top  container-fluid"
          style={{ bottom: "0" }}
        >
          <div
            className=" justify-content-between d-flex   container-xxl "
            style={{ maxWidth: "500px" }}
          >
            <div>
              <div>Total Harga Belanja :</div>
              <div>{formatToIDR(props.totalPesana)}</div>
            </div>

            <button className="btn m-2 btn-primary" onClick={handleCheckOut}>
              CheckOut
            </button>
          </div>
        </div>
      </div>
    </Protected>
  );
};

export default CheckOut;
