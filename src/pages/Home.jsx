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

  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState("");

  const [apiDoc, setApiDoc] = useState(null);
  const [activeFileName, setActiveFileName] = useState("");

  const [fileSearch, setFileSearch] = useState("");

  const BASE_URL = "/api";

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
      await axios.delete(`${BASE_URL}/v1/partner/create-client/${id}`);
      setPartners(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  /* ================= EDIT PARTNER ================= */
  const handleEditPartner = (updatedPartner) => {
    setPartners(prev =>
      prev.map(p => (p.id === updatedPartner.id ? updatedPartner : p))
    );
  };

  /* ================= FILE UPLOAD ================= */
  const handleUpload = async () => {
    if (!selectedFile || !selectedPartner) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("partner-name", selectedPartner);

    try {
      await axios.post(`${BASE_URL}/swagger-docs`, formData);

      const docsRes = await axios.get(`${BASE_URL}/swagger-docs`);
      setDocuments(docsRes.data || []);

      setUploadOpen(false);
      setSelectedFile(null);
      setSelectedPartner("");
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed");
    }
  };

  /* ================= DELETE DOCUMENT ================= */
  const handleDeleteDocument = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/swagger-docs/${id}`);
      setDocuments(prev => prev.filter(d => d.id !== id));
      if (apiDoc && apiDoc.id === id) {
        setApiDoc(null);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  /* ================= VIEW DOCUMENT ================= */
const handleDocumentClick = async (doc) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/swagger-docs/${doc.id}/details`
    );

    setApiDoc({
      ...res.data,
      partnerName: doc.partnerName
    });

  } catch (err) {
    console.error("Failed to load document:", err);
  }
};
  /* ================= FILTER DOCUMENTS ================= */
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) =>
      doc.title?.toLowerCase().includes(fileSearch.toLowerCase())
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

          <button
            className="upload-btn"
            onClick={() => setUploadOpen(true)}
          >
            Upload File
          </button>
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
              <th>Partner</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((doc) => (
              <tr key={doc.id}>
                <td
                  className="clickable"
                  onClick={() =>
                    handleDocumentClick(doc)
                  }
                >
                  {doc.title}
                </td>
                <td>{doc.id}</td>
                <td>{doc.partnerName}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteDocument(doc.id)}
                  >
                    Delete
                  </button>
                </td>
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

      {/* ================= UPLOAD DIALOG ================= */}
<Dialog
  open={uploadOpen}
  onClose={() => setUploadOpen(false)}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle style={{ fontWeight: 600 }}>
    Upload API Document
  </DialogTitle>

  <DialogContent>

    {/* FILE UPLOAD AREA */}
    <div className="upload-box">
      <label className="custom-file-upload">
        <input
          type="file"
          accept=".json,.yaml,.yml"
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />
        Choose File
      </label>

      <div className="file-name">
        {selectedFile?.name || "No file selected"}
      </div>
    </div>

    {/* PARTNER SELECT */}
    <div className="partner-select-wrapper">
      <label className="input-label">Select Partner</label>
      <select
        className="partner-select"
        value={selectedPartner}
        onChange={(e) => setSelectedPartner(e.target.value)}
      >
        <option value="">Select Partner</option>
        {partners.map((p) => (
          <option key={p.id} value={p.partnerType}>
            {p.partnerType}
          </option>
        ))}
      </select>
    </div>

    {/* PREVIEW BLOCK */}
    <div className="upload-preview">
      <div>
        <strong>Selected File:</strong>
        <span> {selectedFile?.name || "-"}</span>
      </div>

      <div>
        <strong>Selected Partner:</strong>
        <span> {selectedPartner || "-"}</span>
      </div>
    </div>

  </DialogContent>

  <DialogActions style={{ padding: "16px 24px" }}>
    <Button
      onClick={() => setUploadOpen(false)}
      style={{ color: "#1976d2" }}
    >
      Cancel
    </Button>

    <Button
      variant="contained"
      disabled={!selectedFile || !selectedPartner}
      onClick={handleUpload}
      style={{
        backgroundColor: "#1976d2",
        textTransform: "none",
        padding: "6px 20px",
        borderRadius: "8px"
      }}
    >
      Upload
    </Button>
  </DialogActions>
</Dialog>

    </div>
  );
};

export default Home;