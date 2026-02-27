import { useState, useMemo, useEffect } from "react";
import PartnerDialog from "../components/PartnerDialog";
import ApiDocumentViewer from "../components/ApiDocumentViewer";
import { uploadSwaggerDocument } from "../services/uploadService";
import { adaptBackendDocument } from "../utils/api/adaptBackendDocument";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

import "../styles/home.css";

const API_BASE = "http://localhost:8080";

const Home = () => {
  const [partners, setPartners] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editData, setEditData] = useState(null);

  const [search, setSearch] = useState("");
  const [fileSearch, setFileSearch] = useState("");

  const [apiDoc, setApiDoc] = useState(null);
  const [activeFileName, setActiveFileName] = useState("");
  const [activeDocId, setActiveDocId] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // ================= FETCH PARTNERS FROM BACKEND
  const fetchPartners = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/partner/get-all`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch partners");
      }

      const data = await response.json();
      setPartners(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  // ================= DELETE PARTNER
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this partner?")) return;

    try {
      await fetch(`${API_BASE}/api/v1/partner/delete/${id}`, {
        method: "DELETE",
      });

      fetchPartners();
    } catch (err) {
      alert("Delete failed");
    }
  };

  // ================= FILE SELECT
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setConfirmOpen(true);
    e.target.value = "";
  };

  // ================= CONFIRM UPLOAD
  const handleConfirmUpload = async () => {
    if (!selectedFile) return;

    try {
      const apiResponse = await uploadSwaggerDocument(selectedFile);

      setDocuments((prev) => [
        ...prev,
        {
          fileId: apiResponse.id,
          fileName: selectedFile.name,
        },
      ]);

      alert("Upload successful. Document ID: " + apiResponse.id);
    } catch (error) {
      alert(error.message || "Upload failed.");
    }

    setConfirmOpen(false);
    setSelectedFile(null);
  };

  // ================= TOGGLE DOCUMENT
  const handleDocumentClick = async (id, fileName) => {
    if (activeDocId === id) {
      setActiveDocId(null);
      setApiDoc(null);
      setActiveFileName("");
      return;
    }

    try {
      setActiveDocId(id);

      const response = await fetch(
        `${API_BASE}/api/swagger-docs/${id}/details`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch document details");
      }

      const data = await response.json();
      const normalized = adaptBackendDocument(data);

      setApiDoc(normalized);
      setActiveFileName(fileName);
    } catch (err) {
      alert(err.message || "Error loading document");
    }
  };

  // ================= FILTERS
  const filteredPartners = useMemo(() => {
    return partners.filter((p) =>
      p.partnerType?.toLowerCase().includes(search.toLowerCase())
    );
  }, [partners, search]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((d) =>
      d.fileName.toLowerCase().includes(fileSearch.toLowerCase())
    );
  }, [documents, fileSearch]);

  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <h1>Home Page</h1>

        <div style={{ display: "flex", gap: "12px" }}>
          <button className="primary-btn" onClick={() => setOpenDialog(true)}>
            + Add Partner
          </button>

          <label className="upload-btn">
            Upload File
            <input type="file" hidden onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      <input
        className="search"
        placeholder="Search Partner..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Partner Type</th>
              <th>IP Address</th>
              <th>Port</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPartners.map((p) => (
              <tr key={p.id}>
                <td>{p.partnerType}</td>
                <td>{p.ipAddress}</td>
                <td>{p.port}</td>
                <td>
                  <button
                    className="icon-btn danger"
                    onClick={() => handleDelete(p.id)}
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openDialog && (
        <PartnerDialog
          onClose={() => {
            setOpenDialog(false);
            fetchPartners(); // 🔥 refresh after save
          }}
        />
      )}
    </div>
  );
};

export default Home;