import { useState } from "react";

const PartnerDialog = ({ initialData, onSave, onClose }) => {
  const [form, setForm] = useState(
    initialData || {
      name: "",
      url: "",
      method: "GET",
      headers: "",
      payload: "",
      files: [], //DATA MODEL 
    },
  );

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // clear error on typing
  };


//TEXT FILE UPLOAD
const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        files: [
          ...(prev.files || []),
          {
            fileId: Date.now().toString() + Math.random().toString(36).slice(2),
            fileName: file.name,
            content: reader.result, // TEXT CONTENT
          },
        ],
      }));
    };

    reader.readAsText(file); //READ AS TEXT
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      setError("Partner name is required");
      return; //stop save
    }

    onSave(form); // valid save
  };

  return (
    <div className="dialog-backdrop">
      <div className="partner-dialog">
        <h2>{initialData ? "Edit Partner" : "Add Partner"}</h2>

        {/* Partner Name */}
        <div className="field">
          <label>Partner Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your Partner Name"
          />
        </div>

        {/* URL + Method */}
        <div className="row">
          <div className="field">
            <label>Base URL</label>
            <input
              name="url"
              value={form.url}
              onChange={handleChange}
              placeholder=" "
            />
          </div>

          <div className="field method">
            <label>Method</label>
            <select name="method" value={form.method} onChange={handleChange}>
              <option>GET</option>
              <option>POST</option>
              <option>PATCH</option>
              <option>DELETE</option>
            </select>
          </div>
        </div>

        {/* Headers */}
        <div className="field">
          <label>Headers</label>
          <textarea
            name="headers"
            value={form.headers}
            onChange={handleChange}
            placeholder=" "
          />
        </div>

        {/* Payload */}
        <div className="field">
          <label>Payload</label>
          <textarea
            name="payload"
            value={form.payload}
            onChange={handleChange}
            placeholder=" "
          />
        </div>

        {/* Error */}
        {error && <p className="form-error">{error}</p>}

        {/* Actions */}
        <div className="dialog-actions">
          <button className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="primary" onClick={handleSave}>
            Save Partner
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerDialog;
