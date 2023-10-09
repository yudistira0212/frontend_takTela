import React, { useEffect, useState } from "react";
import Protected from "../../../components/molecules/Protected";
import Navbar from "../../../components/Navbar/Navbar";
import { getDatabase, onValue, ref } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const RiwayatPembelianUser = () => {
  const [dataRiwayat, setDataRiwayat] = useState([]);
  const [email, setEmail] = useState([]);

  const database = getDatabase();

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email);
        fetchData(user.email);
      }
    });
  }, []);

  const fetchData = async (email) => {
    try {
      const riwayatRef = ref(database, `Riwayat Pesanan`);

      onValue(riwayatRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();

          // Mengubah objek menjadi array
          const dataArray = Object.entries(data).map(([id, value]) => ({
            id,
            ...value,
          }));

          // Mengurutkan data berdasarkan waktu pesan terbaru
          dataArray.sort((a, b) => {
            const timeA = new Date(a.waktuPesan).getTime();
            const timeB = new Date(b.waktuPesan).getTime();
            return timeB - timeA;
          });

          // Mengurutkan data dengan status pembayaran 0 ke atas
          dataArray.sort((a, b) => {
            return a.statusPembayaran - b.statusPembayaran;
          });

          // Filter hanya data dengan email yang sesuai
          const filteredData = dataArray.filter((item) => item.email === email);

          setDataRiwayat(filteredData);
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
        <Navbar namaNav="Riwayat" />
        <div>
          <div className=" container pt-5" style={{ maxWidth: "500px" }}>
            {dataRiwayat.length > 0 ? (
              dataRiwayat.map((data, index) => (
                <div
                  className="container  my-3 p-2 shadow-sm rounded-3 bg-body-tertiary"
                  style={{ maxWidth: "500px" }}
                  key={data.id}
                >
                  <div>
                    <div className=" fw-bold ">
                      TanggalPesan : {formatTanggal(data.waktuPesan)}{" "}
                    </div>
                    <div className=" fw-bold ">
                      Jam : {formatJam(data.waktuPesan)}
                    </div>
                    <div className=" fw-bold ">
                      Kede Pembelian : {data.code}
                    </div>
                  </div>
                  <div className="border-top">
                    {data.pesanan.map((value) => (
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
                    <div className=" ">Alamat : {data.alamat}</div>
                    <div>
                      Status :{" "}
                      {data.statusPembayaran ? "Dalam proses" : "Belum Lunas"}
                    </div>
                    <div>Total Harga : {formatToIDR(data.totalHarga)} </div>
                    {data.statusPembayaran === 0 && (
                      <div className="d-flex  justify-content-between  align-items-center ">
                        <div>Lakukan konfirmasi agar pesanan di proses</div>
                        <button
                          className="btn btn-primary "
                          onClick={() => {
                            const openWhatsApp = () => {
                              const message = `Halo min Saya ingin melakukan konfirmasi,\nKode pemesanan saya: ${data.code}\nEmail: ${data.email}`;
                              const phoneNumber = "+622239088465";
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
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>Tidak ada riwayat pembelian yang ditemukan.</p>
            )}
          </div>
        </div>
      </div>
    </Protected>
  );
};

export default RiwayatPembelianUser;
