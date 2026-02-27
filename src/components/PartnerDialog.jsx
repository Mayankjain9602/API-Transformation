import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

const PartnerDialog = ({ onClose }) => {
  const [partnerName, setPartnerName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [port, setPort] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!partnerName || !baseUrl || !port) {
      alert("All fields are required");
      return;
    }

    if (isNaN(port)) {
      alert("Port must be a number");
      return;
    }

    // ✅ Ensure protocol exists
    let formattedBaseUrl = baseUrl.trim();

    if (
      !formattedBaseUrl.startsWith("http://") &&
      !formattedBaseUrl.startsWith("https://")
    ) {
      formattedBaseUrl = "http://" + formattedBaseUrl;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/v1/partner/create-partner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: partnerName.trim(),
          baseUrl: formattedBaseUrl,
          port: Number(port),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Backend error:", data);
        throw new Error(data.detail || "Failed to create partner");
      }

      alert("Partner created successfully");
      onClose();

    } catch (error) {
      console.error(error);
      alert(error.message || "Error creating partner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Partner</DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Partner Name"
          value={partnerName}
          onChange={(e) => setPartnerName(e.target.value)}
          fullWidth
        />

        <TextField
          label="Base URL"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          fullWidth
        />

        <TextField
          label="Port"
          value={port}
          onChange={(e) => setPort(e.target.value)}
          fullWidth
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Partner"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PartnerDialog;