import React, { useEffect, useState } from "react";
import Dashboard from "../Dashboard";
import {
  getDatabase,
  ref,
  push,
  update,
  onValue,
  remove,
} from "firebase/database";

import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { v4 as uuidv4 } from "uuid";

const ListMenu = () => {
  const [namaProduct, setNamaProduct] = useState("");
  const [hargaProduct, setHargaProduct] = useState(0);
  const [stokProduct, setStokProduct] = useState(0);
  const [variantProduct, setVariantProduct] = useState("");
  const [id, setId] = useState("");
  const [dataMenu, setDataMenu] = useState([]);
  const [show, setShow] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const database = getDatabase();
  const storage = getStorage();

  const clearInput = () => {
    setNamaProduct("");
    setHargaProduct(0);
    setStokProduct(0);
    setVariantProduct("");
    setShow(false);
    setSelectedImage(null);
  };

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
            }));
            setDataMenu(dataArray);
          } else {
            console.log("Data tidak ditemukan.");
          }
        });
      } catch (error) {
        console.error("Terjadi kesalahan saat mengambil data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!selectedImage) {
        console.error("Anda harus memilih gambar terlebih dahulu.");
        return;
      }

      const imageFileName = `${uuidv4()}_${selectedImage.name}`;

      const storRef = storageRef(storage, `images/${imageFileName}`);
      await uploadBytes(storRef, selectedImage).then((dataImg) => {});

      const downloadURL = await getDownloadURL(storRef);

      const menuRef = ref(database, "data menu");

      const dataToSend = {
        nama: namaProduct,
        harga: hargaProduct,
        stok: stokProduct,
        variant: variantProduct,
        namaImage: imageFileName,
        imageUrl: downloadURL,
      };

      await push(menuRef, dataToSend);

      console.log("Data berhasil ditambahkan ke Realtime Database.");
      clearInput();
    } catch (error) {
      console.error("Terjadi kesalahan saat menambahkan data:", error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      if (!id) {
        console.error("ID tidak boleh kosong.");
        return;
      }

      const menuRef = ref(database, `data menu/${id}/`);

      const dataToSend = {
        nama: namaProduct,
        harga: hargaProduct,
        stok: stokProduct,
        variant: variantProduct,
      };

      await update(menuRef, dataToSend);

      console.log("Data berhasil diupdate di Realtime Database.");

      clearInput();
    } catch (error) {
      console.error("Terjadi kesalahan saat mengupdate data:", error);
    }
  };

  const handleEdit = async (nama, harga, stok, id, variant) => {
    setNamaProduct(nama);
    setHargaProduct(harga);
    setStokProduct(stok);
    setVariantProduct(variant);
    setId(id);
    setShow(true);
  };

  const handleDelete = async (id, image) => {
    try {
      if (!id) {
        console.error("ID tidak boleh kosong.");
        return;
      }

      const storRef = storageRef(storage, `images/${image}`);
      const menuRef = ref(database, `data menu/${id}`);

      // Menghapus data dari database
      await deleteObject(storRef);
      await remove(menuRef);

      console.log("Data berhasil dihapus dari Realtime Database.");
    } catch (error) {
      console.error("Terjadi kesalahan saat menghapus data:", error);
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
    <Dashboard>
      <div>
        <form className="row" onSubmit={handleSubmit}>
          <div className="col-md-6">
            <label htmlFor="namaProduct form-label">Nama product</label>
            <input
              type="text"
              placeholder="Masukkan nama product"
              id="namaProduct"
              value={namaProduct}
              onChange={(e) => setNamaProduct(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <div className="col-md-6 form-label">
            <label htmlFor="hargaProduct">Harga</label>
            <input
              type="number"
              placeholder="Masukkan Harga product"
              id="hargaProduct"
              value={hargaProduct}
              onChange={(e) => setHargaProduct(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <div className="col-md-6 form-label">
            <label htmlFor="stokProduct">Stok</label>
            <input
              type="number"
              placeholder="Masukkan Stok product"
              id="stokProduct"
              value={stokProduct}
              onChange={(e) => setStokProduct(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <div className="col-md-6 form-label">
            <label htmlFor="stokProduct">Variant</label>
            <input
              type="text"
              placeholder="Masukkan Variant product"
              id="stokProduct"
              value={variantProduct}
              onChange={(e) => setVariantProduct(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <div className="col-md-6 form-label">
            <label htmlFor="gambarProduct">Gambar product</label>
            <input
              type="file"
              accept="image/*"
              id="gambarProduct"
              onChange={(e) => {
                setSelectedImage(e.target.files[0]);
              }}
              className="form-control"
              required
            />
          </div>
          <div>
            {show ? (
              <button className="btn btn-primary" onClick={handleUpdate}>
                update
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleSubmit}>
                Input Data
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">No</th>
              <th scope="col">Nama</th>
              <th scope="col">Harga</th>
              <th scope="col">Stok</th>
              <th scope="col">Variant</th>
              <th scope="col">Image</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {dataMenu.map((data, i) => (
              <tr key={data.id}>
                <th scope="row"> {i + 1} </th>
                <th> {data.nama} </th>
                <td>{formatToIDR(data.harga)}</td>
                <td>{data.stok}</td>
                <td>{data.variant}</td>
                <td>
                  <img src={data.imageUrl} alt="" width={100} />
                </td>
                <td>
                  <button
                    className="btn btn-info"
                    onClick={() => {
                      handleEdit(
                        data.nama,
                        data.harga,
                        data.stok,
                        data.id,
                        data.variant
                      );
                    }}
                  >
                    edit
                  </button>
                  <button
                    className="btn btn-danger"
                    data-bs-toggle="modal"
                    data-bs-target={`#konfir${data.id}`}
                  >
                    delete
                  </button>

                  <div
                    className="modal fade"
                    id={`konfir${data.id}`}
                    tabindex="-1"
                    aria-labelledby="exampleModalLabel"
                    aria-hidden="true"
                  >
                    <div className="modal-dialog modal-dialog-centered">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h1
                            className="modal-title fs-5"
                            id={`konfir${data.id}`}
                          >
                            Konfirmasi
                          </h1>
                          <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                          ></button>
                        </div>
                        <div className="modal-body">
                          ingin Menghapus data menu tersebut??
                        </div>
                        <div className="modal-footer">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            data-bs-dismiss="modal"
                          >
                            tidak
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary"
                            data-bs-dismiss="modal"
                            onClick={() =>
                              handleDelete(data.id, data.namaImage)
                            }
                          >
                            Ya
                          </button>
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

export default ListMenu;
