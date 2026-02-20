const methodColors = {
  GET: "#93BFC7",
  POST: "#ABE7B2",
  DELETE: "#f2a6a6",
  PATCH: "#f2d096",
};

const PartnerCard = ({ partner, onEdit, onDelete }) => {
  return (
    <div className="partner-card">
      <h2>{partner.name}</h2>

      <p>
        <strong>Base URL:</strong> {partner.url}
      </p>

      <span
        className="method"
        style={{ background: methodColors[partner.method] }}
      >
        {partner.method}
      </span>

      <pre>
        <strong>Headers:</strong>
        {JSON.stringify(partner.headers, null, 2)}
      </pre>
      <pre>
        <strong>Payload:</strong>
        {partner.payload}
      </pre>

      <div className="actions">
        <button onClick={onEdit}>✏️ Edit</button>
        <button onClick={onDelete}>🗑 Delete</button>
      </div>
    </div>
  );
};

export default PartnerCard;
