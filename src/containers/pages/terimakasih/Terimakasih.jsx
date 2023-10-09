import React, { useEffect, useState } from "react";
import Protected from "../../../components/molecules/Protected";
import Navbar from "../../../components/Navbar/Navbar";
import { Link, useParams } from "react-router-dom";
import { getDatabase, onValue, ref } from "firebase/database";

const Terimakasih = () => {
  const [dataRiwayat, setDataRiwayat] = useState([]);
  const { id } = useParams();

  const database = getDatabase();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const riwayatRef = ref(database, `Riwayat Pesanan/${id}`);

      await onValue(riwayatRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setDataRiwayat(data);
        } else {
          console.log("Data tidak ditemukan.");
        }
      });
    } catch (error) {
      console.error("Terjadi kesalahan saat mengambil data:", error);
    }
  };

  function formatTanggal(tanggal) {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(tanggal).toLocaleDateString("id-ID", options);
  }

  // Fungsi untuk memformat jam
  function formatJam(tanggal) {
    const options = { hour: "2-digit", minute: "2-digit", second: "2-digit" };
    return new Date(tanggal).toLocaleTimeString("id-ID", options);
  }

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
        <Navbar namaNav="Terimakasih" />
        <div className=" container pt-5" style={{ maxWidth: "500px" }}>
          {dataRiwayat &&
            dataRiwayat.pesanan &&
            dataRiwayat.pesanan.length > 0 && (
              <div
                className="container  my-3 p-2 shadow-sm rounded-3 bg-body-tertiary"
                style={{ maxWidth: "500px" }}
                key={dataRiwayat.id}
              >
                <div className="fw-bold fs-4">Terimakasih Sudah Memesan</div>
                <div>
                  <div className=" fw-bold ">
                    TanggalPesan : {formatTanggal(dataRiwayat.waktuPesan)}{" "}
                  </div>
                  <div className=" fw-bold ">
                    Jam : {formatJam(dataRiwayat.waktuPesan)}
                  </div>
                  <div className=" fw-bold ">
                    Kede Pembelian : {dataRiwayat.code}
                  </div>
                </div>
                <div className="border-top">
                  {dataRiwayat.pesanan.map((value) => (
                    <div key={value.id} className="my-2">
                      <div>
                        {value.nama} {value.variant}
                      </div>
                      <div className="d-flex justify-content-between  container-fluid">
                        <div>
                          {value.pesanan} X {formatToIDR(value.harga)}
                        </div>
                        <div> {formatToIDR(value.totalHargaPesanan)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-top">
                  <div className=" ">Alamat : {dataRiwayat.alamat}</div>
                  <div>
                    Status :{" "}
                    {dataRiwayat.flag ? "Dalam proses" : "Sudah di terima"}
                  </div>
                  <div>
                    Total Harga : {formatToIDR(dataRiwayat.totalHarga)}{" "}
                  </div>

                  <div className="d-flex  justify-content-between  align-items-center ">
                    <div>Lakukan konfirmasi agar pesanan di proses</div>
                    <button
                      className="btn btn-primary "
                      onClick={() => {
                        const openWhatsApp = () => {
                          const message = `Halo min Saya ingin melakukan konfirmasi,\nKode pemesanan saya: ${dataRiwayat.code}\nEmail: ${dataRiwayat.email}`;
                          const phoneNumber = "+6282239088465";
                          const whatsappURL = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
                            message
                          )}`;
                          window.open(whatsappURL, "_blank");
                        };
                        openWhatsApp();
                      }}
                    >
                      Konfirmasi
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
        <div
          className=" position-fixed bg-white border-top  container-fluid"
          style={{ bottom: "0" }}
        >
          <div
            className=" justify-content-between d-flex   container-xxl "
            style={{ maxWidth: "500px" }}
          >
            <div></div>

            <Link className="btn m-2 btn-primary" to={"/"}>
              Home
            </Link>
          </div>
        </div>
      </div>
    </Protected>
  );
};

export default Terimakasih;
