import { useState, useMemo } from "react";
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

  // ================= SAVE PARTNER
  const handleSave = (partner) => {
    if (editData) {
      setPartners((prev) =>
        prev.map((p) => (p.id === partner.id ? partner : p))
      );
    } else {
      setPartners((prev) => [...prev, { ...partner, id: Date.now() }]);
    }
    setOpenDialog(false);
    setEditData(null);
  };

  // ================= DELETE PARTNER
  const handleDelete = (id) => {
    if (window.confirm("Delete this partner?")) {
      setPartners((prev) => prev.filter((p) => p.id !== id));
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
        `http://localhost:8080/api/swagger-docs/${id}/details`
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
      p.name.toLowerCase().includes(search.toLowerCase())
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
              <th>Partner</th>
              <th>Base URL</th>
              <th>Method</th>
              <th>Payload</th>
              <th>Header</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPartners.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.url || "-"}</td>
                <td>{p.method}</td>
                <td>{p.payload || "-"}</td>
                <td>{p.headers || "-"}</td>
                <td>
                  <button
                    className="icon-btn"
                    onClick={() => {
                      setEditData(p);
                      setOpenDialog(true);
                    }}
                  >
                    ✏️
                  </button>
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

      <input
        className="search"
        placeholder="Search File..."
        value={fileSearch}
        onChange={(e) => setFileSearch(e.target.value)}
      />

      <div className="document-list">
        {filteredDocuments.map((d) => (
          <div
            key={d.fileId}
            className="document-card"
            onClick={() => handleDocumentClick(d.fileId, d.fileName)}
            style={{
              cursor: "pointer",
              border:
                activeDocId === d.fileId
                  ? "2px solid #4f46e5"
                  : "1px solid #ddd",
            }}
          >
            <strong>{d.fileName}</strong>
            <p>
              <strong>Document ID:</strong> {d.fileId}
            </p>
          </div>
        ))}
      </div>

      {apiDoc && (
        <div className="swagger-card">
          <h2>{activeFileName} Details</h2>
          <ApiDocumentViewer doc={apiDoc} />
        </div>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Upload</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to upload "{selectedFile?.name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmUpload}
            variant="contained"
            color="primary"
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {openDialog && (
        <PartnerDialog
          initialData={editData}
          onSave={handleSave}
          onClose={() => {
            setOpenDialog(false);
            setEditData(null);
          }}
        />
      )}
    </div>
  );
};

export default Home;