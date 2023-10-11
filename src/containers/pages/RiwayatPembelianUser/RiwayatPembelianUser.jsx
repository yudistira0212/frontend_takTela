import React, { useEffect, useState } from "react";
import Protected from "../../../components/molecules/Protected";
import Navbar from "../../../components/Navbar/Navbar";
import { getDatabase, onValue, ref, remove } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { BiSolidCopyAlt } from "react-icons/bi";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "react-toastify";

const RiwayatPembelianUser = () => {
  const [dataRiwayat, setDataRiwayat] = useState([]);
  const [konfirmasi, setKonfirmasi] = useState("");
  const [filter, setFilter] = useState("");

  const database = getDatabase();

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
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

  const handleBatalPesanan = async (id, status) => {
    if (!status === 0) {
      console.log("anda telah melakukan pembayaran");
      return;
    }
    try {
      const menuRef = ref(database, `Riwayat Pesanan/${id}`);

      // Menghapus data dari database

      await remove(menuRef);
    } catch (error) {
      console.log("error", error);
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

  console.log(filter);

  return (
    <Protected>
      <div>
        <Navbar namaNav="Riwayat" />
        <div>
          <div
            className=" container pt-5   my-5 "
            style={{ maxWidth: "500px" }}
          >
            <select
              className="form-select"
              aria-label="Default select example"
              value={filter} // Menghubungkan nilai dengan state
              onChange={(e) => setFilter(e.target.value)} // Menyambungkan event handler
            >
              <option value="">Tampilkan Semua</option>
              <option value="1">Belum Konfirmasi</option>
              <option value="2">Dalam Proses</option>
              <option value="3">Sudah Diterima</option>
              {/* <option value="2">Two</option>
              <option value="3">Three</option> */}
            </select>
            {dataRiwayat.length > 0 ? (
              dataRiwayat
                .filter((item) => {
                  if (filter === "") {
                    return true;
                  } else if (filter === "1") {
                    return item.flag === 0 && item.statusPembayaran === 0;
                  } else if (filter === "2") {
                    return item.flag === 0 && item.statusPembayaran === 1;
                  } else {
                    return item.flag === 1 && item.statusPembayaran === 1;
                  }
                })
                .map((data, index) => (
                  <div
                    className="container  my-3 p-2 shadow-sm rounded-3 bg-body-tertiary"
                    style={{ maxWidth: "500px" }}
                    key={data.id}
                  >
                    <div className="d-flex">
                      <div className=" fw-bold">
                        <div>Tanggal</div>
                        <div>Jam</div>
                        <div>Kode Pembelian </div>
                      </div>
                      <div className="fw-bold mx-1">
                        <div>:</div>
                        <div>:</div>
                        <div>:</div>
                      </div>
                      <div>
                        <div>{formatTanggal(data.waktuPesan)}</div>
                        <div>{formatJam(data.waktuPesan)}</div>
                        <div>
                          {" "}
                          {data.code}{" "}
                          <CopyToClipboard
                            text={data.code}
                            onCopy={() => {
                              toast.success("Terkopi!", {
                                position: toast.POSITION.TOP_RIGHT,
                                autoClose: 2000,
                              });
                            }}
                          >
                            <button className=" btn btn-light">
                              <BiSolidCopyAlt />
                            </button>
                          </CopyToClipboard>
                        </div>
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
                    <div className="border-top ">
                      <div className="d-flex">
                        <div className="fw-bold">
                          <div> Alamat </div>
                          <div> Total </div>
                          <div> Status </div>
                        </div>
                        <div className="fw-bold mx-1">
                          <div>:</div>
                          <div>:</div>
                          <div>:</div>
                        </div>
                        <div className="">
                          <div>{data.alamat}</div>
                          <div> {formatToIDR(data.totalHarga)} </div>

                          {data.flag === 0 ? (
                            data.statusPembayaran ? (
                              <div className="text-success">Dalam Proses</div>
                            ) : (
                              <div className="text-danger">Belum Lunas</div>
                            )
                          ) : (
                            <div className="text-primary">Telah diterima</div>
                          )}
                        </div>
                      </div>

                      <div>Total Harga : {formatToIDR(data.totalHarga)} </div>
                      {data.statusPembayaran === 0 && (
                        <div className="d-flex  justify-content-between align-items-stretch   ">
                          <div>
                            <div className=" fw-bold text-danger">
                              !!Lakukan Konfirmasi Agar Pesana Diproses!!
                            </div>
                          </div>
                          <div className=" d-flex flex-column mb-3 ">
                            <button
                              className="btn btn-primary "
                              onClick={() => {
                                const openWhatsApp = () => {
                                  const message = `Halo min Saya ingin melakukan konfirmasi,\nKode pemesanan saya: ${data.code}\nEmail: ${data.email}`;
                                  const phoneNumber = "+6282248250159";
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
                            <button
                              className="btn btn-danger "
                              data-bs-toggle="modal"
                              data-bs-target={`#${data.id}`}
                            >
                              Batal
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
                                      Membatalkan Pesanan
                                    </h1>
                                    <button
                                      type="button"
                                      className="btn-close"
                                      data-bs-dismiss="modal"
                                      aria-label="Close"
                                    ></button>
                                  </div>
                                  <div className="modal-body">
                                    <div>
                                      <label
                                        class="form-check-label"
                                        for="flexSwitchCheckChecked"
                                        style={{ fontWeight: "bold" }}
                                      >
                                        Untuk membatalkn pesanan ketik
                                        "konfirmasi"
                                      </label>
                                      <input
                                        class=" form-control "
                                        type="text"
                                        placeholder='"konfirmasi"'
                                        value={konfirmasi}
                                        id={data.id}
                                        onChange={(e) => {
                                          setKonfirmasi(e.target.value);
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
                                      Batal
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-primary"
                                      data-bs-dismiss="modal"
                                      onClick={() => {
                                        if (konfirmasi === "konfirmasi") {
                                          handleBatalPesanan(
                                            data.id,
                                            data.statusPembayaran
                                          );
                                          setKonfirmasi("");
                                        }
                                      }}
                                    >
                                      Konfirmasi
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
            ) : (
              <div className="container  my-3 p-2 ">
                <div className=" fs-3 text-center">tidak ada History</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Protected>
  );
};

export default RiwayatPembelianUser;
