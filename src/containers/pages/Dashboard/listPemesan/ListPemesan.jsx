import React, { useEffect, useState } from "react";
import Dashboard from "../Dashboard";
import { getDatabase, onValue, ref, set } from "firebase/database";

const ListPemesan = () => {
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

    if (statusPembayaran === true || sudahSampai === true) {
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
            .filter(([id, value]) => value.flag === 0) // Filter hanya data dengan flag === 0
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
              <th scope="col">Action</th>
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
                  <td
                    className={
                      data.statusPembayaran ? "bg-success" : "bg-danger"
                    }
                  >
                    {data.statusPembayaran ? "Lunas" : "Belum Lunas"}
                  </td>
                  <td>
                    <div>
                      <button
                        type="button"
                        class="btn btn-info"
                        data-bs-toggle="modal"
                        data-bs-target={`#${data.id}`}
                      >
                        edit
                      </button>
                      <div
                        className="modal fade"
                        id={data.id}
                        tabindex="-1"
                        aria-labelledby="exampleModalLabel"
                        aria-hidden="true"
                      >
                        <div className="modal-dialog">
                          <div className="modal-content">
                            <div className="modal-header">
                              <h1
                                className="modal-title fs-5"
                                id={`modal${data.id}`}
                              >
                                Edit Riwayat
                              </h1>
                              <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                              ></button>
                            </div>
                            <div className="modal-body">
                              <div class="form-check">
                                <input
                                  class="form-check-input"
                                  type="checkbox"
                                  checked={statusPembayaran}
                                  disabled={sudahSampai === true}
                                  onChange={(e) => {
                                    setStatusPembayaran(e.target.checked);
                                  }}
                                  id={`pembayaran${data.id}`}
                                />
                                <label
                                  class="form-check-label"
                                  for={`pembayaran${data.id}`}
                                >
                                  Mengubah Status Pembayaran "
                                  {data.statusPembayaran
                                    ? "Belum Lunas"
                                    : "Lunas"}
                                  "
                                </label>
                              </div>
                              <div class="form-check">
                                <input
                                  class="form-check-input"
                                  type="checkbox"
                                  checked={sudahSampai}
                                  onChange={(e) => {
                                    setSudahSampai(e.target.checked);
                                    setStatusPembayaran(e.target.checked);
                                  }}
                                  id={`sudahsampai${data.id}`}
                                />
                                <label
                                  class="form-check-label"
                                  for={`sudahsampai${data.id}`}
                                >
                                  Pesanan Sudah Sampai
                                </label>
                              </div>
                              <div>
                                <label
                                  class="form-check-label"
                                  for="flexSwitchCheckChecked"
                                  style={{ fontWeight: "bold" }}
                                >
                                  Ketik "konfirmasi"
                                </label>
                                <input
                                  class=" form-control "
                                  type="text"
                                  placeholder='"konfirmasi"'
                                  value={konfir}
                                  id={data.id}
                                  onChange={(e) => {
                                    setKonfir(e.target.value);
                                  }}
                                />
                              </div>
                            </div>
                            <div className="modal-footer">
                              <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                              >
                                Close
                              </button>
                              <button
                                type="button"
                                className="btn btn-primary"
                                data-bs-dismiss="modal"
                                onClick={() => {
                                  if (konfir === "konfirmasi") {
                                    handleConfirm(
                                      data.id,
                                      data.statusPembayaran
                                    );
                                    setKonfir("");
                                    setStatusPembayaran(false);
                                    setSudahSampai(false);
                                  }
                                }}
                              >
                                Save changes
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Dashboard>
  );
};

export default ListPemesan;
