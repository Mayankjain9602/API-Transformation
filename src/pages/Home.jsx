import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

import PartnerDialog from "../components/PartnerDialog";
import ApiDocumentViewer from "../components/ApiDocumentViewer";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

import "./Home.css";

const Home = () => {
  const [partners, setPartners] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [apiDoc, setApiDoc] = useState(null);
  const [activeFileName, setActiveFileName] = useState("");

  const [fileSearch, setFileSearch] = useState("");

  const BASE_URL = "http://localhost:8080/api";

  /* ---------------- FETCH PARTNERS ---------------- */
  const fetchPartners = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/partners`);
      setPartners(res.data || []);
    } catch (err) {
      console.error("Failed to fetch partners:", err);
    }
  };

  /* ---------------- FETCH DOCUMENTS ---------------- */
  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/swagger-docs`);
      setDocuments(res.data || []);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  };

useEffect(() => {
  const loadData = async () => {
    try {
      const [partnersRes, docsRes] = await Promise.all([
        axios.get(`${BASE_URL}/partners`),
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

  /* ---------------- FILE UPLOAD ---------------- */
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setConfirmOpen(true);
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await axios.post(`${BASE_URL}/swagger-docs/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      fetchDocuments();
      setSelectedFile(null);
      setConfirmOpen(false);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  /* ---------------- VIEW DOCUMENT ---------------- */
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

  /* ---------------- FILTER DOCUMENTS ---------------- */
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) =>
      doc.fileName?.toLowerCase().includes(fileSearch.toLowerCase())
    );
  }, [documents, fileSearch]);

  return (
    <div className="home-container">
      <h1 className="page-title">Dashboard</h1>

      {/* ================= PARTNERS SECTION ================= */}
      <div className="section-card">
        <div className="section-header">
          <h2>Partners</h2>
          <button
            className="primary-btn"
            onClick={() => setOpenDialog(true)}
          >
            + Add Partner
          </button>
        </div>

        <table className="styled-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((partner) => (
              <tr key={partner.id}>
                <td>{partner.name}</td>
                <td>{partner.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= DOCUMENTS SECTION ================= */}
      <div className="section-card">
        <div className="section-header">
          <h2>Uploaded API Documents</h2>
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

        <input
          type="text"
          className="search-input"
          placeholder="Search files..."
          value={fileSearch}
          onChange={(e) => setFileSearch(e.target.value)}
        />

        <table className="styled-table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((doc) => (
              <tr key={doc.fileId}>
                <td>{doc.fileName}</td>
                <td>
                  <button
                    className="primary-btn"
                    onClick={() =>
                      handleDocumentClick(doc.fileId, doc.fileName)
                    }
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= API VIEWER ================= */}
      {apiDoc && (
        <div className="section-card">
          <h2>{activeFileName}</h2>
          <ApiDocumentViewer doc={apiDoc} />
        </div>
      )}

      {/* ================= PARTNER DIALOG ================= */}
      {openDialog && (
        <PartnerDialog
          open={openDialog}
          handleClose={() => setOpenDialog(false)}
          refreshPartners={fetchPartners}
        />
      )}

      {/* ================= CONFIRM UPLOAD DIALOG ================= */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Upload</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Upload file "{selectedFile?.name}" ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirmUpload}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Home;