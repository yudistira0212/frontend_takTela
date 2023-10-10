import React, { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar/Navbar";
import { getDatabase, ref, onValue } from "firebase/database";
import { Link } from "react-router-dom";
import CheckOut from "../checkout/CheckoOut";

const Home = () => {
  const [dataMenu, setDataMenu] = useState([]);
  const [banyakPesan, setBanyakPesan] = useState([]);
  const [totalPesana, setTotalPesanan] = useState(0);
  const [checkOut, setCheckOut] = useState(false);

  const database = getDatabase();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const menuRef = ref(database, "data menu");

        onValue(menuRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const dataArray = Object.entries(data).map(([id, value]) => ({
              id,
              ...value,
              pesanan: 0,
            }));
            setDataMenu(dataArray);
            setBanyakPesan(Array(dataArray.length).fill({ pesanan: 0 }));
          } else {
            console.log("Data tidak ditemukan.");
          }
        });
      } catch (error) {
        console.error("Terjadi kesalahan saat mengambil data:", error);
      }
    };

    fetchData();
  }, [database]);

  useEffect(() => {
    // Menghitung total pesanan dari seluruh item
    let totalPesan = 0;

    banyakPesan.forEach((item) => {
      totalPesan += item.pesanan * item.harga;
    });

    setTotalPesanan(totalPesan);
  }, [banyakPesan]);

  console.log({ banyakPesan });
  console.log("total ", totalPesana);

  function formatToIDR(number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  }

  console.log({ banyakPesan });

  return (
    <div>
      {!checkOut ? (
        <div>
          <Navbar namaNav="Home" />

          <div className="container pt-5 pb-5 " style={{ maxWidth: "500px" }}>
            {dataMenu.length !== 0 &&
              dataMenu.map((data, index) => (
                <div
                  key={data.id}
                  className="d-flex my-3   align-items-center bg-body-tertiary container shadow-sm rounded-3 p-2"
                >
                  <img
                    src={data.imageUrl}
                    alt="gambar product"
                    width={100}
                    height={100}
                    style={{ objectFit: "cover" }}
                    className="rounded-3"
                  />
                  <div className="ms-3">
                    <div className="d-flex">
                      <div className=" fw-bold">
                        <div>Stok </div>
                        <div>Nama </div>
                        <div>Variant </div>
                        <div>Harga </div>
                      </div>
                      <div className="mx-1  fw-bold">
                        <div> : </div>
                        <div> : </div>
                        <div> : </div>
                        <div> : </div>
                      </div>
                      <div>
                        <div>{data.stok}</div>
                        <div>{data.nama}</div>
                        <div>{data.variant}</div>
                        <div>{formatToIDR(data.harga)}</div>
                      </div>
                    </div>
                    {/* <div>Stok : {data.stok}</div>
                  <div>{data.nama}</div>
                  <div>{data.variant}</div>
                  <div>{formatToIDR(data.harga)}</div> */}
                  </div>
                  <div className="ms-auto d-flex flex-column">
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ width: "40px" }}
                      onClick={() => {
                        const newDataMenu = [...dataMenu];
                        if (data.stok > banyakPesan[index].pesanan) {
                          newDataMenu[index].pesanan++;
                          setBanyakPesan(newDataMenu);
                        }
                      }}
                      disabled={data.stok <= banyakPesan[index].pesanan}
                    >
                      +
                    </button>
                    <input
                      value={banyakPesan[index].pesanan}
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value, 10) || 0;
                        if (newValue >= 0 && newValue <= data.stok) {
                          const newDataMenu = [...dataMenu];
                          newDataMenu[index].pesanan = newValue;
                          setBanyakPesan(newDataMenu);
                        }
                      }}
                      type="number"
                      style={{ width: "40px" }}
                      className="text-center"
                    />
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ width: "40px" }}
                      onClick={() => {
                        if (banyakPesan[index].pesanan > 0) {
                          const newDataMenu = [...dataMenu];
                          newDataMenu[index].pesanan--;
                          setBanyakPesan(newDataMenu);
                        }
                      }}
                      disabled={banyakPesan[index].pesanan <= 0}
                    >
                      -
                    </button>
                  </div>
                </div>
              ))}
          </div>
          <div
            className=" position-fixed bg-white border-top  container-fluid"
            style={{ bottom: "0" }}
          >
            <div
              className=" justify-content-between d-flex   container-xxl"
              style={{ maxWidth: "500px" }}
            >
              <div className=" fw-bold">
                <div>Total Harga Belanja :</div>
                <div>{totalPesana ? formatToIDR(totalPesana) : "Rp 0"}</div>
              </div>

              <button
                className="btn m-2 btn-primary"
                disabled={totalPesana <= 0 || isNaN(totalPesana)}
                onClick={() => {
                  setCheckOut(true);
                }}
              >
                Pesan
              </button>
            </div>
          </div>
        </div>
      ) : (
        <CheckOut
          dataCheckOut={banyakPesan}
          totalPesana={totalPesana}
          buttonKembail={setCheckOut}
        />
      )}
    </div>
  );
};

export default Home;
