import React from "react";

const Modal = ({ title, children, onSave, onClose }) => {
  return (
    <div className="modal fade" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5">{title}</h1>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">{children}</div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              onClick={onClose}
            >
              Batal
            </button>
            <button type="button" className="btn btn-primary" onClick={onSave}>
              Konfirmasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
