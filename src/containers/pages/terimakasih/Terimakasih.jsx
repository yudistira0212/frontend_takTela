import React, { useEffect, useState } from "react";
import Protected from "../../../components/molecules/Protected";
import Navbar from "../../../components/Navbar/Navbar";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getDatabase, onValue, ref, remove } from "firebase/database";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import { BiSolidCopyAlt } from "react-icons/bi";

const Terimakasih = () => {
  const [dataRiwayat, setDataRiwayat] = useState([]);
  const [konfirmasi, setKonfirmasi] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();
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

  const handleBatalPesanan = async (status) => {
    if (!status === 0) {
      console.log("anda telah melakukan pembayaran");
      return;
    }
    try {
      const menuRef = ref(database, `Riwayat Pesanan/${id}`);

      // Menghapus data dari database

      await remove(menuRef);
      navigate("/");
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

  console.log({ dataRiwayat });

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
                    <div>{formatTanggal(dataRiwayat.waktuPesan)}</div>
                    <div>{formatJam(dataRiwayat.waktuPesan)}</div>
                    <div>
                      {" "}
                      {dataRiwayat.code}{" "}
                      <CopyToClipboard
                        text={dataRiwayat.code}
                        onCopy={() => {
                          toast.success("Terkopi!", {
                            position: toast.POSITION.TOP_RIGHT,
                            autoClose: 2000,
                          });
                        }}
                      >
                        <button className=" btn btn-light center">
                          <BiSolidCopyAlt />
                        </button>
                      </CopyToClipboard>
                    </div>
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
                      <div>{dataRiwayat.alamat}</div>
                      <div> {formatToIDR(dataRiwayat.totalHarga)} </div>
                      <div className="text-danger">Belum Lunas</div>
                    </div>
                  </div>

                  <div>
                    Total Harga : {formatToIDR(dataRiwayat.totalHarga)}{" "}
                  </div>
                  {dataRiwayat.statusPembayaran === 0 && (
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
                              const message = `Halo min Saya ingin melakukan konfirmasi pesanan saya,\nKode pemesanan saya: ${dataRiwayat.code}\nEmail saya: ${dataRiwayat.email}`;
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
                          className="btn btn-danger"
                          data-bs-toggle="modal"
                          data-bs-target={`#${dataRiwayat.code}`}
                        >
                          Batal
                        </button>
                        <div
                          className="modal fade"
                          id={dataRiwayat.code}
                          tabindex="-1"
                          aria-labelledby="exampleModalLabel"
                          aria-hidden="true"
                        >
                          <div className="modal-dialog">
                            <div className="modal-content">
                              <div className="modal-header">
                                <h1
                                  className="modal-title fs-5"
                                  id={`modal${dataRiwayat.code}`}
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
                                    Untuk membatalkn pesanan ketik "konfirmasi"
                                  </label>
                                  <input
                                    class=" form-control "
                                    type="text"
                                    placeholder='"konfirmasi"'
                                    value={konfirmasi}
                                    id={dataRiwayat.code}
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
                                        dataRiwayat.statusPembayaran
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
