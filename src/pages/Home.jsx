import { useState, useMemo } from "react";
import PartnerDialog from "../components/PartnerDialog";
import "swagger-ui-react/swagger-ui.css";
import "../styles/home.css";

import { parseFile } from "../utils/api/apiParser";
import { buildApiDocument } from "../utils/api/buildApiDocument";
import ApiDocumentViewer from "../components/ApiDocumentViewer";

import { uploadSwaggerDocument } from "../services/uploadService";

// MUI Confirmation Dialog
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

const Home = () => {
  // ================= STATE
  const [partners, setPartners] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editData, setEditData] = useState(null);

  const [search, setSearch] = useState("");
  const [fileSearch, setFileSearch] = useState("");

  const [apiDoc, setApiDoc] = useState(null);

  // ================= UPLOAD CONFIRMATION STATE
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // ================= DOCUMENT DETAILS STATE
  const [docId, setDocId] = useState("");
  const [activeFileName, setActiveFileName] = useState("");
  const [docError, setDocError] = useState("");

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

  // ================= UPLOAD FILE (OPEN CONFIRM DIALOG)
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
    // 1️⃣ Read file first
    const text = await selectedFile.text();

    // 2️⃣ Try parsing with your frontend parser
    const parsed = parseFile(text, selectedFile.name);
    buildApiDocument(parsed); // will throw if invalid

    // 3️⃣ Only now upload to backend
    const apiResponse = await uploadSwaggerDocument(selectedFile);

    setDocuments((prev) => [
      ...prev,
      {
        fileId: apiResponse.id,
        fileName: selectedFile.name,
        content: text,
        meta: apiResponse,
      },
    ]);

  } catch (error) {
    alert("Invalid OpenAPI file: " + error.message);
  }

  setConfirmOpen(false);
  setSelectedFile(null);
};

  // ================= LOAD DOCUMENT DETAILS
  const handleLoadDetails = () => {
    setDocError("");
    setApiDoc(null);
    setActiveFileName("");

    const doc = documents.find((d) => d.fileId === docId);

    if (!doc) {
      setDocError("Document not found");
      return;
    }

    try {
      const parsed = parseFile(doc.content, doc.fileName);
      const normalized = buildApiDocument(parsed);

      setApiDoc(normalized);
      setActiveFileName(doc.fileName);
    } catch (err) {
      setDocError(err.message || "Failed to process file");
    }
  };

  // ================= DELETE DOCUMENT
  const handleDeleteDocument = () => {
    if (!docId) return;

    if (window.confirm("Delete this document?")) {
      setDocuments((prev) => prev.filter((d) => d.fileId !== docId));
      setDocId("");
      setActiveFileName("");
      setApiDoc(null);
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
      {/* ================= HEADER */}
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

      {/* ================= SEARCH PARTNER */}
      <input
        className="search"
        placeholder="Search Partner..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ================= PARTNER TABLE */}
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

      {/* ================= SEARCH FILE */}
      <input
        className="search"
        placeholder="Search File..."
        value={fileSearch}
        onChange={(e) => setFileSearch(e.target.value)}
      />

      {/* ================= DOCUMENT LIST */}
      <div className="document-list">
        {filteredDocuments.map((d) => (
          <div key={d.fileId} className="document-card">
            <strong>{d.fileName}</strong>
            <p><strong>Document ID:</strong> {d.fileId}</p>
          </div>
        ))}
      </div>

      {/* ================= DOCUMENT ACTIONS */}
      <div className="doc-card">
        <div className="doc-card-header">
          <h3>Load API Document</h3>
          <p>Enter the uploaded document ID to view structured details.</p>
        </div>

        <div className="doc-card-body">
          <input
            className="doc-input-modern"
            placeholder="Enter Document UUID..."
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
          />

          <div className="doc-buttons">
            <button className="btn-primary" onClick={handleLoadDetails}>
              Load Details
            </button>

            <button
              className="btn-danger"
              onClick={handleDeleteDocument}
              disabled={!apiDoc}
            >
              Delete
            </button>
          </div>
        </div>

        {docError && <p className="error-modern">{docError}</p>}
      </div>

      {/* ================= API DOCUMENT VIEWER */}
      {apiDoc && (
        <div className="swagger-card">
          <h2>{activeFileName} Details</h2>
          <ApiDocumentViewer doc={apiDoc} />
        </div>
      )}

      {/* ================= MUI CONFIRMATION DIALOG */}
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

      {/* ================= PARTNER MODAL */}
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