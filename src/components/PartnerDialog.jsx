import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

const BASE_URL = "http://localhost:8080/api";

const PartnerDialog = ({
  open,
  handleClose,
  refreshPartners,
  editingPartner,
  onEdit
}) => {
  const [partnerType, setPartnerType] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [port, setPort] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= PREFILL FORM IN EDIT MODE ================= */
  useEffect(() => {
    if (editingPartner) {
      setPartnerType(editingPartner.partnerType || "");
      setIpAddress(editingPartner.ipAddress || "");
      setPort(editingPartner.port || "");
    } else {
      setPartnerType("");
      setIpAddress("");
      setPort("");
    }
  }, [editingPartner, open]);

  /* ================= SAVE HANDLER ================= */
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
      /* ================= EDIT MODE ================= */
      if (editingPartner) {
        const response = await fetch(
          `${BASE_URL}/v1/partner/${editingPartner.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              partnerType,
              ipAddress,
              port: Number(port),
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update partner");
        }

        onEdit({
          id: editingPartner.id,
          partnerType,
          ipAddress,
          port: Number(port),
        });

      } else {
        /* ================= CREATE MODE ================= */
        const response = await fetch(
          `${BASE_URL}/v1/partner/create-client`,
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

        refreshPartners({
          id: Date.now(), // temporary id for frontend
          partnerType,
          ipAddress,
          port: Number(port),
        });
      }

      handleClose();

    } catch (err) {
      console.error(err);
      alert("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {editingPartner ? "Edit Partner" : "Add Partner"}
      </DialogTitle>

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
        <Button onClick={handleClose}>Cancel</Button>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
        >
          {loading
            ? editingPartner
              ? "Updating..."
              : "Saving..."
            : editingPartner
            ? "Update Partner"
            : "Save Partner"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PartnerDialog;