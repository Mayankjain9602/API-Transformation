import { useState, useMemo } from "react";
import PartnerDialog from "../components/PartnerDialog";
// import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import "../styles/home.css";

// import { executeApi } from "../utils/api/apiExecutor";

import { parseFile } from "../utils/api/apiParser";
import { buildApiDocument } from "../utils/api/buildApiDocument";
import ApiDocumentViewer from "../components/ApiDocumentViewer";



const Home = () => {
  // ================= STATE
  const [partners, setPartners] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [editData, setEditData] = useState(null);

  const [search, setSearch] = useState("");
  const [fileSearch, setFileSearch] = useState("");

  const [apiDoc, setApiDoc] = useState(null);
  //const [error, setError] = useState(null);

  // ================= DOCUMENT DETAILS STATE
  const [docId, setDocId] = useState("");
  const [activeFileName, setActiveFileName] = useState("");
  // const [openApiSpec, setOpenApiSpec] = useState(null);
  const [docError, setDocError] = useState("");

  // ================= SAVE PARTNER
  const handleSave = (partner) => {
    if (editData) {
      setPartners((prev) =>
        prev.map((p) => (p.id === partner.id ? partner : p)),
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

  // ================= UPLOAD FILE (ANY TYPE)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setDocuments((prev) => [
        ...prev,
        {
          fileId: Date.now().toString() + Math.random().toString(36).slice(2),
          fileName: file.name,
          content: reader.result,
        },
      ]);
    };

    reader.readAsText(file);
    e.target.value = "";
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
      //      setOpenApiSpec(null);
      setActiveFileName("");
    }
  };

  // ================= FILTERS
  const filteredPartners = useMemo(() => {
    return partners.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [partners, search]);

  const filteredDocuments = useMemo(() => {
    return documents.filter((d) =>
      d.fileName.toLowerCase().includes(fileSearch.toLowerCase()),
    );
  }, [documents, fileSearch]);

  return (
    <div className="dashboard">
      {/* <pre style={{ background: "#000", color: "#0f0", padding: "8px" }}>
        apiDoc = {JSON.stringify(apiDoc, null, 2)}
      </pre> */}

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
            <p>Document ID: {d.fileId}</p>
          </div>
        ))}
      </div>

      {/* ================= DOCUMENT ACTIONS */}
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
