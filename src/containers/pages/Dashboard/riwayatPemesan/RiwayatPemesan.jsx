import React, { useEffect, useState } from "react";
import Dashboard from "../Dashboard";
import { getDatabase, onValue, ref, set } from "firebase/database";

const RiwayatPemesan = () => {
  const [dataRiwayat, setDataRiwayat] = useState([]);
  const [konfir, setKonfir] = useState("");
  const [statusPembayaran, setStatusPembayaran] = useState(false);
  const [sudahSampai, setSudahSampai] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  const database = getDatabase();

  const handleConfirm = (id, status) => {
    let updatedStatusPembayaran = 0;
    let updateSampai = 0;

    const bayarRef = ref(database, `Riwayat Pesanan/${id}/statusPembayaran`);
    const flagRef = ref(database, `Riwayat Pesanan/${id}/flag`);

    try {
      if (statusPembayaran) {
        updatedStatusPembayaran = status === 0 ? 1 : 0;
        set(bayarRef, updatedStatusPembayaran)
          .then(() => {
            console.log("Status pembayaran diperbarui.");
          })
          .catch((error) => {
            console.error("Gagal memperbarui status pembayaran:", error);
          });
      }
      if (sudahSampai) {
        updateSampai = 1;
        set(flagRef, updateSampai)
          .then(() => {
            console.log("Status pembayaran diperbarui.");
          })
          .catch((error) => {
            console.error("Gagal memperbarui status pembayaran:", error);
          });
      }
    } catch (error) {
      console.error("Terjadi kesalahan saat mengambil data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const riwayatRef = ref(database, `Riwayat Pesanan`);

      onValue(riwayatRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const filteredData = Object.entries(data)
            .filter(([id, value]) => value.flag === 1) // Filter hanya data dengan flag === 0
            .map(([id, value]) => ({
              id,
              ...value,
            }));

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
    <Dashboard>
      <div>
        <div className="my-3 ">
          <input
            type="text"
            className="form-control"
            placeholder="Cari..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>

        <table className="table">
          <thead>
            <tr>
              <th scope="col">No</th>
              <th scope="col">Email</th>
              <th scope="col">Waktu</th>
              <th scope="col">KodePembeli</th>
              <th scope="col">Alamat</th>
              <th scope="col">Telpon</th>
              <th scope="col">Total Harga</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {dataRiwayat
              .filter((data) => {
                // Filter data berdasarkan kata kunci pencarian
                const lowerCaseKeyword = searchKeyword.toLowerCase();
                return (
                  data.email.toLowerCase().includes(lowerCaseKeyword) ||
                  formatTanggal(data.waktuPesan)
                    .toLowerCase()
                    .includes(lowerCaseKeyword) ||
                  formatJam(data.waktuPesan)
                    .toLowerCase()
                    .includes(lowerCaseKeyword) ||
                  data.code.toLowerCase().includes(lowerCaseKeyword) ||
                  data.alamat.toLowerCase().includes(lowerCaseKeyword) ||
                  data.noHp.toLowerCase().includes(lowerCaseKeyword)
                );
              })
              .map((data, i) => (
                <tr key={data.id}>
                  <th scope="row"> {i + 1} </th>
                  <th> {data.email} </th>
                  <td>
                    {" "}
                    {formatTanggal(data.waktuPesan)}{" "}
                    {formatJam(data.waktuPesan)}{" "}
                  </td>
                  <td>{data.code}</td>
                  <td>{data.alamat}</td>
                  <td>{data.noHp}</td>
                  <td>{formatToIDR(data.totalHarga)}</td>
                  <td className={data.statusPembayaran === 2 && "bg-success"}>
                    {data.statusPembayaran === 2 && "Lunas"}
                  </td>
                  <td></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Dashboard>
  );
};

export default RiwayatPemesan;
