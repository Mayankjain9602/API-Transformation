import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

const API_BASE = "http://localhost:8080";

const PartnerDialog = ({ onClose }) => {
  const [partnerType, setPartnerType] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [port, setPort] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!partnerType || !ipAddress || !port) {
      alert("All fields are required");
      return;
    }

    if (isNaN(port)) {
      alert("Port must be a number");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/partner/create-client`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partnerType,
            ipAddress,
            port: Number(port),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create partner");
      }

      alert("Partner created successfully");

      // ONLY close dialog. Home will refresh list.
      onClose();

    } catch (err) {
      alert(err.message || "Error creating partner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Partner</DialogTitle>

      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        <TextField
          label="Partner Type"
          value={partnerType}
          onChange={(e) => setPartnerType(e.target.value)}
          fullWidth
        />

        <TextField
          label="IP Address"
          value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
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