import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

import PartnerDialog from "../components/PartnerDialog";
import ApiDocumentViewer from "../components/ApiDocumentViewer";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

import "./Home.css";

const Home = () => {
  const [partners, setPartners] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [apiDoc, setApiDoc] = useState(null);
  const [activeFileName, setActiveFileName] = useState("");

  const [fileSearch, setFileSearch] = useState("");

  const BASE_URL = "http://localhost:8080/api";

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const loadData = async () => {
      try {
        const [partnersRes, docsRes] = await Promise.all([
          axios.get(`${BASE_URL}/v1/partner/create-client`),
          axios.get(`${BASE_URL}/swagger-docs`)
        ]);

        setPartners(partnersRes.data || []);
        setDocuments(docsRes.data || []);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    };

    loadData();
  }, []);

  /* ================= DELETE PARTNER ================= */
const handleDeletePartner = async (id) => {
  try {
    await axios.delete(
      `http://localhost:8080/api/v1/partner/create-client/${id}`
    );

    setPartners(prev => prev.filter(p => p.id !== id));

  } catch (err) {
    console.error("Delete failed:", err);
    alert("Delete failed");
  }
};
  /* ================= EDIT PARTNER (UPDATE STATE AFTER PATCH) ================= */
  const handleEditPartner = (updatedPartner) => {
    setPartners(prev =>
      prev.map(p =>
        p.id === updatedPartner.id ? updatedPartner : p
      )
    );
  };

  /* ================= FILE UPLOAD ================= */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setConfirmOpen(true);
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await axios.post(
        `${BASE_URL}/swagger-docs/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const docsRes = await axios.get(`${BASE_URL}/swagger-docs`);
      setDocuments(docsRes.data || []);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Check backend.");
    } finally {
      setConfirmOpen(false);
      setSelectedFile(null);
    }
  };

  /* ================= VIEW DOCUMENT ================= */
  const handleDocumentClick = async (fileId, fileName) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/swagger-docs/${fileId}/details`
      );

      setApiDoc(res.data);
      setActiveFileName(fileName);
    } catch (err) {
      console.error("Failed to load document:", err);
    }
  };

  /* ================= FILTER DOCUMENTS ================= */
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) =>
      doc.fileName?.toLowerCase().includes(fileSearch.toLowerCase())
    );
  }, [documents, fileSearch]);

  return (
    <div className="home-container">

      {/* ================= TOP BAR ================= */}
      <div className="top-bar">
        <h1 className="page-title">Home Page</h1>

        <div className="top-actions">
          <button
            className="primary-btn"
            onClick={() => {
              setEditingPartner(null);
              setOpenDialog(true);
            }}
          >
            + Add Partner
          </button>

          <label className="upload-btn">
            Upload File
            <input
              type="file"
              accept=".json,.yaml,.yml,.txt"
              hidden
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>

      {/* ================= PARTNER TABLE ================= */}
      <div className="section-card">
        <table className="styled-table">
          <thead>
            <tr>
              <th>Partner Type</th>
              <th>IP Address</th>
              <th>Port</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((partner) => (
              <tr key={partner.id}>
                <td>{partner.partnerType}</td>
                <td>{partner.ipAddress}</td>
                <td>{partner.port}</td>
                <td>
                  <button
                    className="action-btn"
                    onClick={() => {
                      setEditingPartner(partner);
                      setOpenDialog(true);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDeletePartner(partner.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= FILE SEARCH ================= */}
      <input
        type="text"
        className="search-input"
        placeholder="Search File..."
        value={fileSearch}
        onChange={(e) => setFileSearch(e.target.value)}
      />

      {/* ================= FILE TABLE ================= */}
      <div className="section-card">
        <table className="styled-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Unique ID</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((doc) => (
              <tr key={doc.fileId}>
                <td
                  className="clickable"
                  onClick={() =>
                    handleDocumentClick(doc.fileId, doc.fileName)
                  }
                >
                  {doc.fileName}
                </td>
                <td>{doc.fileId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= DOCUMENT DETAILS ================= */}
      {apiDoc && (
        <div className="section-card">
          <h2>Document Details</h2>
          <ApiDocumentViewer doc={apiDoc} />
        </div>
      )}

      {/* ================= PARTNER DIALOG ================= */}
      <PartnerDialog
        open={openDialog}
        handleClose={() => {
          setOpenDialog(false);
          setEditingPartner(null);
        }}
        refreshPartners={(newPartner) =>
          setPartners(prev => [...prev, newPartner])
        }
        editingPartner={editingPartner}
        onEdit={handleEditPartner}
      />

      {/* ================= CONFIRM UPLOAD DIALOG ================= */}
      <Dialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setSelectedFile(null);
        }}
      >
        <DialogTitle>Confirm Upload</DialogTitle>

        <DialogContent>
          Upload file "{selectedFile?.name}" ?
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setConfirmOpen(false);
              setSelectedFile(null);
            }}
          >
            Cancel
          </Button>

          <Button variant="contained" onClick={handleConfirmUpload}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default Home;